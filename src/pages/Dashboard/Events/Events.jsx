import React, { useEffect, useState, useRef } from 'react';
import './events.css';
import { Checkbox, Col, Row, Badge, Divider, Button, Dropdown, Space, Popover } from 'antd';
import { CloseCircleOutlined, DownOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
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
import { sortByOptions } from '../../../constants/sortByOptions';
import DateRangePicker from '../../../components/DateRangePicker';
import moment from 'moment';

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
    publication: [],
    sort: searchParams.get('sortBy') ?? sortByOptions[2]?.key,
    order: searchParams.get('order') ?? 'asc',
    dates: [],
  });
  const [userFilter, setUserFilter] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
    let sortQuery = new URLSearchParams();
    userFilter?.forEach((user) => query.append('user', user));
    filter?.publication?.forEach((state) => query.append('publish-state', state));
    sortQuery.append(
      'sort',
      encodeURIComponent(
        `${filter?.order}(${filter?.sort}${filter?.sort === sortByOptions[0]?.key ? '.' + i18n.language : ''})`,
      ),
    );

    if (filter?.dates?.length == 2) {
      query.append('start-date-range', filter?.dates[0] ? moment(filter?.dates[0]).format('YYYY-MM-DD') : null);
      query.append('end-date-range', filter?.dates[1] ? moment(filter?.dates[1]).format('YYYY-MM-DD') : null);
    }
    getEvents({
      pageNumber,
      limit: 10,
      calendarId,
      query: eventSearchQuery,
      filterkeys: decodeURIComponent(query.toString()),
      sort: sortQuery,
      sessionId: timestampRef,
    });
    if (!eventSearchQuery || eventSearchQuery === '')
      setSearchParams(createSearchParams({ page: pageNumber, order: filter?.order, sortBy: filter?.sort }));
    else {
      setSearchParams(
        createSearchParams({ page: pageNumber, query: eventSearchQuery, order: filter?.order, sortBy: filter?.sort }),
      );
    }
  }, [calendarId, pageNumber, eventSearchQuery, filter, userFilter]);

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
    setUserFilter(filteredUsers);
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

  const onSortSelect = ({ selectedKeys }) => {
    setFilter({
      ...filter,
      sort: selectedKeys[0],
    });
    setPageNumber(1);
  };

  const onSortOrderChange = () => {
    if (filter?.order == 'asc')
      setFilter({
        ...filter,
        order: 'desc',
      });
    else if (filter?.order == 'desc')
      setFilter({
        ...filter,
        order: 'asc',
      });
    setPageNumber(1);
  };

  const handlePopoverOpenChange = (newOpen) => {
    setIsPopoverOpen(newOpen);
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
          <Row gutter={[20, 10]}>
            <Col xs={24} sm={24} md={12} lg={10} xl={8}>
              <EventsSearch
                placeholder={t('dashboard.events.searchPlaceholder')}
                onPressEnter={(e) => onSearchHandler(e)}
                defaultValue={eventSearchQuery}
                allowClear={true}
                onChange={onChangeHandler}
              />
            </Col>
            <Col>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>{t('dashboard.events.filter.sort.sortBy')}</span>

                <Dropdown
                  overlayClassName="filter-sort-dropdown-wrapper"
                  overlayStyle={{ minWidth: '200px' }}
                  getPopupContainer={(trigger) => trigger.parentNode}
                  menu={{
                    items: sortByOptions,
                    selectable: true,
                    defaultSelectedKeys: [filter?.sort],
                    onSelect: onSortSelect,
                  }}
                  trigger={['click']}>
                  <Button size="large" className="filter-sort-button">
                    <Space>
                      {sortByOptions?.map((sortBy) => {
                        if (sortBy?.key === filter?.sort) return sortBy?.label;
                      })}
                      <DownOutlined style={{ fontSize: '12px', color: '#222732' }} />
                    </Space>
                  </Button>
                </Dropdown>

                <Button
                  className="filter-sort-button"
                  style={{ borderColor: filter?.order && '#1B3DE6' }}
                  onClick={onSortOrderChange}
                  icon={
                    filter?.order === 'asc' ? (
                      <SortAscendingOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />
                    ) : (
                      filter?.order === 'desc' && (
                        <SortDescendingOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />
                      )
                    )
                  }
                  size={'large'}
                />
              </div>
            </Col>

            <Col>
              <Row gutter={20}>
                <Space>
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
                </Space>
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
                    value={userFilter}>
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ borderColor: userFilter?.length > 0 && '#607EFC' }}>
                      {t('dashboard.events.filter.users.label')}
                      {userFilter?.length > 0 && (
                        <>
                          &nbsp; <Badge count={userFilter?.length} showZero={false} color="#1B3DE6" />
                        </>
                      )}
                    </Button>
                  </SearchableCheckbox>
                </Col>
                <Col>
                  <Popover
                    placement="bottom"
                    // getPopupContainer={(trigger) => trigger.parentNode}
                    content={
                      <DateRangePicker
                        value={filter?.dates}
                        onChange={(dates) => {
                          setFilter({ ...filter, dates: dates });
                        }}
                        onOpenChange={(open) => setIsPopoverOpen(open)}
                        renderExtraFooter={() => (
                          <div className="date-range-picker-filter-footer">
                            <Button
                              type="text"
                              className="date-range-picker-filter-footer-label"
                              onClick={() => setFilter({ ...filter, dates: [null, null] })}>
                              {t('dashboard.events.filter.dates.allTime')}
                            </Button>
                            <Button
                              type="text"
                              className="date-range-picker-filter-footer-label"
                              onClick={() => setFilter({ ...filter, dates: [null, moment().subtract(1, 'days')] })}>
                              {t('dashboard.events.filter.dates.past')}
                            </Button>
                          </div>
                        )}
                      />
                    }
                    trigger="click"
                    overlayClassName="date-filter-popover"
                    open={isPopoverOpen}
                    onOpenChange={handlePopoverOpenChange}>
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ borderColor: filter?.dates?.length > 0 > 0 && '#607EFC' }}>
                      {t('dashboard.events.filter.dates.dates')}
                      {filter?.dates?.length > 0 && (
                        <>
                          &nbsp; <Badge color="#1B3DE6" />
                        </>
                      )}
                    </Button>
                  </Popover>
                </Col>
                <Col>
                  {(userFilter.length > 0 || filter?.publication?.length > 0 || filter?.dates?.length > 0) && (
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ color: '#1B3DE6' }}
                      onClick={() => {
                        setFilter({
                          publication: [],
                          sort: sortByOptions[0]?.key,
                          order: 'ASC',
                          dates: [],
                        });
                        setUserFilter([]);
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
