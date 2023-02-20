import React from 'react';
import './selectionItem.css';
import { Avatar, List, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

function SelectionItem(props) {
  const { icon, name, description, bordered, closable, onClose, itemWidth } = props;
  return (
    <List.Item
      className="selection-item-wrapper"
      style={{ border: bordered && '1px solid#607EFC', width: itemWidth && itemWidth }}
      actions={[
        closable && (
          <Button type="text" key="list-loadmore-close" onClick={onClose}>
            <CloseCircleOutlined style={{ color: '#1b3de6' }} />
          </Button>
        ),
      ]}>
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
