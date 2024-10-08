import React, { useEffect, useRef, useState } from 'react';
import './mandatoryFields.css';
import { Row, Col, notification } from 'antd';
import MandatoryFieldCard from '../../../../components/Card/MandatoryField/MandatoryField';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import PrimaryButton from '../../../../components/Button/Primary';
import { useGetAllTaxonomyQuery } from '../../../../services/taxonomy';
import { taxonomyClass } from '../../../../constants/taxonomyClass';
import { entitiesClass } from '../../../../constants/entitiesClass';
import { useUpdateCalendarMutation } from '../../../../services/calendar';

function MandatoryFields({ setDirtyStatus, tabKey }) {
  const { t } = useTranslation();
  const [currentCalendarData, , , getCalendar, , , , refetch, ,] = useOutletContext();
  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const [updatedFormFields, setUpdatedFormFields] = useState([]);

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
      hiddenFields: ['VIRTUAL_LOCATION'],
    },
    {
      formName: 'Place',
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
      formName: 'Person',
      formLabel: t('dashboard.settings.mandatoryFields.person'),
      taxonomyClass: entitiesClass.person,
      // prefilledFields: ['name'],
    },
  ];

  useEffect(() => {
    if (allTaxonomyData && currentCalendarData) {
      const initializedFields = fields?.map((field) => {
        const preFilled = prefilledFields?.find((f) => f.formName === field?.formName);
        let minimumRequiredFields = [],
          requiredFields = [],
          standardAdminOnlyFields = [];
        minimumRequiredFields =
          field?.formFieldProperties?.minimumRequiredFields?.standardFields?.map((f) => f?.fieldName) ?? [];
        minimumRequiredFields = minimumRequiredFields?.concat(
          field?.formFieldProperties?.minimumRequiredFields?.dynamicFields?.map((f) => f),
        );
        requiredFields = field?.formFieldProperties?.mandatoryFields?.standardFields?.map((f) => f?.fieldName) ?? [];
        requiredFields = requiredFields?.concat(
          field?.formFieldProperties?.mandatoryFields?.dynamicFields?.map((f) => f),
        );
        standardAdminOnlyFields =
          field?.formFieldProperties?.adminOnlyFields?.standardFields?.map((f) => f?.fieldName) ?? [];

        let modifiedField = field?.formFields
          ?.map((f) => {
            if (preFilled?.hiddenFields?.includes(f?.name)) return null;
            else
              return {
                ...f,
                preFilled: minimumRequiredFields.includes(f?.name),
                isRequiredField: standardAdminOnlyFields?.includes(f?.name)
                  ? false
                  : requiredFields.includes(f?.name) || minimumRequiredFields.includes(f?.name),
                isAdminOnlyField: standardAdminOnlyFields?.includes(f?.name) || false,
                rule: field?.formFieldProperties?.mandatoryFields?.standardFields?.find(
                  (standardField) => f?.name === standardField?.fieldName,
                )?.rule,
              };
          })
          ?.filter((f) => f);
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
        modifiedField = modifiedField?.sort((a, b) => {
          if (a.preFilled && !b.preFilled) {
            return -1;
          } else if (!a.preFilled && b.preFilled) {
            return 1;
          } else {
            return 0;
          }
        });
        return {
          formName: field?.formName,
          formFields: modifiedField,
          formLabel: preFilled?.formLabel,
        };
      });
      setUpdatedFormFields(initializedFields);
    }
  }, [allTaxonomyData, currentCalendarData]);

  const onSaveHandler = () => {
    const savedFormFields = updatedFormFields?.map((f, index) => {
      let formFieldProperties = {
        mandatoryFields: { standardFields: [], dynamicFields: [] },
      };
      f.formFields?.forEach((field) => {
        if (field.isRequiredField) {
          if (field.isDynamicField) formFieldProperties.mandatoryFields.dynamicFields.push(field?.name);
          else
            formFieldProperties.mandatoryFields.standardFields.push({
              fieldName: field?.name,
              ...(field.rule && { rule: field.rule }), // Conditionally include rule key
            });
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
      forms: savedFormFields,
      namespace: currentCalendarData?.namespace,
      widgetSettings: currentCalendarData.widgetSettings,
      filterPersonalization: currentCalendarData.filterPersonalization,
    };
    if (currentCalendarData?.logo?.type == 'ImageObject')
      calendarData['logo'] = {
        original: {
          entityId: currentCalendarData?.logo?.original?.entityId,
          height: currentCalendarData?.logo?.original?.height,
          width: currentCalendarData?.logo?.original?.width,
        },
      };
    else
      calendarData = {
        ...calendarData,
        logo: {
          url: {
            uri: currentCalendarData?.logo?.original?.uri,
          },
        },
      };

    updateCalendar({ data: calendarData, calendarId: currentCalendarData.id })
      .unwrap()
      .then(() => {
        getCalendar({ id: calendarId, sessionId: timestampRef })
          .unwrap()
          .then(() => {
            notification.success({
              description: t('dashboard.settings.mandatoryFields.notification.update'),
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
        console.log(err);
      });
  };

  useEffect(() => {
    if (tabKey != '4') return;

    refetch();
  }, [tabKey]);

  return (
    allTaxonomyData &&
    currentCalendarData && (
      <div style={{ paddingTop: '24px' }}>
        <Row gutter={[0, 18]} className="mandatory-fields-wrapper">
          <Col span={24}>
            <Row justify={'space-between'}>
              <Col>
                <h5 className="mandatory-fields-heading" data-cy="heading5-mandatory-fields">
                  {t('dashboard.settings.mandatoryFields.title')}
                </h5>
              </Col>
              <Col>
                <PrimaryButton
                  label={t('dashboard.events.addEditEvent.saveOptions.save')}
                  data-cy="button-save-mandatory-field"
                  onClick={onSaveHandler}
                />
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <p className="mandatory-fields-description" data-cy="para-mandatory-fields-description">
              {t('dashboard.settings.mandatoryFields.description')}
            </p>
          </Col>
          <Col flex={'576px'}>
            <Row gutter={[8, 18]}>
              {updatedFormFields?.map((field, index) => (
                <Col span={24} key={index}>
                  <MandatoryFieldCard
                    field={field?.formFields}
                    formName={field?.formName}
                    formLabel={field?.formLabel}
                    updatedFormFields={updatedFormFields}
                    setUpdatedFormFields={setUpdatedFormFields}
                    setDirtyStatus={setDirtyStatus}
                    tabKey={tabKey}
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
