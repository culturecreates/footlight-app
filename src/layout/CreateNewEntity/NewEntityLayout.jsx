import { Button, Row, Col } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './createNew.css';
import { featureFlags } from '../../utils/featureFlags';
import FeatureFlag from '../FeatureFlag/FeatureFlag';
import { LeftOutlined } from '@ant-design/icons';

const NewEntityLayout = ({ children, heading, text, entityName, searchHeading }) => {
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

        <Col flex="780px">
          <Row className="content">
            <Col flex="423px">
              <h2 className="sub-heading" data-cy="heading-entity-subheading">
                {searchHeading}
              </h2>
              <p className="text" data-cy="para-entity-text">
                {text}
              </p>
            </Col>
            <Col flex="423px" className="search">
              <p data-cy="para-entity-name">{entityName}</p>
              {children}
            </Col>
          </Row>
        </Col>
      </Row>
    </FeatureFlag>
  );
};

export default NewEntityLayout;
