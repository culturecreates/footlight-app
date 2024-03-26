// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import './bilingualInput.css';
import { useTranslation } from 'react-i18next';
import LiteralBadge from '../Badge/LiteralBadge';

function BilingualInput(props) {
  const { t } = useTranslation();
  let labelFr = t('common.tabFrench');
  let labelEn = t('common.tabEnglish');

  let defaultTab = props?.defaultTab ?? 'fr';

  // Adjust tabs unless brand new entity
  if (props?.fieldData) {
    let enContent = props?.fieldData.en;
    let frContent = props?.fieldData.fr;

    // Change default tab to 'en' if only english
    if (enContent && !frContent) {
      defaultTab = 'en';
    }

    // If field is empty add a warning
    if (!frContent || frContent === '') {
      labelFr = (
        <>
          {labelFr}&nbsp;
          <WarningOutlined style={{ color: '#B59800' }} />
        </>
      );
    }
    if (!enContent || enContent === '') {
      labelEn = (
        <>
          {labelEn}&nbsp;
          <WarningOutlined style={{ color: '#B59800' }} />
        </>
      );
    }
  }

  const items = [
    {
      label: labelFr,
      key: 'fr',
      forceRender: true,
      children: (
        <div className="bilingual-child-wrapper">
          {props.children[0]}
          {props?.fallbackStatus?.fr?.tagDisplayStatus && (
            <LiteralBadge tagTitle={props?.fallbackStatus?.fr?.fallbackLiteralKey} promptText="promptText" />
          )}
        </div>
      ),
    },
    {
      label: labelEn,
      key: 'en',
      forceRender: true,
      children: (
        <div className="bilingual-child-wrapper">
          {props.children[1]}
          {props?.fallbackStatus?.en?.tagDisplayStatus && (
            <LiteralBadge tagTitle={props?.fallbackStatus?.en?.fallbackLiteralKey} promptText="promptText" />
          )}
        </div>
      ),
    },
  ];

  return (
    <Tabs
      type="card"
      defaultActiveKey={defaultTab}
      items={items}
      size="small"
      tabBarGutter="0"
      tabPosition="top"
      animated="false"
      tabBarStyle={{ margin: '0' }}
      className="bilingual-input-tab"
      data-cy="bilingual-tabs"
    />
  );
}

export default BilingualInput;
