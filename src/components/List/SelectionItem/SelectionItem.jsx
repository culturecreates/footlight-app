import React from 'react';
import './selectionItem.css';
import { Avatar, List } from 'antd';

function SelectionItem(props) {
  const { icon, name, description } = props;
  return (
    <List.Item className="selection-item-wrapper">
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
        title={<span className="selection-item-title">{name}</span>}
        description={<span className="selection-item-subheading">{description}</span>}
      />
    </List.Item>
  );
}

export default SelectionItem;
