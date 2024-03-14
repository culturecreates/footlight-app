import React from 'react';
import { Row, Col } from 'antd';
import MandatoryFieldCard from '../../../../components/Card/MandatoryField/MandatoryField';
import { useTranslation } from 'react-i18next';

function MandatoryFields() {
  const { t } = useTranslation();

  return (
    <Row gutter={[0, 18]}>
      <Col span={24}>
        <h5> {t('dashboard.settings.calendarSettings.generalSettings')}</h5>
      </Col>
      <Col span={24}>
        <p>{t('dashboard.settings.calendarSettings.setUpCalendarDescription')}</p>
      </Col>
      <Col flex={'576px'}>
        <Row gutter={[8, 18]}>
          {[0, 1, 2, 3].map((_, index) => (
            <Col span={24} key={index}>
              <MandatoryFieldCard />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
}

export default MandatoryFields;
