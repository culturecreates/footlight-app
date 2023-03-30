import React from 'react';
import './publishState.css';
import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { eventPublishState } from '../../../constants/eventPublishState';
// import { useUpdateEventStateMutation } from '../../../services/events';
// import { useParams } from 'react-router-dom';
function PublishState({ children, reviewPublishHandler }) {
  // const { calendarId } = useParams();
  // const [updateEventState] = useUpdateEventStateMutation();
  const items = [
    {
      key: '0',
      label: eventPublishState.PUBLISHED,
    },
    {
      key: '1',
      label: eventPublishState.DRAFT,
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
