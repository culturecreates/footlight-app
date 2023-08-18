import { Button, Row, Col } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './createNew.css';

const NewEntityLayout = ({ children, heading, text, entityName }) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  return (
    <Row className="create-new-entity-page" gutter={[0, 24]}>
      <Col span={24}>
        <div className="button-container">
          <Button type="link" onClick={() => navigate(-1)}>
            {t('dashboard.organization.createNew.search.breadcrumb')}
          </Button>
        </div>
        <h1 className="heading"> {heading}</h1>
      </Col>

      <Col span={16}>
        <div className="content">
          <Col span={24}>
            <h2 className="sub-heading">{t('dashboard.organization.createNew.search.searchHeading')}</h2>
            <p className="text">{text}</p>
          </Col>
          <Col span={24} className="search">
            <p>{entityName}</p>
            {children}
          </Col>
        </div>
      </Col>
    </Row>
  );
};

export default NewEntityLayout;
