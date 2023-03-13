import React from 'react';
import './noContent.css';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function NoContent(props) {
  const { label } = props;
  const { t } = useTranslation();

  return (
    <div className="no-content-wrapper">
      <span className="no-content-icon">
        <ExclamationCircleOutlined style={{ fontSize: '14px', color: '#607EFC' }} />
      </span>
      <p className="no-content-text">{label ?? t('common.noneFound')}</p>
    </div>
  );
}

export default NoContent;
