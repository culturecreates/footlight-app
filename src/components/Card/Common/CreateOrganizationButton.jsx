import React from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function CreateOrganizationButton({ quickCreateKeyword, props }) {
  const { t } = useTranslation();

  return (
    <div className="quick-create" {...props}>
      <PlusCircleOutlined />
      &nbsp;{t('dashboard.events.addEditEvent.quickCreate.create')}&nbsp;&#34;
      {quickCreateKeyword}&#34;
    </div>
  );
}

export default CreateOrganizationButton;
