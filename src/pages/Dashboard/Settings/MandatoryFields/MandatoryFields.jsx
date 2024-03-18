import React from 'react';
import './mandatoryFields.css';
import { Row, Col } from 'antd';
import MandatoryFieldCard from '../../../../components/Card/MandatoryField/MandatoryField';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import PrimaryButton from '../../../../components/Button/Primary';

function MandatoryFields() {
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();

  let fields = currentCalendarData?.forms;
  const prefilledFields = [
    {
      formName: 'Event',
      prefilledFields: ['name', 'startDateTime', 'startDate', 'endDateTime', 'endDate', 'locationId'],
    },
    {
      formName: 'Places',
      prefilledFields: ['name', 'streetAddress', 'postalCode'],
    },
    {
      formName: 'Organization',
      prefilledFields: ['name'],
    },
    {
      formName: 'People',
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
    return {
      formName: field?.formName,
      formFields: modifiedField,
    };
  });

  return (
    currentCalendarData && (
      <Row gutter={[0, 18]} className="mandatory-fields-wrapper">
        <Col span={22}>
          <h5 className="mandatory-fields-heading" data-cy="heading5-mandatory-fields">
            {t('dashboard.settings.calendarSettings.generalSettings')}
          </h5>
        </Col>
        <Col span={2}>
          <PrimaryButton
            label={t('dashboard.events.addEditEvent.saveOptions.save')}
            data-cy="button-save-mandatory-field"
          />
        </Col>
        <Col span={24}>
          <p className="mandatory-fields-description" data-cy="para-mandatory-fields-description">
            {t('dashboard.settings.calendarSettings.setUpCalendarDescription')}
          </p>
        </Col>
        <Col flex={'576px'}>
          <Row gutter={[8, 18]}>
            {fields.map((field, index) => (
              <Col span={24} key={index}>
                <MandatoryFieldCard field={field?.formFields} formName={field?.formName} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    )
  );
}

export default MandatoryFields;
