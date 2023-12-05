import React, { useEffect, useState, useRef, useCallback } from 'react';
import './events.css';
import { Checkbox, Col, Row, Badge, Button, Dropdown, Space, Popover, Divider } from 'antd';
import { CloseCircleOutlined, DownOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import EventList from '../../../components/List/Events';
import { useLazyGetEventsQuery } from '../../../services/events';
import { useParams, useSearchParams, createSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import AddEvent from '../../../components/Button/AddEvent';
import { PathName } from '../../../constants/pathName';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';
import { eventPublishStateOptions } from '../../../constants/eventPublishState';
import { useLazyGetAllUsersQuery } from '../../../services/users';
import { filterTypes } from '../../../constants/filterTypes';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';
import {
  sortByOptions,
  sortByOptionsOrgsPlacesPerson,
  sortByOptionsUsers,
  sortOrder,
} from '../../../constants/sortByOptions';
import DateRangePicker from '../../../components/DateRangePicker';
import moment from 'moment';
import NoContent from '../../../components/NoContent/NoContent';
import LoadingIndicator from '../../../components/LoadingIndicator/index';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useLazyGetAllOrganizationQuery } from '../../../services/organization';
import { removeObjectArrayDuplicates } from '../../../utils/removeObjectArrayDuplicates';
import { SEARCH_DELAY } from '../../../constants/search';
import { useDebounce } from '../../../hooks/debounce';

function Events() {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const timestampRef = useRef(Date.now()).current;
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData, pageNumber, setPageNumber] = useOutletContext();

  const [getEvents, { currentData: eventsData, isLoading, isFetching }] = useLazyGetEventsQuery();
  const [getAllUsers, { isFetching: allUsersLoading }] = useLazyGetAllUsersQuery();

  const [getAllOrganization, { isFetching: organizerLoading }] = useLazyGetAllOrganizationQuery();

  const [searchKey, setSearchKey] = useState();
  const [organizationSearchKey, setOrganizationSearchKey] = useState();
  const [eventSearchQuery, setEventSearchQuery] = useState(
    searchParams.get('query') ? searchParams.get('query') : sessionStorage.getItem('query') ?? '',
  );
  const dateValidChecker = (date = '') => {
    const dateFormat = 'YYYY-MM-DD';
    const toDateFormat = moment(new Date(date)).format(dateFormat);
    if (date) {
      if (moment(toDateFormat, dateFormat, true).isValid()) return true;
      else return false;
    } else return false;
  };

  const [filter, setFilter] = useState({
    publication: searchParams.get('publication')
      ? decodeURIComponent(searchParams.get('publication'))?.split(',')
      : sessionStorage.getItem('publication')
      ? decodeURIComponent(sessionStorage.getItem('publication'))?.split(',')
      : [],
    sort: searchParams.get('sortBy')
      ? searchParams.get('sortBy')
      : sessionStorage.getItem('sortBy') ?? sortByOptions[2]?.key,
    order: searchParams.get('order') ? searchParams.get('order') : sessionStorage.getItem('order') ?? sortOrder?.ASC,
    dates:
      (searchParams.get('startDateRange') || sessionStorage.getItem('startDateRange')) &&
      (searchParams.get('endDateRange') || sessionStorage.getItem('endDateRange'))
        ? [
            searchParams.get('startDateRange')
              ? dateValidChecker(searchParams.get('startDateRange'))
                ? moment(searchParams.get('startDateRange'))
                : searchParams.get('startDateRange')
              : sessionStorage.getItem('startDateRange')
              ? dateValidChecker(sessionStorage.getItem('startDateRange'))
                ? moment(sessionStorage.getItem('startDateRange'))
                : sessionStorage.getItem('startDateRange')
              : '',
            searchParams.get('endDateRange')
              ? dateValidChecker(searchParams.get('endDateRange'))
                ? moment(searchParams.get('endDateRange'))
                : searchParams.get('endDateRange')
              : sessionStorage.getItem('endDateRange')
              ? dateValidChecker(sessionStorage.getItem('endDateRange'))
                ? moment(sessionStorage.getItem('endDateRange'))
                : sessionStorage.getItem('endDateRange')
              : '',
          ]
        : [],
  });
  const [userFilter, setUserFilter] = useState(
    searchParams.get('users')
      ? decodeURIComponent(searchParams.get('users'))?.split(',')
      : sessionStorage.getItem('users')
      ? decodeURIComponent(sessionStorage.getItem('users'))?.split(',')
      : [],
  );

  const [organizerFilter, setOrganizerFilter] = useState(
    searchParams.get('organizers')
      ? decodeURIComponent(searchParams.get('organizers'))?.split(',')
      : sessionStorage.getItem('organizers')
      ? decodeURIComponent(sessionStorage.getItem('organizers'))?.split(',')
      : [],
  );

  let initialSelectedUsers = {},
    initialSelectedOrganizers = {};
  for (let index = 0; index < userFilter?.length; index++) {
    Object.assign(initialSelectedUsers, { [userFilter[index]]: true });
  }

  for (let index = 0; index < organizerFilter?.length; index++) {
    Object.assign(initialSelectedOrganizers, { [organizerFilter[index]]: true });
  }
  let selectedOrganizersData = [],
    selectedUsersData = [];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(initialSelectedUsers ?? {});
  const [selectedOrganizer, setSelectedOrganizers] = useState(initialSelectedOrganizers ?? {});
  const [organizersData, setOrganizersData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  const [selectedDates, setSelectedDates] = useState(
    (searchParams.get('startDateRange') || sessionStorage.getItem('startDateRange')) &&
      (searchParams.get('endDateRange') || sessionStorage.getItem('endDateRange'))
      ? [
          searchParams.get('startDateRange')
            ? dateValidChecker(searchParams.get('startDateRange'))
              ? moment(searchParams.get('startDateRange'))
              : ''
            : sessionStorage.getItem('startDateRange')
            ? dateValidChecker(sessionStorage.getItem('startDateRange'))
              ? moment(sessionStorage.getItem('startDateRange'))
              : ''
            : '',
          searchParams.get('endDateRange')
            ? dateValidChecker(searchParams.get('endDateRange'))
              ? moment(searchParams.get('endDateRange'))
              : ''
            : sessionStorage.getItem('endDateRange')
            ? dateValidChecker(sessionStorage.getItem('endDateRange'))
              ? moment(sessionStorage.getItem('endDateRange'))
              : ''
            : '',
        ]
      : [],
  );

  // let userFilterDataTest = allUsersData?.data?.slice()?.sort(function (x, y) {
  //   return x?._id == user?.id ? -1 : y?._id == user?.id ? 1 : 0;
  // });

  // let userFilterData = allUsersData?.data?.filter((item) => user?.id != item._id);
  // userFilterData = [{ _id: user?.id, ...user }]?.concat(userFilterData);

  const userSearch = (userSearchKey) => {
    getAllUsers({
      page: pageNumber,
      limit: 30,
      query: userSearchKey,
      filters: `sort=asc(${sortByOptionsUsers[1].key})`,
      sessionId: timestampRef,
      calendarId: calendarId,
      includeCalenderFilter: true,
    })
      .then((response) => {
        let currentUserList = selectedUsersData?.concat(response?.data?.data);
        currentUserList = [{ _id: user?.id, ...user }]?.concat(currentUserList);
        let uniqueArray = removeObjectArrayDuplicates(currentUserList, '_id');
        setUsersData(uniqueArray);
      })
      .catch((error) => console.log(error));
  };

  const organizersPersonPlaceSearch = (searchKey) => {
    getAllOrganization({
      calendarId,
      sessionId: timestampRef,
      pageNumber: 1,
      query: searchKey,
      sort: `sort=asc(${sortByOptionsOrgsPlacesPerson[0]?.key})`,
    })
      .unwrap()
      .then((response) => {
        let uniqueArray = removeObjectArrayDuplicates(selectedOrganizersData?.concat(response?.data), 'id');
        setOrganizersData(uniqueArray);
      })
      .catch((error) => console.log(error));
  };

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const debounceSearchOrganizationSearch = useCallback(useDebounce(organizersPersonPlaceSearch, SEARCH_DELAY), []);
  const debounceUsersSearch = useCallback(useDebounce(userSearch, SEARCH_DELAY), []);

  useEffect(() => {
    let query = new URLSearchParams();
    let sortQuery = new URLSearchParams();
    let usersQuery, publicationQuery, organizerQuery;

    userFilter?.forEach((user) => query.append('user', user));
    organizerFilter?.forEach((organizer) => query.append('person-organization', organizer));
    filter?.publication?.forEach((state) => query.append('publish-state', state));
    if (userFilter?.length > 0) usersQuery = encodeURIComponent(userFilter);
    if (organizerFilter?.length > 0) organizerQuery = encodeURIComponent(organizerFilter);

    if (filter?.publication?.length > 0) publicationQuery = encodeURIComponent(filter.publication);

    sortQuery.append(
      'sort',
      encodeURIComponent(
        `${filter?.order}(${filter?.sort}${filter?.sort === sortByOptions[0]?.key ? '.' + i18n.language : ''})`,
      ),
    );

    if (filter?.dates?.length == 2) {
      query.append(
        'start-date-range',
        filter?.dates[0]
          ? filter?.dates[0] === 'any'
            ? filter?.dates[0]
            : moment(filter?.dates[0])?.format('YYYY-MM-DD')
          : null,
      );
      query.append(
        'end-date-range',
        filter?.dates[1]
          ? filter?.dates[1] === 'any'
            ? filter?.dates[1]
            : moment(filter?.dates[1])?.format('YYYY-MM-DD')
          : null,
      );
    } else {
      query.append('start-date-range', '');
      query.append('end-date-range', '');
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
    let params = {
      page: pageNumber,
      order: filter?.order,
      sortBy: filter?.sort,
      ...(filter?.dates?.length > 0 && filter?.dates[0] && { startDateRange: query?.get('start-date-range') }),
      ...(filter?.dates?.length > 1 && filter?.dates[1] && { endDateRange: query?.get('end-date-range') }),
      ...(usersQuery && { users: usersQuery }),
      ...(organizerQuery && { organizers: organizerQuery }),
      ...(publicationQuery && { publication: publicationQuery }),
    };

    if (eventSearchQuery && eventSearchQuery !== '')
      params = {
        ...params,
        query: eventSearchQuery,
      };
    setSearchParams(createSearchParams(params));

    sessionStorage.setItem('page', pageNumber);
    sessionStorage.setItem('query', eventSearchQuery);
    sessionStorage.setItem('order', filter?.order);
    sessionStorage.setItem('sortBy', filter?.sort);
    if (usersQuery) sessionStorage.setItem('users', usersQuery);
    else sessionStorage.removeItem('users');
    if (organizerQuery) sessionStorage.setItem('organizers', organizerQuery);
    else sessionStorage.removeItem('organizers');
    if (publicationQuery) sessionStorage.setItem('publication', publicationQuery);
    else if (sessionStorage.getItem('publication')) {
      sessionStorage.removeItem('publication');
    }
    if (filter?.dates?.length > 0 && filter?.dates[0] && filter?.dates[0] !== '')
      sessionStorage.setItem('startDateRange', filter?.dates[0]);
    else sessionStorage.setItem('startDateRange', query?.get('start-date-range'));
    if (filter?.dates?.length > 1 && filter?.dates[1] && filter?.dates[1] !== '')
      sessionStorage.setItem('endDateRange', filter?.dates[1]);
    else sessionStorage.setItem('endDateRange', query?.get('end-date-range'));
  }, [calendarId, pageNumber, eventSearchQuery, filter, userFilter, organizerFilter]);

  useEffect(() => {
    let allOrganizersWithSelected = [],
      allUsersWithSelected = [];
    if (calendarId)
      if (user?.id !== '' && user?.id) {
        getAllUsers({
          page: 1,
          limit: 30,
          query: '',
          filters: `sort=asc(${sortByOptionsUsers[1].key})`,
          sessionId: timestampRef,
          calendarId: calendarId,
          includeCalenderFilter: true,
        })
          .unwrap()
          .then((response) => {
            allUsersWithSelected = [{ _id: user?.id, ...user }]?.concat(response?.data);
            allUsersWithSelected = removeObjectArrayDuplicates(allUsersWithSelected, '_id');
            if (userFilter?.length > 0) {
              let userIds = new URLSearchParams();
              userFilter?.forEach((userId) => userIds.append('ids', userId));
              getAllUsers({
                page: 1,
                limit: 30,
                query: '',
                filters: `sort=asc(${sortByOptionsUsers[1].key})&${userIds}`,
                sessionId: timestampRef,
                calendarId: calendarId,
                includeCalenderFilter: true,
              })
                .unwrap()
                .then((response) => {
                  selectedUsersData = response?.data;
                  allUsersWithSelected = response?.data?.concat(allUsersWithSelected);
                  allUsersWithSelected = [{ _id: user?.id, ...user }]?.concat(allUsersWithSelected);
                  let uniqueArray = removeObjectArrayDuplicates(allUsersWithSelected, '_id');
                  setUsersData(uniqueArray);
                })
                .catch((error) => console.log(error));
            } else setUsersData(allUsersWithSelected);
          })
          .catch((error) => console.log(error));
      }
    getAllOrganization({
      calendarId,
      limit: 30,
      sessionId: timestampRef,
      pageNumber: 1,
      query: '',
      sort: `sort=asc(${sortByOptionsOrgsPlacesPerson[0]?.key})`,
    })
      .unwrap()
      .then((response) => {
        allOrganizersWithSelected = response?.data;
        if (organizerFilter?.length > 0) {
          let organizerIds = new URLSearchParams();
          organizerFilter?.forEach((organizerId) => organizerIds.append('ids', organizerId));
          getAllOrganization({
            calendarId,
            limit: 30,
            sessionId: timestampRef,
            pageNumber: 1,
            query: '',
            sort: `sort=asc(${sortByOptionsOrgsPlacesPerson[0]?.key})`,
            ids: organizerIds,
          })
            .unwrap()
            .then((response) => {
              selectedOrganizersData = response?.data;
              allOrganizersWithSelected = response?.data?.concat(allOrganizersWithSelected);
              let uniqueArray = removeObjectArrayDuplicates(allOrganizersWithSelected, 'id');
              setOrganizersData(uniqueArray);
            })
            .catch((error) => console.log(error));
        } else setOrganizersData(allOrganizersWithSelected);
      })
      .catch((error) => console.log(error));
  }, [calendarId, user]);

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
    selectedUsersData = usersData?.filter((userData) => {
      if (filteredUsers?.includes(userData?.id)) return true;
      else return false;
    });
    setUserFilter(filteredUsers);
    setPageNumber(1);
  };

  const onOrganizerCheckboxChange = (e) => {
    let currentOrganizerFilter = selectedOrganizer ?? {};
    Object.assign(currentOrganizerFilter, { [e?.target?.value]: e?.target?.checked });
    setSelectedOrganizers(currentOrganizerFilter);
    let filteredOrganizers = Object.keys(currentOrganizerFilter).filter(function (key) {
      return currentOrganizerFilter[key];
    });
    selectedOrganizersData = organizersData?.filter((organizerData) => {
      if (filteredOrganizers?.includes(organizerData?.id)) return true;
      else return false;
    });
    setOrganizerFilter(filteredOrganizers);
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
      order: sortOrder?.ASC,
    });
    setPageNumber(1);
  };

  const onSortOrderChange = () => {
    if (filter?.order == sortOrder?.ASC)
      setFilter({
        ...filter,
        order: sortOrder?.DESC,
      });
    else if (filter?.order == sortOrder?.DESC)
      setFilter({
        ...filter,
        order: sortOrder?.ASC,
      });
    setPageNumber(1);
  };

  const handlePopoverOpenChange = (newOpen) => {
    setIsPopoverOpen(newOpen);
  };

  const filterClearHandler = () => {
    setFilter({
      publication: [],
      sort: sortByOptions[2]?.key,
      order: sortOrder?.ASC,
      dates: [],
    });
    setUserFilter([]);
    setSelectedDates([]);
    setOrganizerFilter([]);
    let usersToClear = selectedUsers;
    Object.keys(usersToClear)?.forEach(function (key) {
      usersToClear[key] = false;
    });
    setSelectedUsers(Object.assign({}, usersToClear));

    let organizerToClear = selectedOrganizer;
    Object.keys(organizerToClear)?.forEach(function (key) {
      organizerToClear[key] = false;
    });
    setSelectedOrganizers(Object.assign({}, organizerToClear));

    setPageNumber(1);
    sessionStorage.removeItem('page');
    sessionStorage.removeItem('query');
    sessionStorage.removeItem('order');
    sessionStorage.removeItem('sortBy');
    sessionStorage.removeItem('users');
    sessionStorage.removeItem('organizers');
    sessionStorage.removeItem('publication');
    sessionStorage.removeItem('startDateRange');
    sessionStorage.removeItem('endDateRange');
  };
  return (
    !isLoading && (
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
        <Col span={24}>
          <Col style={{ paddingLeft: 0 }}>
            <Row justify="space-between">
              <Col>
                <div className="events-heading-wrapper">
                  <h4 className="events-heading" data-cy="heading-events-list">
                    {t('dashboard.events.heading')}
                  </h4>
                </div>
              </Col>

              <Col>
                <AddEvent
                  label={t('dashboard.events.addEvent')}
                  onClick={addEventHandler}
                  data-cy="button-add-new-event"
                />
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
                data-cy="input-search-events"
              />
            </Col>
            <Col>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }} data-cy="span-sort-by-text">
                  {t('dashboard.events.filter.sort.sortBy')}
                </span>

                <Dropdown
                  overlayClassName="filter-sort-dropdown-wrapper"
                  overlayStyle={{ minWidth: '200px' }}
                  getPopupContainer={(trigger) => trigger.parentNode}
                  menu={{
                    items: sortByOptions,
                    selectable: true,
                    selectedKeys: [filter?.sort],
                    onSelect: onSortSelect,
                  }}
                  trigger={['click']}>
                  <Button size="large" className="filter-sort-button" data-cy="button-sort-by">
                    <Space>
                      {sortByOptions?.map((sortBy, index) => {
                        if (sortBy?.key === filter?.sort) return <span key={index}>{sortBy?.label}</span>;
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
                    filter?.order === sortOrder?.ASC ? (
                      <SortAscendingOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />
                    ) : (
                      filter?.order === sortOrder?.DESC && (
                        <SortDescendingOutlined style={{ color: '#1B3DE6', fontSize: '24px' }} />
                      )
                    )
                  }
                  size={'large'}
                  data-cy="button-sort-order"
                />
              </div>
            </Col>

            <Col span={24}>
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
                        style={{ borderColor: filter?.publication?.length > 0 && '#607EFC' }}
                        data-cy="button-filter-publication">
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
                    loading={allUsersLoading}
                    overlayStyle={{ height: '304px' }}
                    searchImplementation={debounceUsersSearch}
                    setSearchKey={setSearchKey}
                    searchKey={searchKey}
                    data={usersData?.map((userDetail) => {
                      return {
                        key: userDetail?._id,
                        label: (
                          <>
                            <Checkbox
                              value={userDetail?._id}
                              key={userDetail?._id}
                              style={{ marginLeft: '8px' }}
                              onChange={(e) => onCheckboxChange(e)}>
                              {user?.id == userDetail?._id
                                ? t('dashboard.events.filter.users.myEvents')
                                : userDetail?.userName}
                            </Checkbox>
                            {user?.id == userDetail?._id && <Divider style={{ margin: 8 }} />}
                          </>
                        ),
                        filtervalue: userDetail?.userName,
                      };
                    })}
                    value={userFilter}>
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ borderColor: userFilter?.length > 0 && '#607EFC' }}
                      data-cy="button-filter-users">
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
                    getPopupContainer={(trigger) => trigger.parentNode}
                    content={
                      <DateRangePicker
                        value={selectedDates}
                        onChange={(dates) => {
                          setSelectedDates(dates);
                          setFilter({ ...filter, dates: dates });
                        }}
                        onOpenChange={(open) => setIsPopoverOpen(open)}
                        renderExtraFooter={() => (
                          <div className="date-range-picker-filter-footer">
                            <Button
                              type="text"
                              className={`date-range-picker-filter-footer-label ${
                                filter?.dates?.length == 2 &&
                                filter?.dates[0] === 'any' &&
                                filter?.dates[1] === 'any' &&
                                'date-range-picker-filter-footer-button-selected'
                              }`}
                              onClick={() => {
                                setSelectedDates([]);
                                setFilter({ ...filter, dates: ['any', 'any'] });
                                setIsPopoverOpen(false);
                              }}
                              data-cy="button-filter-datepicker-past-events">
                              {t('dashboard.events.filter.dates.allTime')}
                            </Button>
                            <Button
                              type="text"
                              className={`date-range-picker-filter-footer-label ${
                                filter?.dates?.length == 2 &&
                                filter?.dates[0] === 'any' &&
                                filter?.dates[1] !== 'any' &&
                                'date-range-picker-filter-footer-button-selected'
                              }`}
                              onClick={() => {
                                setSelectedDates([]);
                                setFilter({ ...filter, dates: ['any', moment().subtract(1, 'days')] });
                                setIsPopoverOpen(false);
                              }}
                              data-cy="button-filter-datepicker-all-events">
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
                      style={{ borderColor: filter?.dates?.length > 0 > 0 && '#607EFC' }}
                      data-cy="button-filter-dates">
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
                  <SearchableCheckbox
                    allowSearch={true}
                    loading={organizerLoading}
                    overlayStyle={{ height: '304px' }}
                    searchImplementation={debounceSearchOrganizationSearch}
                    setSearchKey={setOrganizationSearchKey}
                    searchKey={organizationSearchKey}
                    data={organizersData?.map((organizer) => {
                      return {
                        key: organizer?.id,
                        label: (
                          <>
                            <Checkbox
                              value={organizer?.id}
                              key={organizer?.id}
                              style={{ marginLeft: '8px' }}
                              onChange={(e) => onOrganizerCheckboxChange(e)}>
                              {contentLanguageBilingual({
                                en: organizer?.name?.en,
                                fr: organizer?.name?.fr,
                                interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                calendarContentLanguage: calendarContentLanguage,
                              })}
                            </Checkbox>
                          </>
                        ),
                        filtervalue: organizer?.id,
                      };
                    })}
                    value={organizerFilter}>
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ borderColor: organizerFilter?.length > 0 && '#607EFC' }}
                      data-cy="button-filter-users">
                      {t('dashboard.events.filter.organizer.label')}
                      {organizerFilter?.length > 0 && (
                        <>
                          &nbsp; <Badge count={organizerFilter?.length} showZero={false} color="#1B3DE6" />
                        </>
                      )}
                    </Button>
                  </SearchableCheckbox>
                </Col>
                <Col>
                  {(userFilter.length > 0 ||
                    filter?.publication?.length > 0 ||
                    filter?.dates?.length > 0 ||
                    filter?.order === sortOrder?.DESC ||
                    filter?.sort != sortByOptions[2]?.key ||
                    organizerFilter?.length > 0) && (
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ color: '#1B3DE6' }}
                      onClick={filterClearHandler}
                      data-cy="button-filter-clear">
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
              {isFetching && (
                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingIndicator />
                </div>
              )}
              {!isFetching &&
                (eventsData?.data?.length > 0 ? (
                  <EventList
                    data={eventsData}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    calendarContentLanguage={calendarContentLanguage}
                  />
                ) : (
                  <NoContent style={{ height: '200px' }} />
                ))}
            </Col>
          </Row>
        </Col>
      </Row>
    )
  );
}

export default Events;
