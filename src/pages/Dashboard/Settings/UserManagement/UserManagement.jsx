import React, { useEffect, useRef, useState } from 'react';
import UserSearch from '../../../../components/Search/Events/EventsSearch';
import { useNavigate, useParams, useSearchParams, createSearchParams, useOutletContext } from 'react-router-dom';
import {
  useActivateUserMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
  useLazyGetAllUsersQuery,
} from '../../../../services/users';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../../redux/reducer/userSlice';
import { MoreOutlined } from '@ant-design/icons';
import NoContent from '../../../../components/NoContent/NoContent';
import './userManagement.css';
import { userRoles, userRolesWithTranslation } from '../../../../constants/userRoles';
import { Button, Col, Dropdown, Grid, List, Row, Space } from 'antd';
import ListCard from '../../../../components/List/User/ListCard';
import bulletIcon from '../../../../assets/icons/dot-bullet.svg';
import { userActivityStatus } from '../../../../constants/userActivityStatus';
import { SortAscendingOutlined, SortDescendingOutlined, DownOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { sortByOptionsUsers, sortOrder } from '../../../../constants/sortByOptions';
import Username from '../../../../components/Username';
import { PathName } from '../../../../constants/pathName';
import { roleHandler } from '../../../../utils/roleHandler';
import { useInviteUserMutation, useWithDrawInvitationMutation } from '../../../../services/invite';
import AddEvent from '../../../../components/Button/AddEvent';
import { copyText } from '../../../../utils/copyText';
import ReadOnlyProtectedComponent from '../../../../layout/ReadOnlyProtectedComponent';
import { Confirm } from '../../../../components/Modal/Confirm/Confirm';
import moment from 'moment-timezone';
import i18n from 'i18next';
import { adminCheckHandler } from '../../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../../utils/getCurrentCalendarDetailsFromUserDetails';

const UserManagement = () => {
  const { useBreakpoint } = Grid;
  const [
    // eslint-disable-next-line no-unused-vars
    currentCalendarData,
    pageNumber,
    setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    // eslint-disable-next-line no-unused-vars
    setContentBackgroundColor,
    // eslint-disable-next-line no-unused-vars
    isReadOnly,
  ] = useOutletContext();

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  let [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const sortByParam = searchParams.get('sortBy');
  const orderParam = searchParams.get('order');
  const userRoleParam = searchParams.get('userRole');
  const userStatusParam = searchParams.get('userStatus');
  const queryParam = searchParams.get('query');

  const defaultSort = sortByParam || sessionStorage.getItem('sortByUserListing') || sortByOptionsUsers[0]?.key;
  const defaultOrder = orderParam || sessionStorage.getItem('orderUserListing') || sortOrder?.ASC;
  const defaultUserRole = userRoleParam || sessionStorage.getItem('userRoleUserListing') || '';
  const defaultUserStatus = userStatusParam || sessionStorage.getItem('userStatusUserListing') || '';
  const defaultQuery = queryParam || sessionStorage.getItem('queryUserListing') || '';

  const [filter, setFilter] = useState({
    sort: decodeURIComponent(defaultSort),
    order: decodeURIComponent(defaultOrder),
    userRole: decodeURIComponent(defaultUserRole),
    userStatus: decodeURIComponent(defaultUserStatus),
  });
  const [userSearchQuery, setUserSearchQuery] = useState(decodeURIComponent(defaultQuery));
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [getAllUsers, { currentData: userData, isFetching: isUsersLoading }] = useLazyGetAllUsersQuery();
  const [inviteUserMutation] = useInviteUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deActivateUser] = useDeactivateUserMutation();
  const [withdrawInvitation] = useWithDrawInvitationMutation();

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  useEffect(() => {
    const filtersDecoded = setFiletrsForApiCall();

    getAllUsers({
      page: pageNumber,
      limit: 10,
      filters: filtersDecoded,
      query: userSearchQuery,
      sessionId: timestampRef,
      calendarId: calendarId,
      includeCalenderFilter: true,
    });

    let params = {
      page: pageNumber,
      order: filter?.order,
      sortBy: filter?.sort,
      ...(filter.userRole !== '' && { userRole: filter.userRole }),
      ...(filter.userStatus !== '' && { userStatus: filter.userStatus }),
      ...(userSearchQuery !== '' && { query: userSearchQuery }),
    };
    setSearchParams(createSearchParams(params));
    sessionStorage.setItem('page', pageNumber);
    sessionStorage.setItem('queryUserListing', userSearchQuery);
    sessionStorage.setItem('orderUserListing', filter?.order);
    sessionStorage.setItem('sortByUserListing', filter?.sort);
    sessionStorage.setItem('userRoleUserListing', filter?.userRole);
    sessionStorage.setItem('userStatusUserListing', filter?.userStatus);
  }, [filter, pageNumber, userSearchQuery]);

  // handlers
  const onSearchHandler = (event) => {
    setPageNumber(1);
    setUserSearchQuery(event.target.value);
  };

  const setFiletrsForApiCall = () => {
    let sortQuery = new URLSearchParams();
    let optionalFilters = new URLSearchParams();

    sortQuery.append('sort', encodeURIComponent(`${filter?.order}(${filter?.sort})`));

    if (filter.userStatus !== '') {
      optionalFilters.append('userStatus', encodeURIComponent(`${filter?.userStatus && filter?.userStatus}`));
    }
    if (filter.userRole !== '') {
      optionalFilters.append('userRole', encodeURIComponent(`${filter?.userRole && filter?.userRole}`));
    }
    const filtersDecoded =
      decodeURIComponent(sortQuery.toString()) + '&' + decodeURIComponent(optionalFilters.toString());
    return filtersDecoded;
  };

  const handleSortOrderChange = () => {
    setPageNumber(1);
    filter?.order === sortOrder?.ASC
      ? setFilter({ ...filter, order: sortOrder?.DESC })
      : setFilter({ ...filter, order: sortOrder?.ASC });
  };

  const filterClearHandler = () => {
    setFilter({
      sort: sortByOptionsUsers[0]?.key,
      order: sortOrder?.ASC,
      userRole: '',
      userStatus: '',
    });
    setUserSearchQuery('');
    setPageNumber(1);
    sessionStorage.removeItem('page');
    sessionStorage.removeItem('query');
    sessionStorage.removeItem('orderUserListing');
    sessionStorage.removeItem('sortByUserListing');
    sessionStorage.removeItem('userStatusUserListing');
    sessionStorage.removeItem('userRoleUserListing');
  };

  const onSortSelect = ({ selectedKeys }) => {
    setFilter({
      ...filter,
      sort: selectedKeys[0],
      order: sortOrder?.ASC,
    });
    setPageNumber(1);
  };

  const userTypeFilterChangeHandler = ({ selectedKeys }) => {
    setPageNumber(1);
    setFilter({ ...filter, userRole: selectedKeys[0] });
  };

  const handleStatusFilterChange = ({ selectedKeys }) => {
    setPageNumber(1);
    setFilter({ ...filter, userStatus: selectedKeys[0] });
  };

  const handleListCardStyles = (item) => {
    const listCardStyles =
      calendar[0]?.role === userRoles.GUEST && item._id != user.id
        ? { style: { cursor: 'initial', padding: '24px' } }
        : { style: { padding: '24px' } };
    return listCardStyles;
  };

  const currentCalendarUserStatus = (item) => {
    if (item?.roles.length == 0) {
      return userActivityStatus[0].key;
    }
    const activeCalendar = item?.roles.filter((r) => {
      return r.calendarId == calendarId;
    });
    return activeCalendar[0]?.status;
  };

  const tooltipItemDisplayHandler = ({ item }) => {
    const dropdownItems = [];
    const userStatus = item?.roles.filter((i) => {
      if (i.calendarId === calendarId) {
        return i.role;
      }
    });

    const isUserInactiveInThisCalendar =
      userStatus[0]?.status === userActivityStatus[1].key ||
      userStatus[0]?.status === userActivityStatus[3].key ||
      userStatus[0]?.status === userActivityStatus[4].key;

    if (adminCheckHandler({ calendar, user })) {
      dropdownItems.push({ key: 'editUser', label: t('dashboard.settings.userManagement.tooltip.editUser') });
    }

    if (adminCheckHandler({ calendar, user }) && userStatus[0]?.status === userActivityStatus[2].key) {
      dropdownItems.push({
        key: 'withDrawInvitation',
        label: t('dashboard.settings.userManagement.tooltip.withDrawInvitation'),
      });
    }

    if (!item?.isSuperAdmin && !isUserInactiveInThisCalendar) {
      dropdownItems.push({
        key: 'copyInvitationLink',
        label: t('dashboard.settings.userManagement.tooltip.copyInvitationLink'),
      });
    }

    if (isUserInactiveInThisCalendar && adminCheckHandler({ calendar, user })) {
      dropdownItems.push({
        key: 'sendInvitation',
        label: t('dashboard.settings.userManagement.tooltip.sendInvitation'),
      });
    }

    if (
      !(userStatus[0]?.status === userActivityStatus[4].key || userStatus[0]?.status === userActivityStatus[2].key) &&
      !item?.isSuperAdmin
    ) {
      if (!(userStatus[0]?.status == userActivityStatus[0].key)) {
        dropdownItems.push({
          key: 'activateOrDeactivate',
          label: t('dashboard.settings.userManagement.tooltip.activate'),
        });
      } else {
        dropdownItems.push({
          key: 'activateOrDeactivate',
          label: t('dashboard.settings.userManagement.tooltip.deactivate'),
        });
      }
    }

    if (
      !(userStatus[0]?.status === userActivityStatus[0].key || userStatus[0]?.status === userActivityStatus[2].key) &&
      !item?.isSuperAdmin
    ) {
      dropdownItems.push({
        key: 'deleteUser',
        label: t('dashboard.settings.userManagement.tooltip.deleteUser'),
      });
    }

    return dropdownItems;
  };

  const onSearchChangeHandler = (event) => {
    if (event.target.value === '') setUserSearchQuery('');
  };

  const cancelInvitationHandler = (userInvitationId) => {
    withdrawInvitation({ id: userInvitationId[0]?.invitationId, calendarId })
      .unwrap()
      .then((res) => {
        if (res?.statusCode == 202) {
          const filtersDecoded = setFiletrsForApiCall();
          getAllUsers({
            page: pageNumber,
            limit: 10,
            filters: filtersDecoded,
            query: userSearchQuery,
            sessionId: timestampRef,
            calendarId: calendarId,
            includeCalenderFilter: true,
          });
        }
      });
  };

  const createTitleHandler = (firstName, lastName, userName) => {
    return (
      <div className="title-wrapper">
        <span className="name">{firstName + ' ' + lastName}</span>
        <img src={bulletIcon} />
        <Username userName={userName} />
      </div>
    );
  };

  const tooltipItemClickHandler = ({ key, item }) => {
    let invitationLink;
    const userRole = item?.roles.filter((i) => {
      if (i.calendarId === calendarId) {
        return i.role;
      }
    });

    const userStatus = item?.roles.filter((i) => {
      if (i.calendarId === calendarId) {
        return i.role;
      }
    });

    const userInvitationId = item?.roles.filter((i) => {
      if (i.calendarId === calendarId) {
        return i?.invitationId;
      }
    });

    const isUserInactiveInThisCalendar =
      userStatus[0]?.status === userActivityStatus[1].key || userActivityStatus[3].key || userActivityStatus[4].key;

    switch (key) {
      case 'editUser':
        navigate(
          `${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}?id=${item._id}`,
        );
        break;

      case 'sendInvitation':
        inviteUserMutation({
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          role: userRole[0]?.role,
          language: user?.interfaceLanguage,
          calendarId,
        })
          .unwrap()
          .then((res) => {
            if (res.statusCode == 202) {
              const filtersDecoded = setFiletrsForApiCall();
              getAllUsers({
                page: pageNumber,
                limit: 10,
                filters: filtersDecoded,
                query: userSearchQuery,
                sessionId: timestampRef,
                calendarId: calendarId,
                includeCalenderFilter: true,
              });
            }
          });
        break;

      case 'copyInvitationLink':
        if (item?.userStatus === 'ACTIVE') invitationLink = process.env.REACT_APP_ACCEPT_URL + item?.invitationId;
        else if (item?.userStatus === 'INVITED') invitationLink = process.env.REACT_APP_INVITE_URL + item?.invitationId;
        copyText({
          textToCopy: invitationLink,
          message: t('dashboard.settings.userManagement.tooltip.modal.copyText'),
        });
        break;

      case 'activateOrDeactivate':
        if (userStatus[0]?.status === userActivityStatus[0].key) {
          deActivateUser({ id: item._id, calendarId: calendarId });
        } else if (isUserInactiveInThisCalendar) {
          activateUser({ id: item._id, calendarId: calendarId });
        }
        break;

      case 'deleteUser':
        Confirm({
          title: t('dashboard.settings.userManagement.tooltip.deleteUser'),
          onAction: () => deleteUser({ id: item._id, calendarId: calendarId }),
          okText: t('dashboard.settings.addUser.delete'),
          cancelText: t('dashboard.settings.addUser.cancel'),
          content: t('dashboard.settings.addUser.notification.deleteUser'),
        });
        break;

      case 'withDrawInvitation':
        Confirm({
          title: t('dashboard.settings.userManagement.tooltip.modal.cancelInvitationTitle'),
          onAction: () => cancelInvitationHandler(userInvitationId),
          okText: t('dashboard.settings.addUser.delete'),
          cancelText: t('dashboard.settings.addUser.cancel'),
          content: t('dashboard.settings.userManagement.tooltip.modal.cancelInvitationMessage'),
        });

        break;
      default:
        break;
    }
  };

  const addUserHandler = () => {
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}`);
  };

  const listItemHandler = (id) => {
    if (adminCheckHandler({ calendar, user })) {
      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}/${id}`);
    } else if (id === user.id) {
      navigate(
        `${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}?id=${id}`,
      );
    }
  };

  return (
    <Row gutter={[10, 24]} className="user-management-wrapper">
      <Col span={24}>
        <Row justify="space-between" gutter={[24, 16]} style={{ marginBottom: 16 }}>
          <Col flex={'auto'}>
            <Row gutter={[8, 8]} align="middle">
              <Col flex={'auto'} style={{ marginRight: '24px', maxWidth: 400 }} className="user-search-wrapper">
                <UserSearch
                  placeholder={t('dashboard.settings.userManagement.searchPlaceholder')}
                  onPressEnter={(e) => onSearchHandler(e)}
                  defaultValue={userSearchQuery}
                  allowClear={true}
                  onChange={onSearchChangeHandler}
                  data-cy="input-user-search"
                />
              </Col>
              <Col>
                <Row align="middle" className="sort-option-row">
                  <span style={{ fontSize: '16px', fontWeight: 700, marginRight: 8 }} data-cy="span-user-sort">
                    {t('dashboard.settings.userManagement.sort')}
                  </span>

                  <Dropdown
                    data-cy="dropdown-user-sort"
                    overlayClassName="filter-sort-dropdown-wrapper"
                    overlayStyle={{ minWidth: '200px' }}
                    getPopupContainer={(trigger) => trigger.parentNode}
                    menu={{
                      items: sortByOptionsUsers,
                      selectedKeys: [filter?.sort],
                      selectable: true,
                      onSelect: onSortSelect,
                    }}
                    trigger={['click']}>
                    <Button size="large" className="filter-sort-button" data-cy="button-user-sort">
                      <Space>
                        {sortByOptionsUsers?.map((sortBy, index) => {
                          if (sortBy?.key === filter?.sort) return <span key={index}>{sortBy?.label}</span>;
                        })}
                        <DownOutlined style={{ fontSize: '12px', color: '#222732' }} />
                      </Space>
                    </Button>
                  </Dropdown>
                  <Button
                    data-cy="button-user-sort-order"
                    className="filter-sort-button"
                    style={{ borderColor: filter?.order && '#1B3DE6' }}
                    onClick={handleSortOrderChange}
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
                  />
                </Row>
              </Col>
            </Row>
          </Col>

          <Col flex={'140px'} className="add-btn-container">
            {adminCheckHandler({ calendar, user }) && (
              <ReadOnlyProtectedComponent>
                <AddEvent
                  label={t('dashboard.settings.userManagement.addUser')}
                  onClick={addUserHandler}
                  data-cy="button-add-user"
                />
              </ReadOnlyProtectedComponent>
            )}
          </Col>
        </Row>

        <Row gutter={[8]} align="middle">
          <Col>
            <Dropdown
              data-cy="dropdown-user-status"
              overlayClassName="filter-sort-dropdown-wrapper"
              getPopupContainer={(trigger) => trigger.parentNode}
              overlayStyle={{ minWidth: '200px' }}
              menu={{
                items: userActivityStatus.slice(0, 3),
                selectedKeys: [filter?.userStatus],
                selectable: true,
                onSelect: handleStatusFilterChange,
              }}
              trigger={['click']}>
              <Space>
                <Button
                  data-cy="button-user-status"
                  size="large"
                  className="filter-buttons"
                  style={{ borderColor: filter?.userStatus && '#607EFC' }}>
                  {t('dashboard.settings.userManagement.status')}
                </Button>
              </Space>
            </Dropdown>
          </Col>
          <Col>
            <Dropdown
              data-cy="dropdown-user-type"
              overlayClassName="filter-sort-dropdown-wrapper"
              getPopupContainer={(trigger) => trigger.parentNode}
              overlayStyle={{ minWidth: '200px' }}
              menu={{
                items: userRolesWithTranslation,
                selectedKeys: [filter?.userRole],
                selectable: true,
                onSelect: userTypeFilterChangeHandler,
              }}
              trigger={['click']}>
              <Space>
                <Button
                  size="large"
                  className="filter-buttons"
                  style={{ borderColor: filter?.userRole && '#607EFC' }}
                  data-cy="button-user-status">
                  {t('dashboard.settings.userManagement.userTypes')}
                </Button>
              </Space>
            </Dropdown>
          </Col>

          <Col>
            {(filter.order !== sortOrder.ASC ||
              filter.sort !== sortByOptionsUsers[0].key ||
              filter.userRole !== '' ||
              filter.userStatus !== '') && (
              <Button
                size="large"
                className="filter-buttons"
                style={{ color: '#1B3DE6' }}
                onClick={filterClearHandler}
                data-cy="button-user-fiter-clear">
                {t('dashboard.events.filter.clear')}&nbsp;
                <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
              </Button>
            )}
          </Col>
        </Row>
      </Col>
      {!isUsersLoading ? (
        <Col flex={'832px'}>
          <Row>
            <Col span={24}>
              {userData?.data.length && !isUsersLoading > 0 ? (
                <List
                  data-cy="list-user"
                  className="event-list-wrapper"
                  itemLayout={screens.xs ? 'vertical' : 'horizontal'}
                  dataSource={userData?.data}
                  bordered={false}
                  pagination={{
                    onChange: (page) => {
                      setPageNumber(page);
                      window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                      });
                    },
                    pageSize: 10,
                    hideOnSinglePage: true,
                    total: userData?.count,
                    current: Number(pageNumber),
                    showSizeChanger: false,
                  }}
                  renderItem={(item, index) => {
                    let userCurrentCalendarDetails = item?.roles?.filter((i) => {
                      if (i.calendarId === calendarId) {
                        return i;
                      }
                    });
                    return (
                      <ListCard
                        data-cy="list-card-user"
                        id={index}
                        key={index}
                        listItemHandler={() => {
                          return listItemHandler(item?._id);
                        }}
                        title={createTitleHandler(item?.firstName, item?.lastName, item?.userName)}
                        description={roleHandler({ roles: item?.roles, calendarId })}
                        activityStatus={currentCalendarUserStatus(item)}
                        styles={handleListCardStyles(item)}
                        invitedBy={item?.invitedBy && <Username userName={item?.invitedBy} />}
                        invitedDate={
                          userCurrentCalendarDetails?.length > 0 &&
                          moment
                            .tz(userCurrentCalendarDetails[0]?.invitedOn, item?.scheduleTimezone ?? 'Canada/Eastern')
                            .locale(i18n.language)
                            .format('DD-MMM-YYYY')
                            ?.toUpperCase()
                        }
                        actions={[
                          adminCheckHandler({ calendar, user }) && (
                            <Dropdown
                              onOpenChange={(open) => {
                                if (open) setSelectedItemId(item?._id);
                                else setSelectedItemId(null);
                              }}
                              data-cy="dropdown-user-actions"
                              overlayClassName="filter-sort-dropdown-wrapper"
                              overlayStyle={{ minWidth: '200px' }}
                              getPopupContainer={(trigger) => trigger.parentNode}
                              menu={{
                                items: tooltipItemDisplayHandler({ item }),
                                onClick: ({ key }) => {
                                  tooltipItemClickHandler({ key, item });
                                },
                              }}
                              trigger={['click']}>
                              <span>
                                {!item?.isSuperAdmin && user?.id != item?._id ? (
                                  <MoreOutlined
                                    className="event-list-more-icon"
                                    key={index}
                                    style={{ color: selectedItemId === item?._id && '#1B3DE6' }}
                                  />
                                ) : (
                                  <div style={{ width: 24 }}></div>
                                )}
                              </span>
                            </Dropdown>
                          ),
                        ]}
                      />
                    );
                  }}
                />
              ) : (
                <NoContent style={{ height: '200px' }} />
              )}
            </Col>
          </Row>
        </Col>
      ) : (
        <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingIndicator data-cy="loading-indicator-user" />
        </div>
      )}
    </Row>
  );
};

export default UserManagement;
