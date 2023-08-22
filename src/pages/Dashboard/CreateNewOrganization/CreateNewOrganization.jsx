import React from 'react';
import './createNewOrganization.css';
import { Form, Row, Col, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import PrimaryButton from '../../../components/Button/Primary';
import { featureFlags } from '../../../utils/featureFlags';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';

function CreateNewOrganization() {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <div>
        <Form form={form} layout="vertical" name="event">
          <Row gutter={[32, 2]} className="add-edit-wrapper add-organization-wrapper">
            <Col span={24}>
              <Row justify="space-between">
                <Col>
                  <div className="button-container">
                    <Button
                      type="link"
                      onClick={() => navigate(-1)}
                      icon={<LeftOutlined style={{ marginRight: '17px' }} />}>
                      {t('dashboard.organization.createNew.search.breadcrumb')}
                    </Button>
                  </div>
                </Col>
                <Col>
                  <div className="add-event-button-wrap">
                    <Form.Item>
                      <PrimaryButton label={t('dashboard.events.addEditEvent.saveOptions.save')} />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col>
              <div className="add-edit-event-heading">
                <h4>{t('dashboard.organization.createNew.addOrganization.newOrganization')}</h4>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </FeatureFlag>
  );
}

export default CreateNewOrganization;
