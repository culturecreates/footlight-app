import React from 'react';
import './entityCard.css';
import ArtsDataLink from '../../Tags/ArtsDataLink/ArtsDataLink';
import { LinkOutlined } from '@ant-design/icons';

const EntityCard = (props) => {
  const { title, description, artsDataLink, Logo, linkText } = props;
  return (
    <div className="search-option-entity-card">
      <div className="image-container">
        <Logo />
      </div>
      <div className="text-container">
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </div>
      <div className="link-container">
        <ArtsDataLink onClick={() => window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer')}>
          <span style={{ textDecoration: 'underline' }}>{linkText}</span>
          <LinkOutlined />
        </ArtsDataLink>
      </div>
    </div>
  );
};

export default EntityCard;
