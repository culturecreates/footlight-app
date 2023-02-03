import React, { useEffect, useState, useRef } from 'react';
import './events.css';
import { Checkbox, Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import EventList from '../../../components/List/Events';
import { useLazyGetEventsQuery } from '../../../services/events';
import { useParams, useSearchParams, createSearchParams, useNavigate } from 'react-router-dom';
import AddEvent from '../../../components/Button/AddEvent';
import { PathName } from '../../../constants/pathName';
import Outlined from '../../../components/Button/Outlined';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';
import { eventPublishStateOptions } from '../../../constants/eventPublishState';

function Events() {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const timestampRef = useRef(Date.now()).current;

  const [getEvents, { currentData: eventsData, isLoading }] = useLazyGetEventsQuery();
  const [pageNumber, setPageNumber] = useState(searchParams.get('page') ?? 1);
  const [eventSearchQuery, setEventSearchQuery] = useState(searchParams.get('query') ?? '');
  const [openUsers, setOpenUsers] = useState(false);
  const [openPublication, setOpenPublication] = useState(false);

  useEffect(() => {
    getEvents({ pageNumber, limit: 10, calendarId, query: eventSearchQuery, sessionId: timestampRef });
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
  const addEventHandler = () => {
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Events}${PathName.AddEvent}`);
  };
  const onChangeHandler = (event) => {
    if (event.target.value === '') setEventSearchQuery('');
  };
  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={24}>
        <Col style={{ paddingLeft: 0 }}>
          <Row justify="space-between">
            <Col>
              <div className="events-heading-wrapper">
                <h4 className="events-heading">{t('dashboard.events.heading')}</h4>
              </div>
            </Col>
            <Col>
              <SearchableCheckbox open={openUsers} allowSearch={true}>
                <Outlined label="Users" onClick={() => setOpenUsers(!openUsers)} />
              </SearchableCheckbox>
              <SearchableCheckbox
                open={openPublication}
                data={eventPublishStateOptions?.map((publication) => {
                  return {
                    key: publication.key,
                    label: (
                      <Checkbox value={publication.value} key={publication.key}>
                        {publication.title}
                      </Checkbox>
                    ),
                  };
                })}>
                <Outlined label="Publication" onClick={() => setOpenPublication(!openPublication)} />
              </SearchableCheckbox>
            </Col>
            <Col>
              <AddEvent label={t('dashboard.events.addEvent')} onClick={addEventHandler} />
            </Col>
          </Row>
        </Col>
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
        <Row className="events-content">
          <Col flex="832px">
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
