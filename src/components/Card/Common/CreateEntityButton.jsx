import React from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function CreateEntityButton(props) {
  const { t } = useTranslation();
  const { quickCreateKeyword, onClick } = props;
  return (
    <div className="quick-create" onClick={onClick}>
      <PlusCircleOutlined />
      &nbsp;{t('dashboard.events.addEditEvent.quickCreate.create')}&nbsp;&#34;
      {quickCreateKeyword}&#34;
    </div>
  );
}

export default CreateEntityButton;
