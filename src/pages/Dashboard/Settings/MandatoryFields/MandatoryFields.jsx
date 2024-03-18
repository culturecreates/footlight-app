import React from 'react';
import './mandatoryFields.css';
import { Row, Col } from 'antd';
import MandatoryFieldCard from '../../../../components/Card/MandatoryField/MandatoryField';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

function MandatoryFields() {
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();

  const fields = currentCalendarData?.forms;
  return (
    currentCalendarData && (
      <Row gutter={[0, 18]} className="mandatory-fields-wrapper">
        <Col span={24}>
          <h5 className="mandatory-fields-heading" data-cy="heading5-mandatory-fields">
            {t('dashboard.settings.calendarSettings.generalSettings')}
          </h5>
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
                <MandatoryFieldCard field={field?.formFields} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    )
  );
}

export default MandatoryFields;
