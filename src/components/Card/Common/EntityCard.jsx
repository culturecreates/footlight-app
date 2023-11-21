import React from 'react';
import './entityCard.css';
import ArtsDataLink from '../../Tags/ArtsDataLink/ArtsDataLink';
import { LinkOutlined } from '@ant-design/icons';

const EntityCard = (props) => {
  const { title, description, artsDataLink, Logo, linkText, onClick } = props;
  return (
    <div className="search-option-entity-card" onClick={onClick} data-cy="div-entity-option">
      <div className="image-container" data-cy="div-entit-logo">
        {Logo}
      </div>
      <div className="text-container">
        <div className="title" data-cy="div-entity-title">
          {title}
        </div>
        <div className="description" data-cy="div-entity-description">
          {description}
        </div>
      </div>
      <div className="link-container">
        {artsDataLink && (
          <ArtsDataLink
            onClick={(e) => {
              e.stopPropagation();
              window.open(`${artsDataLink}`, '_blank', 'noopener,noreferrer');
            }}
            data-cy="tag-entity-artsdata">
            <span style={{ textDecoration: 'underline' }} data-cy="span-artsdata-link">
              {linkText}
            </span>
            <LinkOutlined />
          </ArtsDataLink>
        )}
      </div>
    </div>
  );
};

export default EntityCard;
