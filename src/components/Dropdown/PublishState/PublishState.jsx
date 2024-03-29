import React from 'react';
import './publishState.css';
import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Translation } from 'react-i18next';

function PublishState({ children, reviewPublishHandler }) {
  const items = [
    {
      key: '0',
      label: <Translation>{(t) => t('dashboard.events.publishState.published')}</Translation>,
    },
    {
      key: '1',
      label: <Translation>{(t) => t('dashboard.events.publishState.draft')}</Translation>,
    },
  ];

  const onClick = ({ key }) => {
    if (key === '1') reviewPublishHandler();
  };

  return (
    <Dropdown
      overlayClassName="publish-state-dropdown"
      menu={{
        items,
        onClick,
        selectable: true,
        defaultSelectedKeys: ['0'],
      }}
      getPopupContainer={(trigger) => trigger.parentNode}
      trigger={['click']}>
      <Button type="default" className="publish-state-dropdown-button">
        <Space>
          {children}
          <DownOutlined style={{ fontSize: '9px', color: '#646D7B' }} />
        </Space>
      </Button>
    </Dropdown>
  );
}

export default PublishState;
