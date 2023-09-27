import React, { useEffect, useRef, useState } from 'react';
import UserSearch from '../../../../components/Search/Events/EventsSearch';
import { useNavigate, useParams, useSearchParams, createSearchParams } from 'react-router-dom';
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
import { useInviteUserMutation } from '../../../../services/invite';
import AddEvent from '../../../../components/Button/AddEvent';
import { copyText } from '../../../../utils/copyText';
import ReadOnlyProtectedComponent from '../../../../layout/ReadOnlyProtectedComponent';
import { Confirm } from '../../../../components/Modal/Confirm/Confirm';

const UserManagement = () => {
  const { useBreakpoint } = Grid;

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  let [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState();

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

  const [getAllUsers, { currentData: userData, isFetching: isUsersLoading }] = useLazyGetAllUsersQuery();
  const [inviteUserMutation] = useInviteUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deActivateUser] = useDeactivateUserMutation();

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  useEffect(() => {
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

    getAllUsers({
      page: pageNumber,
      limit: 10,
      filters: filtersDecoded,
      query: userSearchQuery,
      sessionId: timestampRef,
      calendarId: calendarId,
      includeCalenderFilter: true,
    })
      .unwrap()
      .then((response) => {
        setTotalCount(response?.count);
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

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  const tooltipItemDisplayHandler = ({ item }) => {
    const dropdownItems = [];
    const userStatus = item.roles.filter((i) => {
      if (i.calendarId === calendarId) {
        return i.role;
      }
    });
    if (adminCheckHandler()) {
      dropdownItems.push({ key: 'editUser', label: t('dashboard.settings.userManagement.tooltip.editUser') });
    }

    if (!item?.isSuperAdmin) {
      dropdownItems.push({
        key: 'copyInvitationLink',
        label: t('dashboard.settings.userManagement.tooltip.copyInvitationLink'),
      });
    }

    if (userStatus[0]?.status === 'REMOVED' && adminCheckHandler()) {
      dropdownItems.push({
        key: 'sendInvitation',
        label: t('dashboard.settings.userManagement.tooltip.sendInvitation'),
      });
    }

    if (item.userStatus !== userActivityStatus[2].key && !item?.isSuperAdmin) {
      dropdownItems.push({
        key: 'activateOrDeactivate',
        label: t('dashboard.settings.userManagement.tooltip.activateOrDeactivate'),
      });
    }

    if (item.userStatus === userActivityStatus[1].key) {
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

  const createTitleHandler = (firstName, lastName, userName) => {
    return (
      <div className="title-wrapper">
        <span>{firstName + ' ' + lastName}</span>
        <img src={bulletIcon} />
        <Username userName={userName} />
      </div>
    );
  };

  const tooltipItemClickHandler = ({ key, item }) => {
    let invitationLink;
    const userRole = item.roles.filter((i) => {
      if (i.calendarId === calendarId) {
        return i.role;
      }
    });
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
          calendarId,
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
        if (item.userStatus === userActivityStatus[0].key) {
          deActivateUser({ id: item._id, calendarId: calendarId });
        } else if (item.userStatus === userActivityStatus[1].key) {
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

      default:
        break;
    }
  };

  const addEventHandler = () => {
    navigate(`${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}${PathName.AddUser}`);
  };

  const listItemHandler = (id) => {
    adminCheckHandler() && navigate(`${location.pathname}${PathName.UserManagement}/${id}`);
  };

  return !isUsersLoading ? (
    <Row gutter={[10, 24]} className="user-management-wrapper">
      <Col span={24}>
        <Row justify="space-between" gutter={[24, 16]} wrap={screens.xl && false}>
          <Col xl={17}>
            <Row gutter={[20, 16]}>
              <Col flex="400px">
                <UserSearch
                  placeholder={t('dashboard.settings.userManagement.searchPlaceholder')}
                  onPressEnter={(e) => onSearchHandler(e)}
                  defaultValue={userSearchQuery}
                  allowClear={true}
                  onChange={onSearchChangeHandler}
                />
              </Col>
              <Col>
                <Row gutter={[8]} align="middle">
                  <span style={{ fontSize: '16px', fontWeight: 700, marginRight: 8 }}>
                    {t('dashboard.settings.userManagement.sort')}
                  </span>

                  <Col>
                    <Dropdown
                      overlayClassName="filter-sort-dropdown-wrapper"
                      overlayStyle={{ minWidth: '200px' }}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      menu={{
                        items: sortByOptionsUsers,
                        defaultSelectedKeys: [filter?.sort],
                        selectable: true,
                        onSelect: onSortSelect,
                      }}
                      trigger={['click']}>
                      <Button size="large" className="filter-sort-button">
                        <Space>
                          {sortByOptionsUsers?.map((sortBy, index) => {
                            if (sortBy?.key === filter?.sort) return <span key={index}>{sortBy?.label}</span>;
                          })}
                          <DownOutlined style={{ fontSize: '12px', color: '#222732' }} />
                        </Space>
                      </Button>
                    </Dropdown>
                  </Col>
                  <Col>
                    <Button
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
                  </Col>
                </Row>
              </Col>
              <Col>
                <Dropdown
                  overlayClassName="filter-sort-dropdown-wrapper"
                  getPopupContainer={(trigger) => trigger.parentNode}
                  overlayStyle={{ minWidth: '200px' }}
                  menu={{
                    items: userActivityStatus,
                    defaultSelectedKeys: [filter?.userRole],
                    selectable: true,
                    onSelect: handleStatusFilterChange,
                  }}
                  trigger={['click']}>
                  <Space>
                    <Button
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
                  overlayClassName="filter-sort-dropdown-wrapper"
                  getPopupContainer={(trigger) => trigger.parentNode}
                  overlayStyle={{ minWidth: '200px' }}
                  menu={{
                    items: userRolesWithTranslation,
                    selectable: true,
                    onSelect: userTypeFilterChangeHandler,
                  }}
                  trigger={['click']}>
                  <Space>
                    <Button
                      size="large"
                      className="filter-buttons"
                      style={{ borderColor: filter?.userRole && '#607EFC' }}>
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
                    onClick={filterClearHandler}>
                    {t('dashboard.events.filter.clear')}&nbsp;
                    <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
                  </Button>
                )}
              </Col>
            </Row>
          </Col>
          <Col>
            <Row>
              <Col>
                <ReadOnlyProtectedComponent>
                  <AddEvent label={t('dashboard.settings.userManagement.addUser')} onClick={addEventHandler} />
                </ReadOnlyProtectedComponent>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col flex={'832px'}>
        <Row>
          <Col span={24}>
            {userData?.data.length && !isUsersLoading > 0 ? (
              <List
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
                  total: totalCount,
                  current: Number(pageNumber),
                  showSizeChanger: false,
                }}
                renderItem={(item, index) => (
                  <ListCard
                    id={index}
                    key={index}
                    listItemHandler={() => listItemHandler(item?._id)}
                    title={createTitleHandler(item?.firstName, item?.lastName, item?.userName)}
                    description={roleHandler({ roles: item?.roles, calendarId })}
                    activityStatus={item?.userStatus}
                    invitedBy={item?.invitedBy && <Username userName={item?.invitedBy} />}
                    actions={[
                      adminCheckHandler() && (
                        <Dropdown
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
                            <MoreOutlined className="event-list-more-icon" key={index} />
                          </span>
                        </Dropdown>
                      ),
                    ]}
                  />
                )}
              />
            ) : (
              <NoContent style={{ height: '200px' }} />
            )}
          </Col>
        </Row>
      </Col>
    </Row>
  ) : (
    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingIndicator />
    </div>
  );
};

export default UserManagement;
