import React, { useRef } from 'react';
import './mandatoryFields.css';
import { Row, Col } from 'antd';
import MandatoryFieldCard from '../../../../components/Card/MandatoryField/MandatoryField';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import PrimaryButton from '../../../../components/Button/Primary';
import { useGetAllTaxonomyQuery } from '../../../../services/taxonomy';
import { taxonomyClass } from '../../../../constants/taxonomyClass';
import { entitiesClass } from '../../../../constants/entitiesClass';
// import { useUpdateCalendarMutation } from '../../../../services/calendar';

function MandatoryFields() {
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();
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
  // const { updateCalendar } = useUpdateCalendarMutation();

  let fields = currentCalendarData?.forms;
  const prefilledFields = [
    {
      formName: 'Event',
      formLabel: t('dashboard.settings.mandatoryFields.event'),
      taxonomyClass: entitiesClass.event,
      prefilledFields: ['name', 'startDateTime', 'startDate', 'endDateTime', 'endDate', 'locationId'],
    },
    {
      formName: 'Places',
      formLabel: t('dashboard.settings.mandatoryFields.place'),
      taxonomyClass: entitiesClass.place,

      prefilledFields: ['name', 'streetAddress', 'postalCode'],
    },
    {
      formName: 'Organization',
      formLabel: t('dashboard.settings.mandatoryFields.organization'),
      taxonomyClass: entitiesClass.organization,

      prefilledFields: ['name'],
    },
    {
      formName: 'People',
      formLabel: t('dashboard.settings.mandatoryFields.person'),
      taxonomyClass: entitiesClass.person,

      prefilledFields: ['name'],
    },
  ];

  fields = fields?.map((field) => {
    const preFilled = prefilledFields?.find((f) => f.formName === field?.formName);
    let modifiedField = field?.formFields?.map((f) => {
      return {
        ...f,
        preFilled: preFilled?.prefilledFields.includes(f?.mappedField),
      };
    });
    modifiedField = modifiedField?.concat(
      allTaxonomyData?.data
        ?.filter((f) => f?.taxonomyClass === preFilled?.taxonomyClass && f?.isDynamicField)
        ?.map((f) => {
          return {
            mappedField: f?.id,
            preFilled: false,
            isRequiredField: field?.requireFields?.includes(f?.id) || false,
            isAdminOnlyField: field?.adminOnlyFields?.includes(f?.id) || false,
            isDynamicField: true,
            name: f?.name,
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
    updatedFormFields = updatedFormFields?.map((f) => {
      return {
        formName: f.formName,
        formFields: f.formFields,
        requiredFields: f.formFields
          ?.map((field) => {
            if (field.isRequiredField) {
              return field.mappedField;
            }
          })
          ?.filter((element) => element !== undefined),
        adminOnlyFields: f.formFields
          ?.map((field) => {
            if (field.isAdminOnlyField) {
              return field.mappedField;
            }
          })
          ?.filter((element) => element !== undefined),
      };
    });
    console.log({ updatedFormFields });

    // updateCalendar({ data: { forms: updatedFormFields }, calendarId: currentCalendarData?.id })
    //   .unwrap()
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  return (
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
              {fields.map((field, index) => (
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
