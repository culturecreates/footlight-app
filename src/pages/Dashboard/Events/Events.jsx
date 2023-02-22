import React, { useEffect, useState, useRef } from 'react';
import './events.css';
import { Checkbox, Col, Row, Badge, Divider, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import EventList from '../../../components/List/Events';
import { useLazyGetEventsQuery } from '../../../services/events';
import { useParams, useSearchParams, createSearchParams, useNavigate } from 'react-router-dom';
import AddEvent from '../../../components/Button/AddEvent';
import { PathName } from '../../../constants/pathName';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';
import { eventPublishStateOptions } from '../../../constants/eventPublishState';
import { useGetAllUsersQuery } from '../../../services/users';
import { filterTypes } from '../../../constants/filterTypes';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';

function Events() {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const timestampRef = useRef(Date.now()).current;
  const { user } = useSelector(getUserDetails);

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
  const [selectedUsers, setSelectedUsers] = useState({});

  let userFilterData = allUsersData?.data?.active?.slice()?.sort(function (x, y) {
    return x?.id == user?.id ? -1 : y?.id == user?.id ? 1 : 0;
  });

  userFilterData = userFilterData
    ?.slice(1)
    ?.sort((a, b) => a?.firstName?.toLowerCase()?.localeCompare(b?.firstName?.toLowerCase()));
  userFilterData = [user].concat(userFilterData);
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
  const onCheckboxChange = (e) => {
    let currentUsersFilter = selectedUsers ?? {};
    Object.assign(currentUsersFilter, { [e?.target?.value]: e?.target?.checked });
    setSelectedUsers(currentUsersFilter);
    let filteredUsers = Object.keys(currentUsersFilter).filter(function (key) {
      return currentUsersFilter[key];
    });
    setFilter({
      ...filter,
      users: filteredUsers,
    });
    setPageNumber(1);
  };

  const onFilterChange = (values, filterType) => {
    if (filterType === filterTypes.PUBLICATION)
      setFilter({
        ...filter,
        publication: values,
      });
    setPageNumber(1);
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
                    onFilterChange={(values) => onFilterChange(values, filterTypes.PUBLICATION)}
                    data={eventPublishStateOptions?.map((publication) => {
                      return {
                        key: publication.key,
                        label: (
                          <Checkbox value={publication.value} key={publication.key} style={{ marginLeft: '8px' }}>
                            {publication.title}
                          </Checkbox>
                        ),
                        filtervalue: publication.value,
                      };
                    })}
                    value={filter?.publication}>
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ borderColor: filter?.publication?.length > 0 && '#607EFC' }}>
                      {t('dashboard.events.filter.publication.label')}
                      {filter?.publication?.length > 0 && (
                        <>
                          &nbsp;
                          <Badge count={filter?.publication?.length} showZero={false} color="#1B3DE6" />
                        </>
                      )}
                    </Button>
                  </SearchableCheckbox>
                </Col>
                <Col>
                  <SearchableCheckbox
                    allowSearch={true}
                    overlayStyle={{ height: '304px' }}
                    data={userFilterData?.map((userDetail) => {
                      return {
                        key: userDetail?.id,
                        label: (
                          <>
                            <Checkbox
                              value={userDetail?.id}
                              key={userDetail?.id}
                              style={{ marginLeft: '8px' }}
                              onChange={(e) => onCheckboxChange(e)}>
                              {user?.id == userDetail?.id
                                ? t('dashboard.events.filter.users.myEvents')
                                : userDetail?.firstName?.charAt(0)?.toLowerCase() + userDetail?.lastName?.toLowerCase()}
                            </Checkbox>
                            {user?.id == userDetail?.id && <Divider style={{ margin: 8 }} />}
                          </>
                        ),
                        filtervalue: userDetail?.firstName?.charAt(0)?.toLowerCase() + userDetail?.lastName,
                      };
                    })}
                    value={filter?.users}>
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ borderColor: filter?.users?.length > 0 && '#607EFC' }}>
                      {t('dashboard.events.filter.users.label')}
                      {filter?.users?.length > 0 && (
                        <>
                          &nbsp; <Badge count={filter?.users?.length} showZero={false} color="#1B3DE6" />
                        </>
                      )}
                    </Button>
                  </SearchableCheckbox>
                </Col>

                <Col>
                  {(filter?.users?.length > 0 || filter?.publication?.length > 0) && (
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ color: '#1B3DE6' }}
                      onClick={() => {
                        setFilter({
                          users: [],
                          publication: [],
                        });
                        let usersToClear = selectedUsers;
                        Object.keys(usersToClear)?.forEach(function (key) {
                          usersToClear[key] = false;
                        });
                        setSelectedUsers(Object.assign({}, usersToClear));
                        setPageNumber(1);
                      }}>
                      {t('dashboard.events.filter.clear')}&nbsp;
                      <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
                    </Button>
                  )}
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
