import React from 'react';
import './listCard.css';
import { List, Typography } from 'antd';

const { Text, Paragraph } = Typography;

const ListCard = (props) => {
  const { title, description, Logo, onClick, ActionComponent } = props;

  return (
    <List.Item key={title} className="search-option-entity-card" onClick={onClick} actions={[ActionComponent]}>
      <List.Item.Meta
        avatar={Logo}
        title={<Text strong>{title}</Text>}
        description={<Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>}
      />
    </List.Item>
  );
};

export default ListCard;
