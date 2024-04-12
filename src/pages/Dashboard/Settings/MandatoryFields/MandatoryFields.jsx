import React, { useRef } from 'react';
import './mandatoryFields.css';
import { Row, Col, notification, Button, message } from 'antd';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import MandatoryFieldCard from '../../../../components/Card/MandatoryField/MandatoryField';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import PrimaryButton from '../../../../components/Button/Primary';
import { useGetAllTaxonomyQuery } from '../../../../services/taxonomy';
import { taxonomyClass } from '../../../../constants/taxonomyClass';
import { entitiesClass } from '../../../../constants/entitiesClass';
import { useUpdateCalendarMutation } from '../../../../services/calendar';

function MandatoryFields() {
  const { t } = useTranslation();
  const [currentCalendarData, , , getCalendar] = useOutletContext();
  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;

  let query = new URLSearchParams();
  query.append('taxonomy-class', taxonomyClass.ORGANIZATION);
  query.append('taxonomy-class', taxonomyClass.PERSON);
  query.append('taxonomy-class', taxonomyClass.PLACE);
  query.append('taxonomy-class', taxonomyClass.EVENT);
  const { currentData: allTaxonomyData } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    filters: decodeURIComponent(query.toString()),
    includeConcepts: false,
    sessionId: timestampRef,
  });
  const [updateCalendar] = useUpdateCalendarMutation();

  let fields = currentCalendarData?.forms;
  const prefilledFields = [
    {
      formName: 'Event',
      formLabel: t('dashboard.settings.mandatoryFields.event'),
      taxonomyClass: entitiesClass.event,
      // prefilledFields: ['name', 'startDateTime', 'startDate', 'endDateTime', 'endDate', 'locationId'],
    },
    {
      formName: 'Places',
      formLabel: t('dashboard.settings.mandatoryFields.place'),
      taxonomyClass: entitiesClass.place,

      // prefilledFields: ['name', 'streetAddress', 'postalCode'],
    },
    {
      formName: 'Organization',
      formLabel: t('dashboard.settings.mandatoryFields.organization'),
      taxonomyClass: entitiesClass.organization,

      // prefilledFields: ['name'],
    },
    {
      formName: 'People',
      formLabel: t('dashboard.settings.mandatoryFields.person'),
      taxonomyClass: entitiesClass.person,

      // prefilledFields: ['name'],
    },
  ];

  fields = fields?.map((field) => {
    const preFilled = prefilledFields?.find((f) => f.formName === field?.formName);
    let minimumRequiredFields = [],
      requiredFields = [];
    if (preFilled?.taxonomyClass === entitiesClass.event) {
      minimumRequiredFields =
        field?.formFieldProperties?.minimumRequiredFields?.standardFields?.map((f) => f?.fieldName) ?? [];
      minimumRequiredFields = minimumRequiredFields?.concat(
        field?.formFieldProperties?.minimumRequiredFields?.dynamicFields?.map((f) => f),
      );
      requiredFields = field?.formFieldProperties?.mandatoryFields?.standardFields?.map((f) => f?.fieldName) ?? [];
      requiredFields = minimumRequiredFields?.concat(
        field?.formFieldProperties?.mandatoryFields?.dynamicFields?.map((f) => f),
      );
    } else {
      minimumRequiredFields =
        field?.formFieldProperties?.mandatoryFields?.standardFields?.map((f) => f?.fieldName) ?? [];
      minimumRequiredFields = minimumRequiredFields?.concat(
        field?.formFieldProperties?.mandatoryFields?.dynamicFields?.map((f) => f),
      );
    }
    let modifiedField = field?.formFields?.map((f) => {
      return {
        ...f,
        preFilled: minimumRequiredFields.includes(f?.name),
        isRequiredField: requiredFields.includes(f?.name) || minimumRequiredFields.includes(f?.name),
      };
    });
    modifiedField = modifiedField?.concat(
      allTaxonomyData?.data
        ?.filter((f) => f?.taxonomyClass === preFilled?.taxonomyClass && f?.isDynamicField)
        ?.map((f) => {
          return {
            mappedField: f?.id,
            preFilled: false,
            isRequiredField: field?.formFieldProperties?.mandatoryFields?.dynamicFields?.includes(f?.id) || false,
            isAdminOnlyField: field?.formFieldProperties?.adminOnlyFields?.dynamicFields?.includes(f?.id) || false,
            isDynamicField: true,
            name: f?.id,
            label: f?.name,
          };
        }),
    );
    return {
      formName: field?.formName,
      formFields: modifiedField,
      formLabel: preFilled?.formLabel,
    };
  });

  let updatedFormFields = fields;

  const onSaveHandler = () => {
    updatedFormFields = updatedFormFields?.map((f, index) => {
      let formFieldProperties = {
        mandatoryFields: { standardFields: [], dynamicFields: [] },
      };
      f.formFields?.forEach((field) => {
        if (field.isRequiredField) {
          if (field.isDynamicField) formFieldProperties.dynamicFields.push(field?.name);
          else formFieldProperties.mandatoryFields.standardFields.push({ fieldName: field?.name });
        }
      });
      return {
        formName: f.formName,
        formFields: currentCalendarData?.forms[index]?.formFields,
        enableLabelFallback: currentCalendarData?.forms[index]?.enableLabelFallback,
        skipFallbackLabels: currentCalendarData?.forms[index]?.skipFallbackLabels,
        formFieldProperties: {
          mandatoryFields: formFieldProperties.mandatoryFields,
          adminOnlyFields: currentCalendarData?.forms[index]?.formFieldProperties.adminOnlyFields,
          minimumRequiredFields: currentCalendarData?.forms[index]?.formFieldProperties?.minimumRequiredFields,
        },
      };
    });

    let calendarData = {
      name: currentCalendarData.name,
      contentLanguage: currentCalendarData.contentLanguage,
      timezone: currentCalendarData.timezone,
      contact: currentCalendarData.contact,
      dateFormatDisplay: currentCalendarData.dateFormatDisplay,
      imageConfig: currentCalendarData.imageConfig,
      mode: currentCalendarData.mode,
      languageFallbacks: currentCalendarData?.languageFallbacks,
      forms: updatedFormFields,
      namespace: currentCalendarData?.namespace,
      widgetSettings: currentCalendarData.widgetSettings,
      filterPersonalization: currentCalendarData.filterPersonalization,
      logo: currentCalendarData.logo,
    };

    updateCalendar({ data: calendarData, calendarId: currentCalendarData.id })
      .unwrap()
      .then(() => {
        getCalendar({ id: calendarId, sessionId: timestampRef })
          .unwrap()
          .then(() => {
            notification.success({
              description: t('dashboard.settings.mandatoryFields.notifications.update'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((err) => {
        message.warning({
          duration: 10,
          maxCount: 1,
          key: 'mandatory-save-as-warning',
          content: (
            <>
              {t('common.validations.informationRequired')} &nbsp;
              <Button
                data-cy="button-place-save-as-warning"
                type="text"
                icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                onClick={() => message.destroy('mandatory-save-as-warning')}
              />
            </>
          ),
          icon: <ExclamationCircleOutlined />,
        });
        console.log(err);
      });
  };

  return (
    allTaxonomyData &&
    currentCalendarData && (
      <div style={{ paddingTop: '24px' }}>
        <Row gutter={[0, 18]} className="mandatory-fields-wrapper">
          <Col span={22}>
            <h5 className="mandatory-fields-heading" data-cy="heading5-mandatory-fields">
              {t('dashboard.settings.mandatoryFields.title')}
            </h5>
          </Col>
          <Col span={2}>
            <PrimaryButton
              label={t('dashboard.events.addEditEvent.saveOptions.save')}
              data-cy="button-save-mandatory-field"
              onClick={onSaveHandler}
            />
          </Col>
          <Col span={24}>
            <p className="mandatory-fields-description" data-cy="para-mandatory-fields-description">
              {t('dashboard.settings.mandatoryFields.description')}
            </p>
          </Col>
          <Col flex={'576px'}>
            <Row gutter={[8, 18]}>
              {fields?.map((field, index) => (
                <Col span={24} key={index}>
                  <MandatoryFieldCard
                    field={field?.formFields}
                    formName={field?.formLabel}
                    updatedFormFields={updatedFormFields}
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </div>
    )
  );
}

export default MandatoryFields;
