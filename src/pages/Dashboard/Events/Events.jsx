import React from 'react';
import './events.css';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';

// import EventList from '../../../components/Events/List';

function Events() {
  const { t } = useTranslation();

  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={18} style={{ backgroundColor: 'red' }}>
        <Row>
          <Col xs={2} sm={4} md={6} lg={8} xl={10}>
            <h4 className="events-heading">{t('dashboard.events.heading')}</h4>
          </Col>
        </Row>
        <Row>
          <Col xs={2} sm={4} md={6} lg={8} xl={10}>
            Search
          </Col>
        </Row>
        <Row>
          <Col xs={2} sm={4} md={6} lg={8} xl={10}>
            listing
          </Col>
        </Row>
      </Col>
      <Col span={4} offset={2}>
        col-6
      </Col>
    </Row>
  );
}

export default Events;
