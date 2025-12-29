import React from 'react';
import './vocabularyCard.css';
import ArtsDataLink from '../../Tags/ArtsDataLink/ArtsDataLink';
import { LinkOutlined } from '@ant-design/icons';
import Link from 'antd/lib/typography/Link';

const VocabularyCard = (props) => {
  const { title, description, authorityLabel, artsDataLink, linkText, onClick } = props;
  return (
    <div className="vocabulary-card" onClick={onClick} data-cy="div-vocabulary-option">
      <div className="vocabulary-text-container">
        <div className="vocabulary-title" data-cy="div-vocabulary-title">
          {title}
        </div>
        <div className="vocabulary-description" data-cy="div-vocabulary-description">
          {description && <span>{description}</span>}
          {description && authorityLabel && <span> • </span>}
          {authorityLabel && <span>{authorityLabel}</span>}
        </div>
      </div>
      <div className="vocabulary-link-container">
        {artsDataLink && (
          <ArtsDataLink data-cy="tag-vocabulary-artsdata">
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

export default VocabularyCard;
