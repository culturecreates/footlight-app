import React from 'react';
import { Tabs } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import './bilingualInput.css';
import { useTranslation } from 'react-i18next';

function BilingualInput(props) {
  const { t } = useTranslation();
  let labelFr = t('common.tabFrench');
  let labelEn = t('common.tabEnglish');

  let defaultTab = 'fr';

  // Adjust tabs unless brand new entity
  if (props.fieldData) {
    let enContent = props.fieldData.en;
    let frContent = props.fieldData.fr;

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
      children: props.children[0],
    },
    {
      label: labelEn,
      key: 'en',
      forceRender: true,
      children: props.children[1],
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
    />
  );
}

export default BilingualInput;
