import React from 'react';
import './entityCard.css';
import ArtsDataLink from '../../Tags/ArtsDataLink/ArtsDataLink';
import { LinkOutlined } from '@ant-design/icons';
import Link from 'antd/lib/typography/Link';

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
          <ArtsDataLink data-cy="tag-entity-artsdata">
            <Link href={artsDataLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', gap: '7px' }}>
                <span style={{ textDecoration: 'underline', color: '#0f0e98' }} data-cy="span-artsdata-link">
                  {linkText}
                </span>
                <LinkOutlined style={{ display: 'grid', placeContent: 'center', color: '#0f0e98' }} />
              </div>
            </Link>
          </ArtsDataLink>
        )}
      </div>
    </div>
  );
};

export default EntityCard;
