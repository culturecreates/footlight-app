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
import { Button, Col, Dropdown, Grid, List, Modal, notification, Row, Space } from 'antd';
import ListCard from '../../../../components/List/User/ListCard';
import bulletIcon from '../../../../assets/icons/dot-bullet.svg';
import { userActivityStatus } from '../../../../constants/userActivityStatus';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
  DownOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { sortByOptionsUsers, sortOrder } from '../../../../constants/sortByOptions';
import Username from '../../../../components/Username';
import { PathName } from '../../../../constants/pathName';
import { roleHandler } from '../../../../utils/roleHandler';
import { useInviteUserMutation } from '../../../../services/invite';

const UserManagement = () => {
  const { useBreakpoint } = Grid;
  const { confirm } = Modal;

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  let [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const roleAndStatusFilter = {};
  if (searchParams.get('userRole') || sessionStorage.getItem('userRole')) {
    roleAndStatusFilter.userRole = searchParams.get('userRole')
      ? searchParams.get('userRole')
      : sessionStorage.getItem('userRole') ?? '';
  }
  if (searchParams.get('userStatus') || sessionStorage.getItem('userStatus')) {
    roleAndStatusFilter.userStatus = searchParams.get('userStatus')
      ? searchParams.get('userStatus')
      : sessionStorage.getItem('userStatus') ?? '';
  }
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState();

  const [filter, setFilter] = useState({
    sort: searchParams.get('sortBy')
      ? searchParams.get('sortBy')
      : sessionStorage.getItem('sortBy') ?? sortByOptionsUsers[0]?.key,
    order: searchParams.get('order') ? searchParams.get('order') : sessionStorage.getItem('order') ?? sortOrder?.ASC,
    ...roleAndStatusFilter,
  });

  const [userSearchQuery, setUserSearchQuery] = useState(
    searchParams.get('query') ? searchParams.get('query') : sessionStorage.getItem('query') ?? '',
  );

  const [getAllUsers, { currentData: userData, isLoading: isUsersLoading }] = useLazyGetAllUsersQuery();
  const [inviteUserMutation, { error }] = useInviteUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deActivateUser] = useDeactivateUserMutation();

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  useEffect(() => {
    if (error) {
      notification.info({
        key: 'err',
        message: 'error',
        placement: 'top',
        description: error,
      });
    }
  }, error);

  useEffect(() => {
    let sortQuery = new URLSearchParams();
    let statusFilter = new URLSearchParams();
    let roleFilter = new URLSearchParams();

    sortQuery.append('sort', encodeURIComponent(`${filter?.order}(${filter?.sort})`));
    statusFilter.append('userStatus', encodeURIComponent(`${filter?.userStatus ? filter?.userStatus : ''}`));
    roleFilter.append('userRole', encodeURIComponent(`${filter?.userRole ? filter?.userRole : ''}`));

    const filtersDecoded =
      decodeURIComponent(sortQuery.toString()) +
      '&' +
      decodeURIComponent(statusFilter.toString()) +
      '&' +
      decodeURIComponent(roleFilter.toString());

    getAllUsers({
      page: pageNumber,
      limit: 10,
      filters: filtersDecoded, // userstatus,userRole,a
      query: userSearchQuery,
      sessionId: timestampRef,
      calendarId: calendarId,
      includeCalenderFilter: true,
    })
      .unwrap()
      .then((response) => {
        setTotalCount(response?.count);
      });
  }, [filter, pageNumber, userSearchQuery]);

  useEffect(() => {
    let params = {
      page: pageNumber,
      order: filter?.order,
      sortBy: filter?.sort,
    };

    if (filter?.userRole || searchParams.get('userRole') || sessionStorage.getItem('userRole')) {
      params.userRole = filter.userRole || searchParams.get('userRole') || sessionStorage.getItem('userRole');
      sessionStorage.setItem('userRole', filter.userRole);
    }

    if (filter?.userStatus || searchParams.get('userStatus') || sessionStorage.getItem('userStatus')) {
      params.userStatus = filter.userStatus || searchParams.get('userStatus') || sessionStorage.getItem('userStatus');
      sessionStorage.setItem('userStatus', filter.userStatus);
    }

    setSearchParams(createSearchParams(params));

    sessionStorage.setItem('page', pageNumber);
    sessionStorage.setItem('order', filter?.order);
    sessionStorage.setItem('sortBy', filter?.sort);
    sessionStorage.setItem('query', userSearchQuery);
  }, [filter, userSearchQuery]);

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
      publication: [],
      sort: sortByOptionsUsers[0]?.key,
      order: sortOrder?.ASC,
    });
    setUserSearchQuery('');
    setPageNumber(1);
    sessionStorage.removeItem('page');
    sessionStorage.removeItem('query');
    sessionStorage.removeItem('order');
    sessionStorage.removeItem('sortBy');
    sessionStorage.removeItem('userStatus');
    sessionStorage.removeItem('userRole');
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

  const tooltipItemDisplayHandler = ({ item }) => {
    const dropdownItems = [{ key: 'editUser', label: t('dashboard.settings.userManagement.tooltip.editUser') }];

    if (!item?.isSuperAdmin && item.userStatus === userActivityStatus[2].key) {
      dropdownItems.push({
        key: 'copyInvitationLink',
        label: t('dashboard.settings.userManagement.tooltip.copyInvitationLink'),
      });
    }

    if (item.userStatus === userActivityStatus[2].key && !adminCheckHandler()) {
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

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
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
    switch (key) {
      case 'editUser':
        console.log('edit screen navigation');
        break;

      case 'sendInvitation':
        inviteUserMutation({
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          role: 'GUEST',
          calendarId,
        })
          .unwrap()
          .then((response) => {
            console.log(response);
          });
        break;

      case 'copyInvitationLink':
        // Code to handle 'copyInvitationLink' case
        break;

      case 'activateOrDeactivate':
        if (item.userStatus === userActivityStatus[0].key) {
          confirm({
            title: t('dashboard.events.deleteEvent.title'),
            icon: <ExclamationCircleOutlined />,
            content: t('dashboard.settings.userManagement.tooltip.modal.deactivateText'),
            okText: t('dashboard.events.deleteEvent.ok'),
            okType: 'danger',
            cancelText: t('dashboard.events.deleteEvent.cancel'),
            className: 'delete-modal-container',
            onOk() {
              deActivateUser({ id: item._id, calendarId: calendarId });
            },
          });
        } else if (item.userStatus === userActivityStatus[1].key) {
          confirm({
            title: t('dashboard.events.deleteEvent.title'),
            icon: <ExclamationCircleOutlined />,
            content: t('dashboard.settings.userManagement.tooltip.modal.activateText'),
            okText: t('dashboard.events.deleteEvent.ok'),
            okType: 'danger',
            cancelText: t('dashboard.events.deleteEvent.cancel'),
            className: 'delete-modal-container',
            onOk() {
              activateUser({ id: item._id, calendarId: calendarId });
            },
          });
        }
        break;

      case 'deleteUser':
        confirm({
          title: t('dashboard.events.deleteEvent.title'),
          icon: <ExclamationCircleOutlined />,
          content: t('dashboard.settings.userManagement.tooltip.modal.deleteText'),
          okText: t('dashboard.events.deleteEvent.ok'),
          okType: 'danger',
          cancelText: t('dashboard.events.deleteEvent.cancel'),
          className: 'delete-modal-container',
          onOk() {
            deleteUser({ id: item._id, calendarId: calendarId });
          },
        });
        break;

      default:
        break;
    }
  };

  const listItemHandler = (id) => {
    navigate(`${location.pathname}${PathName.UserManagement}/${id}`);
  };

  return !isUsersLoading ? (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={24}>
        <Row gutter={[20, 10]}>
          <Col xs={24} sm={24} md={12} lg={10} xl={8}>
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
                    selectable: true,
                    defaultSelectedKeys: [filter?.sort],
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
                selectable: true,
                defaultSelectedKeys: [filter?.userRole],
                onSelect: handleStatusFilterChange,
              }}
              trigger={['click']}>
              <Space>
                <Button size="large" className="filter-buttons" style={{ borderColor: filter?.userRole && '#607EFC' }}>
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
                <Button size="large" className="filter-buttons" style={{ borderColor: filter?.userRole && '#607EFC' }}>
                  {t('dashboard.settings.userManagement.userTypes')}
                </Button>
              </Space>
            </Dropdown>
          </Col>

          <Col>
            <Button size="large" className="filter-buttons" style={{ color: '#1B3DE6' }} onClick={filterClearHandler}>
              {t('dashboard.events.filter.clear')}&nbsp;
              <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
            </Button>
          </Col>
        </Row>

        <Row>
          <Col span={16}>
            {userData?.data.length > 0 ? (
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
                    title={createTitleHandler(item?.firstName, item?.lastName, item?.username)}
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
