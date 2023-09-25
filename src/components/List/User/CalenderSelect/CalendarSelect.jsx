import { Avatar, Button, Dropdown, List } from 'antd';
// import useSelection from 'antd/lib/table/hooks/useSelection';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import React from 'react';
import { userRolesWithTranslation } from '../../../../constants/userRoles';
import { useTranslation } from 'react-i18next';
import './calendarSelect.css';

// import { getUserDetails } from '../../../../redux/reducer/userSlice';

const CalendarSelect = (props) => {
  const {
    bordered,
    itemWidth,
    onButtonClick,
    icon,
    name,
    calenderItem,
    selectedCalendars,
    setSelectedCalendars,
    isRoleOptionHidden,
  } = props;
  const { t } = useTranslation();

  const userTypeFilterChangeHandler = ({ selectedKeys }) => {
    const updatedSelectedData = selectedCalendars.map((item) => {
      if (item.id === calenderItem.id) {
        return { ...item, role: selectedKeys[0] };
      } else {
        return item;
      }
    });
    setSelectedCalendars([...updatedSelectedData]);
  };

  return (
    <div
      className="selection-item-wrapper calender-card-item"
      style={{ border: bordered && '1px solid#607EFC', width: itemWidth && itemWidth }}>
      <List.Item
        className="selection-item-list-wrapper"
        actions={[
          <div key={name} className="button-container">
            <Button type="text" key="list-loadmore-close" onClick={onButtonClick} style={{ padding: '0px' }}>
              {t('dashboard.settings.addUser.leave')}
            </Button>
          </div>,
        ]}>
        <List.Item.Meta
          style={{ alignItems: 'flex-start' }}
          avatar={
            <Avatar
              shape="square"
              size={'large'}
              icon={icon}
              style={{
                backgroundColor: '#E3E8FF',
                borderRadius: '4px',
              }}
            />
          }
          title={<span className="selection-item-title">{name}</span>}
        />
        {!isRoleOptionHidden && (
          <div>
            {calenderItem?.role ? (
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
                <Button
                  size="large"
                  className="filter-buttons role-added-button"
                  icon={
                    <DownOutlined
                      style={{ color: 'white', fontSize: '16px', display: 'grid', placeContent: 'center' }}
                    />
                  }>
                  {calenderItem.role}
                </Button>
              </Dropdown>
            ) : (
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
                <Button
                  size="large"
                  className="filter-buttons"
                  icon={
                    <PlusOutlined
                      style={{ color: '#0F0E98', fontSize: '21px', display: 'grid', placeContent: 'center' }}
                    />
                  }>
                  {t('dashboard.settings.addUser.role')}
                </Button>
              </Dropdown>
            )}
          </div>
        )}
      </List.Item>
    </div>
  );
};

export default CalendarSelect;
