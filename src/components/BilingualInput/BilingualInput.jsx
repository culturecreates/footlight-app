import React, { useState } from 'react';
import { Tabs } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import './bilingualInput.css';

function BilingualInput(props) {
  const { form } = props;
  const [labelEn, setLabelEn] = useState('English');
  const [labelFr, setLabelFr] = useState('French');

  let enContent = form.getFieldValue('english');
  let frContent = form.getFieldValue('french');

  const onChange = () => {
    if (!form.getFieldValue('french') || form.getFieldValue('french') === '')
      setLabelFr(
        <>
          French&nbsp;
          <WarningOutlined style={{ color: '#B59800' }} />
        </>,
      );
    else setLabelFr('French');

    if (!form.getFieldValue('english') || form.getFieldValue('english') === '')
      setLabelEn(
        <>
          English&nbsp;
          <WarningOutlined style={{ color: '#B59800' }} />
        </>,
      );
    else setLabelEn('English');
  };

  let defaultTab = 'fr';

  if (enContent && !frContent) {
    defaultTab = 'en';
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
      onChange={onChange}
      tabBarGutter="0"
      tabPosition="top"
      animated="false"
      tabBarStyle={{ margin: '0' }}
    />
  );
}

export default BilingualInput;
