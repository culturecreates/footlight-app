import React, { useCallback, useEffect, useRef, useState } from 'react';
import './organizations.css';
import { List, Grid, Row, Col, Space, Button, Popover, Tree, Badge, Checkbox, Divider } from 'antd';
import Icon, { DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import Main from '../../../layout/Main/Main';
import OrganizationSearch from '../../../components/Search/Events/EventsSearch';
import AddOrganization from '../../../components/Button/AddEvent';
import Sort from '../../../components/Sort/Sort';
import NoContent from '../../../components/NoContent/NoContent';
import ListItem from '../../../components/List/ListItem.jsx/ListItem';
import { useDeleteOrganizationMutation, useLazyGetAllOrganizationQuery } from '../../../services/organization';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
  createSearchParams,
} from 'react-router-dom';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { PathName } from '../../../constants/pathName';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { ReactComponent as OrganizationLogo } from '../../../assets/icons/organization-light.svg';
import { sortByOptionsOrgsPlacesPerson, sortByOptionsUsers, sortOrder } from '../../../constants/sortByOptions';
import i18n from 'i18next';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { treeTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import { useLazyGetEntityDependencyCountQuery } from '../../../services/entities';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import { useLazyGetAllUsersQuery } from '../../../services/users';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { removeObjectArrayDuplicates } from '../../../utils/removeObjectArrayDuplicates';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';
import { entitiesClass } from '../../../constants/entitiesClass';
import EntityReports from '../../../components/EntityReports/EntityReports';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';

const { useBreakpoint } = Grid;

function Organizations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector(getUserDetails);
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  setContentBackgroundColor('#fff');

  let taxonomyClassQuery = new URLSearchParams();

  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.ORGANIZATION);
  const { currentData: allTaxonomyData } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
    addToFilter: true,
  });
  const [
    getAllOrganization,
    { currentData: allOrganizationData, isFetching: allOrganizationFetching, isSuccess: allOrganizationSuccess },
  ] = useLazyGetAllOrganizationQuery();

  const [getAllUsers, { isFetching: allUsersLoading, isSuccess: allUsersSuccess }] = useLazyGetAllUsersQuery();
  const [getDependencyDetails, { isFetching: dependencyDetailsFetching }] = useLazyGetEntityDependencyCountQuery();
  const [deleteOrganization] = useDeleteOrganizationMutation();

  const [selectedUsersData, setSelectedUsersData] = useState([]);
  const [searchKey, setSearchKey] = useState();
  const [usersData, setUsersData] = useState([]);
  const [userFilter, setUserFilter] = useState(
    searchParams.get('users')
      ? decodeURIComponent(searchParams.get('users'))?.split(',')
      : sessionStorage.getItem('organizationUsers')
      ? decodeURIComponent(sessionStorage.getItem('organizationUsers'))?.split(',')
      : [],
  );

  let initialSelectedUsers = {};
  const [selectedUsers, setSelectedUsers] = useState(initialSelectedUsers ?? {});
  for (let index = 0; index < userFilter?.length; index++) {
    Object.assign(initialSelectedUsers, { [userFilter[index]]: true });
  }

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(
    searchParams.get('page') ? searchParams.get('page') : sessionStorage.getItem('organizationPage') ?? 1,
  );
  const [organizationSearchQuery, setOrganizationSearchQuery] = useState(
    searchParams.get('query') ? searchParams.get('query') : sessionStorage.getItem('organizationSearchQuery') ?? '',
  );
  const [filter, setFilter] = useState({
    sort: searchParams.get('sortBy')
      ? searchParams.get('sortBy')
      : sessionStorage.getItem('organizationSortBy') ?? sortByOptionsOrgsPlacesPerson[0]?.key,
    order: searchParams.get('order')
      ? searchParams.get('order')
      : sessionStorage.getItem('organizationOrder') ?? sortOrder?.ASC,
  });
  const [taxonomyFilter, setTaxonomyFilter] = useState(
    searchParams.get('taxonomyFilter')
      ? JSON.parse(searchParams.get('taxonomyFilter'))
      : sessionStorage.getItem('organizationTaxonomyFilter')
      ? JSON.parse(sessionStorage.getItem('organizationTaxonomyFilter'))
      : {},
  );
  const [standardTaxonomyFilter, setStandardTaxonomyFilter] = useState(
    searchParams.get('standardTaxonomyFilter')
      ? JSON.parse(searchParams.get('standardTaxonomyFilter'))
      : sessionStorage.getItem('standardOrganizationTaxonomyFilter')
      ? JSON.parse(sessionStorage.getItem('standardOrganizationTaxonomyFilter'))
      : {},
  );

  const totalCount = allOrganizationData?.count;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  let customFilters = currentCalendarData?.filterPersonalization?.customFields;

  const deleteOrganizationHandler = (organizationId) => {
    getDependencyDetails({ ids: organizationId, calendarId })
      .unwrap()
      .then((res) => {
        Confirm({
          title: t('dashboard.organization.deleteOrganization.title'),
          content: `${t('dashboard.organization.deleteOrganization.description')} ${t(
            'dashboard.organization.deleteOrganization.impact',
          )}  
          ${t('dashboard.organization.deleteOrganization.published', {
            number: `${res?.events?.publishedEventCount}`,
          })}, 
          ${t('dashboard.organization.deleteOrganization.draft', { number: `${res?.events?.draftEventCount}` })}, 
          ${t('dashboard.organization.deleteOrganization.inReview', {
            number: `${res?.events?.pendingEventCount}`,
          })}.`,
          okText: t('dashboard.organization.deleteOrganization.ok'),
          cancelText: t('dashboard.organization.deleteOrganization.cancel'),
          className: 'delete-modal-container',
          onAction: () => {
            deleteOrganization({ id: organizationId, calendarId: calendarId });
          },
        });
      });
  };

  const listItemHandler = (id) => {
    navigate(`${location.pathname}/${id}`);
  };

  const onSearchHandler = (event) => {
    setPageNumber(1);
    setOrganizationSearchQuery(event.target.value);
  };
  const onChangeHandler = (event) => {
    if (event.target.value === '') setOrganizationSearchQuery('');
  };

  const onCheck = ({ checkedKeys, taxonomy }) => {
    if (checkedKeys?.length === 0) {
      // eslint-disable-next-line no-unused-vars
      const { [taxonomy]: removedKey, ...updatedFilter } = taxonomyFilter;
      setTaxonomyFilter(updatedFilter);
    } else setTaxonomyFilter({ ...taxonomyFilter, [taxonomy]: checkedKeys });
  };

  const onStandardTaxonomyCheck = ({ checkedKeys, taxonomy }) => {
    if (checkedKeys?.length === 0) {
      // eslint-disable-next-line no-unused-vars
      const { [taxonomy]: removedKey, ...updatedFilter } = standardTaxonomyFilter;
      setStandardTaxonomyFilter(updatedFilter);
    } else setStandardTaxonomyFilter({ ...standardTaxonomyFilter, [taxonomy]: checkedKeys });
  };

  const filterClearHandler = () => {
    setFilter({
      sort: sortByOptionsOrgsPlacesPerson[0]?.key,
      order: sortOrder?.ASC,
    });
    setTaxonomyFilter({});
    setUserFilter([]);
    setPageNumber(1);

    let usersToClear = selectedUsers;
    Object.keys(usersToClear)?.forEach(function (key) {
      usersToClear[key] = false;
    });
    setSelectedUsers(Object.assign({}, usersToClear));

    sessionStorage.removeItem('organizationPage');
    sessionStorage.removeItem('organizationUsers');
    sessionStorage.removeItem('organizationSearchQuery');
    sessionStorage.removeItem('organizationOrder');
    sessionStorage.removeItem('organizationTaxonomyFilter');
    sessionStorage.removeItem('standardOrganizationTaxonomyFilter');
    sessionStorage.removeItem('organizationSortBy');
  };

  const onCheckboxChange = (e) => {
    let currentUsersFilter = selectedUsers ?? {};
    Object.assign(currentUsersFilter, { [e?.target?.value]: e?.target?.checked });
    setSelectedUsers(currentUsersFilter);
    let filteredUsers = Object.keys(currentUsersFilter).filter(function (key) {
      return currentUsersFilter[key];
    });
    setSelectedUsersData(
      usersData?.filter((userData) => {
        if (filteredUsers?.includes(userData?._id)) return true;
        else return false;
      }),
    );

    setUserFilter(filteredUsers);
    setPageNumber(1);
  };

  const userSearch = (userSearchKey, selectedData) => {
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
        let currentUserList = selectedData?.concat(response?.data?.data);
        currentUserList = [{ _id: user?.id, ...user }]?.concat(currentUserList);
        let uniqueArray = removeObjectArrayDuplicates(currentUserList, '_id');
        setUsersData(uniqueArray);
      })
      .catch((error) => console.log(error));
  };

  const debounceUsersSearch = useCallback(useDebounce(userSearch, SEARCH_DELAY), []);

  useEffect(() => {
    let uniqueArray = removeObjectArrayDuplicates(
      [{ _id: user?.id, ...user }]?.concat(selectedUsersData)?.concat(usersData),
      '_id',
    );
    setUsersData(uniqueArray);
  }, [isUserOpen]);

  useEffect(() => {
    let sortQuery = new URLSearchParams();
    let query = new URLSearchParams();

    let usersQuery;
    if (Array.isArray(userFilter) && userFilter.length > 0) {
      usersQuery = encodeURIComponent(userFilter);
      userFilter.forEach((user) => query.append('created-by', user));
    }

    sortQuery.append(
      'sort',
      encodeURIComponent(
        `${filter?.order}(${filter?.sort}${
          filter?.sort === sortByOptionsOrgsPlacesPerson[0]?.key ? '.' + i18n.language : ''
        })`,
      ),
    );
    Object.keys(taxonomyFilter)?.forEach((taxonomy) => {
      if (taxonomyFilter[taxonomy]?.length > 0) {
        taxonomyFilter[taxonomy]?.forEach((concept) => query.append('concept-ids', concept));
      }
    });

    getAllOrganization({
      calendarId,
      sessionId: timestampRef,
      pageNumber,
      query: organizationSearchQuery,
      sort: sortQuery,
      filterKeys: query,
    });
    let params = {
      page: pageNumber,
      order: filter?.order,
      ...(usersQuery && { users: usersQuery }),
      sortBy: filter?.sort,
      ...(Object.keys(taxonomyFilter)?.length > 0 && { taxonomyFilter: JSON.stringify(taxonomyFilter) }),
    };
    if (organizationSearchQuery && organizationSearchQuery !== '')
      params = {
        ...params,
        query: organizationSearchQuery,
      };
    setSearchParams(createSearchParams(params));

    sessionStorage.setItem('organizationPage', pageNumber);
    usersQuery && sessionStorage.setItem('organizationUsers', usersQuery);
    sessionStorage.setItem('organizationSearchQuery', organizationSearchQuery);
    sessionStorage.setItem('organizationOrder', filter?.order);
    sessionStorage.setItem('organizationSortBy', filter?.sort);
    if (Object.keys(taxonomyFilter)?.length > 0)
      sessionStorage.setItem('organizationTaxonomyFilter', JSON.stringify(taxonomyFilter));
    else sessionStorage.removeItem('organizationTaxonomyFilter');
    if (Object.keys(standardTaxonomyFilter)?.length > 0)
      sessionStorage.setItem('standardOrganizationTaxonomyFilter', JSON.stringify(standardTaxonomyFilter));
    else sessionStorage.removeItem('standardOrganizationTaxonomyFilter');
  }, [pageNumber, organizationSearchQuery, userFilter, filter, taxonomyFilter, standardTaxonomyFilter]);
  return (
    <>
      {dependencyDetailsFetching && (
        <div
          style={{
            height: 'calc(100% - 36px)',
            width: 'calc(100% - 32px)',
            position: 'absolute',
            display: 'flex',
            background: 'rgb(252 252 255 / 46%)',
            zIndex: 100,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LoadingIndicator data-cy="organizations-listing-loader-confirm" />
        </div>
      )}
      {allOrganizationSuccess && currentCalendarData ? (
        <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
          <Main>
            <h4 className="events-heading" data-cy="heading-organizations">
              {t('dashboard.organization.organizations')}
            </h4>
            <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
              <Col style={{ display: 'flex', gap: '12px' }}>
                <ReadOnlyProtectedComponent creator={user?.id}>
                  <EntityReports entity={entitiesClass.organization} />
                </ReadOnlyProtectedComponent>

                <AddOrganization
                  disabled={isReadOnly ? true : false}
                  label={t('dashboard.organization.organization')}
                  onClick={() =>
                    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.Search}`)
                  }
                  data-cy="button-add-organization"
                />
              </Col>
            </FeatureFlag>

            <OrganizationSearch
              placeholder={t('dashboard.organization.search.placeholder')}
              onPressEnter={(e) => onSearchHandler(e)}
              defaultValue={organizationSearchQuery}
              allowClear={true}
              onChange={onChangeHandler}
              data-cy="input-search-organizations"
            />
            <Sort
              filter={filter}
              setFilter={setFilter}
              setPageNumber={setPageNumber}
              filterClearHandler={filterClearHandler}
            />
            <Space>
              {allTaxonomyData?.data?.length > 0 &&
                adminCheckHandler({ user, calendar }) &&
                allTaxonomyData?.data?.map((taxonomy, index) => {
                  if (!taxonomy?.isDynamicField && customFilters?.includes(taxonomy?.id))
                    return (
                      <Col key={index}>
                        <Popover
                          placement="bottom"
                          getPopupContainer={(trigger) => trigger.parentNode}
                          content={
                            <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
                              <Col span={24}>
                                <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'scroll' }}>
                                  <Tree
                                    checkable
                                    autoExpandParent={true}
                                    onCheck={(checkedKeys, { checked, checkedNodes, node, event, halfCheckedKeys }) =>
                                      onStandardTaxonomyCheck({
                                        checkedKeys,
                                        checked,
                                        checkedNodes,
                                        node,
                                        event,
                                        halfCheckedKeys,
                                        taxonomy: taxonomy?.mappedToField,
                                      })
                                    }
                                    checkedKeys={standardTaxonomyFilter[taxonomy?.mappedToField] ?? []}
                                    treeData={treeTaxonomyOptions(
                                      { data: [taxonomy] },
                                      user,
                                      taxonomy?.mappedToField,
                                      false,
                                      calendarContentLanguage,
                                    )}
                                  />
                                </div>
                              </Col>
                            </Row>
                          }
                          trigger="click"
                          overlayClassName="date-filter-popover">
                          <Button
                            size="large"
                            className="filter-buttons"
                            style={{
                              borderColor: standardTaxonomyFilter[taxonomy?.mappedToField]?.length > 0 > 0 && '#607EFC',
                            }}
                            data-cy="button-filter-taxonomy-standard-people">
                            {bilingual({
                              data: taxonomy?.name,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            })}
                            {standardTaxonomyFilter[taxonomy?.mappedToField]?.length > 0 && (
                              <>
                                &nbsp; <Badge color="#1B3DE6" />
                              </>
                            )}
                          </Button>
                        </Popover>
                      </Col>
                    );
                })}
              {allTaxonomyData?.data?.length > 0 &&
                adminCheckHandler({ user, calendar }) &&
                allTaxonomyData?.data?.map((taxonomy, index) => {
                  if (taxonomy?.isDynamicField === true && customFilters?.includes(taxonomy?.id))
                    return (
                      <Col key={index}>
                        <Popover
                          placement="bottom"
                          getPopupContainer={(trigger) => trigger.parentNode}
                          content={
                            <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
                              <Col span={24}>
                                <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'scroll' }}>
                                  <Tree
                                    checkable
                                    autoExpandParent={true}
                                    onCheck={(checkedKeys, { checked, checkedNodes, node, event, halfCheckedKeys }) =>
                                      onCheck({
                                        checkedKeys,
                                        checked,
                                        checkedNodes,
                                        node,
                                        event,
                                        halfCheckedKeys,
                                        taxonomy: taxonomy?.id,
                                      })
                                    }
                                    checkedKeys={taxonomyFilter[taxonomy?.id] ?? []}
                                    treeData={treeTaxonomyOptions(
                                      { data: [taxonomy] },
                                      user,
                                      taxonomy?.mappedToField,
                                      true,
                                      calendarContentLanguage,
                                    )}
                                  />
                                </div>
                              </Col>
                            </Row>
                          }
                          trigger="click"
                          overlayClassName="date-filter-popover">
                          <Button
                            size="large"
                            className="filter-buttons"
                            style={{ borderColor: taxonomyFilter[taxonomy?.id]?.length > 0 > 0 && '#607EFC' }}
                            data-cy="button-filter-taxonomy-people">
                            {bilingual({
                              data: taxonomy?.name,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            })}
                            {taxonomyFilter[taxonomy?.id]?.length > 0 && (
                              <>
                                &nbsp; <Badge color="#1B3DE6" />
                              </>
                            )}
                          </Button>
                        </Popover>
                      </Col>
                    );
                })}

              <Col className="event-filter-item-mobile-full-width">
                <SearchableCheckbox
                  allowSearch={true}
                  loading={allUsersLoading}
                  open={isUserOpen}
                  setOpen={setIsUserOpen}
                  selectedData={selectedUsersData}
                  overlayStyle={{ height: '304px' }}
                  searchImplementation={debounceUsersSearch}
                  setSearchKey={setSearchKey}
                  onOpenChangeHandler={() => {
                    if (!allUsersSuccess && (usersData.length === 0 || usersData.length === 1)) {
                      let allUsersWithSelected = [];
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
                                  setSelectedUsersData(response?.data);
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
                    }
                  }}
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
                              ? t('dashboard.organization.filter.users.myEvents')
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
                {(filter?.order === sortOrder?.DESC ||
                  Object.keys(taxonomyFilter)?.length > 0 ||
                  userFilter.length > 0 ||
                  filter?.sort != sortByOptionsOrgsPlacesPerson[0]?.key) && (
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
            </Space>

            <div className="responsvie-list-wrapper-class">
              {!allOrganizationFetching ? (
                allOrganizationData?.data?.length > 0 ? (
                  <List
                    data-cy="antd-organizations-list"
                    // className="event-list-wrapper"
                    itemLayout={screens.xs ? 'vertical' : 'horizontal'}
                    dataSource={allOrganizationData?.data}
                    bordered={false}
                    pagination={{
                      onChange: (page) => {
                        setPageNumber(page);
                      },
                      pageSize: 10,
                      hideOnSinglePage: true,
                      total: totalCount,
                      current: Number(pageNumber),
                      showSizeChanger: false,
                    }}
                    renderItem={(item, index) => {
                      const mainImageData = item?.image?.find((image) => image?.isMain) || null;
                      return (
                        <ListItem
                          data-cy={`antd-organization-list-item-${index}`}
                          key={index}
                          id={index}
                          logo={item?.logo?.thumbnail?.uri ?? mainImageData?.original?.uri}
                          defaultLogo={
                            <Icon
                              component={OrganizationLogo}
                              style={{ color: '#607EFC', fontSize: '18px' }}
                              data-cy="organization-logo"
                            />
                          }
                          title={contentLanguageBilingual({
                            data: item?.name,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          description={contentLanguageBilingual({
                            data: item?.disambiguatingDescription,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                            calendarContentLanguage: calendarContentLanguage,
                          })}
                          createdDate={item?.creator?.date}
                          createdByUserName={item?.creator?.userName}
                          updatedDate={item?.modifier?.date}
                          updatedByUserName={item?.modifier?.userName}
                          artsDataLink={artsDataLinkChecker(item?.sameAs)}
                          listItemHandler={() => listItemHandler(item?.id)}
                          actions={[
                            adminCheckHandler({ calendar, user }) && !isReadOnly && (
                              <DeleteOutlined
                                key={'delete-icon'}
                                style={{ color: '#222732', fontSize: '24px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOrganizationHandler(item?.id);
                                }}
                                data-cy="delete-organization"
                              />
                            ),
                          ]}
                        />
                      );
                    }}
                  />
                ) : (
                  <NoContent style={{ height: '200px' }} data-cy="empty-organization" />
                )
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingIndicator data-cy="organizations-listing-loader" />
                </div>
              )}
            </div>
          </Main>
        </FeatureFlag>
      ) : (
        <div className="loader-grid">
          <LoadingIndicator />
        </div>
      )}
    </>
  );
}

export default Organizations;
