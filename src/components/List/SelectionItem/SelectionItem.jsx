import React from 'react';
import { Avatar, List } from 'antd';

function SelectionItem(props) {
  const { icon, name, description } = props;
  return (
    <List.Item style={{ width: '423px', alignItems: 'center' }}>
      <List.Item.Meta
        style={{ alignItems: 'center' }}
        avatar={
          <Avatar
            shape="square"
            icon={icon}
            style={{
              backgroundColor: '#E3E8FF',
              borderRadius: '4px',
            }}
          />
        }
        title={<span>{name}</span>}
        description={description}
      />
    </List.Item>
  );
}

export default SelectionItem;
