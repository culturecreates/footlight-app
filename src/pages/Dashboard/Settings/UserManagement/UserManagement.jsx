import React, { useEffect, useRef, useState } from 'react';
import UserSearch from '../../../../components/Search/Events/EventsSearch';
import { useNavigate, useParams, useSearchParams, createSearchParams } from 'react-router-dom';
import { useGetAllUsersQuery } from '../../../../services/users';
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
import SearchableCheckbox from '../../../../components/Filter/SearchableCheckbox';
import { SortAscendingOutlined, SortDescendingOutlined, DownOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { sortByOptionsUsers, sortOrder } from '../../../../constants/sortByOptions';
import Username from '../../../../components/Username';
import { PathName } from '../../../../constants/pathName';
import { roleHandler } from '../../../../utils/roleHandler';

const UserManagement = () => {
  const { useBreakpoint } = Grid;

  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const { t } = useTranslation();
  const { user } = useSelector(getUserDetails);
  let [searchParams, setSearchParams] = useSearchParams();

  //   const [currentCalendarData] = useOutletContext();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  //   const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { data: allUsersData, isLoading: allUsersLoading } = useGetAllUsersQuery({
    calendarId,
    includeInactiveUsers: true,
    includeCalendarFilter: false,
    sessionId: timestampRef,
  });

  const totalCount = allUsersData?.count;
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const [pageNumber, setPageNumber] = useState(1);
  const [combinedUserData, setCombinedUserData] = useState([]);
  const [filter, setFilter] = useState({
    sort: sortByOptionsUsers[0]?.key,
    order: searchParams.get('order') ? searchParams.get('order') : sessionStorage.getItem('order') ?? sortOrder?.ASC,
    activityStatus: userActivityStatus[0]?.key,
  });

  useEffect(() => {
    setPageNumber(1);
    let params = {
      page: pageNumber,
      order: filter?.order,
      sortBy: filter?.sort,
    };

    setSearchParams(createSearchParams(params));

    if (allUsersData?.data) {
      setCombinedUserData([...allUsersData.data.active, ...allUsersData.data.inactive, ...allUsersData.data.invited]);
    }
    setFilter({
      sort: sortByOptionsUsers[0]?.key,
      order: searchParams.get('order') ? searchParams.get('order') : sessionStorage.getItem('order') ?? sortOrder?.ASC,
      activityStatus: userActivityStatus[0]?.key,
    });
  }, [allUsersLoading]);

  // handlers
  const onSearchHandler = (event) => {
    // Uncomment the next line to set the search query state:
    // setOrganizationSearchQuery(event.target.value);
    console.log(event);
  };

  const filterClearHandler = () => {
    console.log('cleared filters');
  };

  const onSortSelect = ({ selectedKeys }) => {
    setFilter({
      ...filter,
      sort: selectedKeys[0],
      order: sortOrder?.ASC,
    });
    setPageNumber(1);
  };

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  const createTitleHandler = (firstName, lastName) => {
    return (
      <div className="title-wrapper">
        <span>{firstName + ' ' + lastName}</span>
        <img src={bulletIcon} />
        <Username firstName={firstName} lastName={lastName} />
      </div>
    );
  };

  const listItemHandler = (id) => {
    navigate(`${location.pathname}${PathName.UserManagement}/${id}`);
  };

  return !allUsersLoading ? (
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="events-wrapper">
      <Col span={24}>
        <Row gutter={[20, 10]}>
          <Col xs={24} sm={24} md={12} lg={10} xl={8}>
            <UserSearch
              placeholder={t('dashboard.settings.userManagement.searchPlaceholder')}
              onPressEnter={(e) => onSearchHandler(e)}
              // defaultValue={organizationSearchQuery}
              allowClear={true}
              // onChange={onChangeHandler}
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
                  // onClick={onSortOrderChange}
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
            <SearchableCheckbox
              // onFilterChange={(values) => onFilterChange(values, filterTypes.PUBLICATION)}
              data={userActivityStatus?.map((activityStatus) => {
                return {
                  key: activityStatus.key,
                  label: <div>{activityStatus.label}</div>,
                  filtervalue: activityStatus.key,
                };
              })}
              value={filter?.publication}>
              <Button
                size="large"
                className="filter-buttons"
                style={{ borderColor: filter?.publication?.length > 0 && '#607EFC' }}>
                {t('dashboard.settings.userManagement.status')}
              </Button>
            </SearchableCheckbox>
          </Col>
          <Col>
            <SearchableCheckbox
              // onFilterChange={(values) => onFilterChange(values, filterTypes.PUBLICATION)}
              data={userRolesWithTranslation?.map((role) => {
                return {
                  key: role.key,
                  label: <div>{role.label}</div>,
                  filtervalue: role.key,
                };
              })}
              value={filter?.publication}>
              <Button
                size="large"
                className="filter-buttons"
                style={{ borderColor: filter?.publication?.length > 0 && '#607EFC' }}>
                {t('dashboard.settings.userManagement.userTypes')}
              </Button>
            </SearchableCheckbox>
          </Col>

          <Col>
            <Button size="large" className="filter-buttons" style={{ color: '#1B3DE6' }} onClick={filterClearHandler}>
              {t('dashboard.events.filter.clear')}&nbsp;
              <CloseCircleOutlined style={{ color: '#1B3DE6', fontSize: '16px' }} />
            </Button>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            {combinedUserData.length > 0 ? (
              <List
                className="event-list-wrapper"
                itemLayout={screens.xs ? 'vertical' : 'horizontal'}
                dataSource={combinedUserData}
                bordered={false}
                pagination={{
                  onChange: (page) => {
                    console.log(page);
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
                    listItemHandler={() => listItemHandler(item?.id)}
                    title={createTitleHandler(item?.firstName, item?.lastName)}
                    description={roleHandler({ roles: item?.roles, calendarId })}
                    activityStatus={item?.userStatus}
                    invitedBy={<Username firstName={item?.firstName} lastName={item?.lastName} />}
                    actions={[
                      adminCheckHandler() && (
                        <span>
                          <MoreOutlined className="event-list-more-icon" key={index} />
                        </span>
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
