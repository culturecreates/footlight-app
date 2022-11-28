import React, { useEffect } from 'react';
import './events.css';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import EventList from '../../../components/List/Events';
import { useLazyGetEventsQuery } from '../../../services/events';
import { useParams } from 'react-router-dom';

function Events() {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const [getEvents, { data: eventsData, isLoading }] = useLazyGetEventsQuery();

  useEffect(() => {
    getEvents({ pageNumber: 1, limit: 12, calendarId });
  }, [calendarId]);

  useEffect(() => {
    console.log(eventsData);
  }, [eventsData]);

  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={18}>
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
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} span={24} className="events-content">
          <Col span={24}>{!isLoading && eventsData ? <EventList data={eventsData} /> : ''}</Col>
        </Row>
      </Col>
    </Row>
  );
}

export default Events;
