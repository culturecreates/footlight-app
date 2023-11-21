import { Button, Row, Col } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './createNew.css';
import { featureFlags } from '../../utils/featureFlags';
import FeatureFlag from '../FeatureFlag/FeatureFlag';
import { LeftOutlined } from '@ant-design/icons';

const NewEntityLayout = ({ children, heading, text, entityName }) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <Row className="create-new-entity-page" gutter={[0, 24]}>
        <Col span={24}>
          <div className="button-container">
            <Button type="link" onClick={() => navigate(-1)} data-cy="button-breadcrumb-back-to-previous-page">
              <LeftOutlined style={{ fontSize: '12px', paddingRight: '5px' }} />
              {t('dashboard.organization.createNew.search.breadcrumb')}
            </Button>
          </div>
          <h1 className="heading" data-cy="heading-entity">
            {heading}
          </h1>
        </Col>

        <Col span={16}>
          <div className="content">
            <Col span={15}>
              <h2 className="sub-heading" data-cy="heading-entity-subheading">
                {t('dashboard.organization.createNew.search.searchHeading')}
              </h2>
              <p className="text" data-cy="para-entity-text">
                {text}
              </p>
            </Col>
            <Col span={15} className="search">
              <p data-cy="para-entity-name">{entityName}</p>
              {children}
            </Col>
          </div>
        </Col>
      </Row>
    </FeatureFlag>
  );
};

export default NewEntityLayout;
