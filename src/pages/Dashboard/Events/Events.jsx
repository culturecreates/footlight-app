import React from 'react';
import './events.css';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import EventList from '../../../components/Events/List';

function Events() {
  const { t } = useTranslation();

  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={18} style={{ backgroundColor: 'red' }}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col xs={2} sm={4} md={6} lg={8} xl={10}>
            <h4 className="events-heading">{t('dashboard.events.heading')}</h4>
          </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col xs={24} sm={24} md={12} lg={10} xl={8}>
            <EventsSearch placeholder={t('dashboard.events.searchPlaceholder')} />
          </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} span={24}>
          <Col span={24}>
            {[0, 1, 2, 3, 4].map((index) => {
              return <EventList key={index} />;
            })}
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
