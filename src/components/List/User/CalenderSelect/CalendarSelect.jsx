import { Avatar, Button, List } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './calendarSelect.css';

const CalendarSelect = (props) => {
  const { bordered, itemWidth, onButtonClick, icon, name, calenderItem, currentUser } = props;
  const { t } = useTranslation();

  return (
    <div
      className="selection-item-wrapper-calendar selection-item-wrapper calender-card-item"
      style={{ border: bordered && '1px solid#607EFC', width: itemWidth && itemWidth }}>
      <List.Item
        className="selection-item-list-wrapper"
        actions={[
          <>
            {currentUser ? (
              <div key={name} className="button-container">
                <Button type="text" key="list-loadmore-close" onClick={onButtonClick} style={{ padding: '0px' }}>
                  {t('dashboard.settings.addUser.leave')}
                </Button>
              </div>
            ) : (
              <Button
                size="large"
                className="filter-buttons role-added-button"
                style={{ padding: '4px 8px', height: 'auto' }}>
                {calenderItem?.role}
              </Button>
            )}
          </>,
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

        {currentUser && (
          <Button
            size="large"
            className="filter-buttons role-added-button"
            style={{ padding: '4px 8px', height: 'auto' }}>
            {calenderItem?.role}
          </Button>
        )}
      </List.Item>
    </div>
  );
};

export default CalendarSelect;
