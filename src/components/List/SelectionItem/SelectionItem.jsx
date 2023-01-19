import React from 'react';
import { Avatar, List } from 'antd';

function SelectionItem(props) {
  const { icon, name, description } = props;
  return (
    <List.Item style={{ width: '423px' }}>
      <List.Item.Meta avatar={<Avatar>{icon}</Avatar>} title={<span>{name}</span>} description={description} />
    </List.Item>
  );
}

export default SelectionItem;
