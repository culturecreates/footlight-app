import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import './breadCrumbButton.css';

const BreadCrumbButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="breadcrumb-btn-container">
      <Button type="link" onClick={() => navigate(-1)} icon={<LeftOutlined style={{ marginRight: '17px' }} />}>
        {t('dashboard.organization.createNew.search.breadcrumb')}
      </Button>
    </div>
  );
};

export default BreadCrumbButton;
