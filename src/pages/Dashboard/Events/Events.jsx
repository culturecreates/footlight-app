import React, { useEffect, useState } from 'react';
import './events.css';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import EventList from '../../../components/List/Events';
import { useLazyGetEventsQuery } from '../../../services/events';
import { useParams, useSearchParams, createSearchParams } from 'react-router-dom';
import AddEvent from '../../../components/Button/AddEvent';

function Events() {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  const [getEvents, { currentData: eventsData, isLoading }] = useLazyGetEventsQuery();
  const [pageNumber, setPageNumber] = useState(searchParams.get('page') ?? 1);
  const [eventSearchQuery, setEventSearchQuery] = useState(searchParams.get('query') ?? '');

  useEffect(() => {
    getEvents({ pageNumber, limit: 10, calendarId, query: eventSearchQuery });
    if (!eventSearchQuery || eventSearchQuery === '') setSearchParams(createSearchParams({ page: pageNumber }));
    else {
      setSearchParams(createSearchParams({ page: pageNumber, query: eventSearchQuery }));
    }
  }, [calendarId, pageNumber, eventSearchQuery]);

  useEffect(() => {
    if (calendarId) setPageNumber(1);
  }, [calendarId]);

  const onSearchHandler = (event) => {
    setPageNumber(1);
    setEventSearchQuery(event.target.value);
  };
  const onChangeHandler = (event) => {
    if (event.target.value === '') setEventSearchQuery('');
  };
  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={18}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col xs={2} sm={4} md={6} lg={8} xl={10}>
            <div className="events-heading-wrapper">
              <h4 className="events-heading">{t('dashboard.events.heading')}</h4>
            </div>
          </Col>
          <div className="event-add-button">
            <AddEvent label={t('dashboard.events.addEvent')} />
          </div>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col xs={24} sm={24} md={12} lg={10} xl={8}>
            <EventsSearch
              placeholder={t('dashboard.events.searchPlaceholder')}
              onPressEnter={(e) => onSearchHandler(e)}
              defaultValue={eventSearchQuery}
              allowClear={true}
              onChange={onChangeHandler}
            />
          </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} span={24} className="events-content">
          <Col span={24}>
            {!isLoading && eventsData ? (
              <EventList data={eventsData} pageNumber={pageNumber} setPageNumber={setPageNumber} />
            ) : (
              ''
            )}
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default Events;
