import React, { useEffect, useState, useRef } from 'react';
import './events.css';
import { Checkbox, Col, Row, Badge } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
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
import { useGetAllUsersQuery } from '../../../services/users';
import { filterTypes } from '../../../constants/filterTypes';

function Events() {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const timestampRef = useRef(Date.now()).current;

  const [getEvents, { currentData: eventsData, isLoading }] = useLazyGetEventsQuery();
  const { currentData: allUsersData, isLoading: allUsersLoading } = useGetAllUsersQuery({
    calendarId,
    includeInactiveUsers: false,
    includeCalendarFilter: true,
    sessionId: timestampRef,
  });
  const [pageNumber, setPageNumber] = useState(searchParams.get('page') ?? 1);
  const [eventSearchQuery, setEventSearchQuery] = useState(searchParams.get('query') ?? '');
  const [filter, setFilter] = useState({
    users: [],
    publication: [],
  });

  useEffect(() => {
    let query = new URLSearchParams();
    filter?.users?.forEach((user) => query.append('user', user));
    filter?.publication?.forEach((state) => query.append('publish-state', state));
    getEvents({
      pageNumber,
      limit: 10,
      calendarId,
      query: eventSearchQuery,
      filterkeys: decodeURIComponent(query.toString()),
      sessionId: timestampRef,
    });
    if (!eventSearchQuery || eventSearchQuery === '') setSearchParams(createSearchParams({ page: pageNumber }));
    else {
      setSearchParams(createSearchParams({ page: pageNumber, query: eventSearchQuery }));
    }
  }, [calendarId, pageNumber, eventSearchQuery, filter]);

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

  const onFilterChange = (values, filterType) => {
    if (filterType === filterTypes.USERS)
      setFilter({
        ...filter,
        users: values,
      });
    else if (filterType === filterTypes.PUBLICATION)
      setFilter({
        ...filter,
        publication: values,
      });
  };
  return (
    !isLoading &&
    !allUsersLoading && (
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
            <Col span={16}>
              <Row gutter={20}>
                <Col>
                  <SearchableCheckbox
                    allowSearch={true}
                    overlayStyle={{ height: '304px', overflowY: 'scroll' }}
                    onFilterChange={(values) => onFilterChange(values, filterTypes.USERS)}
                    data={allUsersData?.data?.active?.map((user) => {
                      return {
                        key: user?.id,
                        label: (
                          <Checkbox value={user.id} key={user.id}>
                            {user?.firstName?.charAt(0)}
                            {user?.lastName}
                          </Checkbox>
                        ),
                        filtervalue: user?.firstName + user?.lastName,
                      };
                    })}>
                    <Outlined label="Users" style={{ color: '#222732' }}>
                      {filter?.users?.length > 0 && (
                        <Badge count={filter?.users?.length} showZero={false} color="#1B3DE6" />
                      )}
                    </Outlined>
                  </SearchableCheckbox>
                </Col>
                <Col>
                  <SearchableCheckbox
                    onFilterChange={(values) => onFilterChange(values, filterTypes.PUBLICATION)}
                    data={eventPublishStateOptions?.map((publication) => {
                      return {
                        key: publication.key,
                        label: (
                          <Checkbox value={publication.value} key={publication.key}>
                            {publication.title}
                          </Checkbox>
                        ),
                        filtervalue: publication.value,
                      };
                    })}>
                    <Outlined label="Publication">
                      {filter?.publication?.length > 0 && (
                        <Badge count={filter?.publication?.length} showZero={false} color="#1B3DE6" />
                      )}
                    </Outlined>
                  </SearchableCheckbox>
                </Col>
                <Col>
                  <Outlined
                    label={'Clear'}
                    onClick={() =>
                      setFilter({
                        users: [],
                        publication: [],
                      })
                    }>
                    <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
                  </Outlined>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="events-content">
            <Col flex="832px">
              {eventsData ? <EventList data={eventsData} pageNumber={pageNumber} setPageNumber={setPageNumber} /> : ''}
            </Col>
          </Row>
        </Col>
      </Row>
    )
  );
}

export default Events;
