import React from 'react';
import './createNewOrganization.css';
import '../AddEvent/addEvent.css';
import { Form, Row, Col, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import PrimaryButton from '../../../components/Button/Primary';
import { featureFlags } from '../../../utils/featureFlags';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { entitiesClass } from '../../../constants/entitiesClass';
import Card from '../../../components/Card/Common/Event';
import { formFieldValue, renderFormFields } from '../../../constants/formFields';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { contentLanguageBilingual } from '../../../utils/bilingual';

function CreateNewOrganization() {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentCalendarData] = useOutletContext();
  const { user } = useSelector(getUserDetails);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.organization);
  formFields = formFields?.length > 0 && formFields[0];
  let category = formFields?.formFields?.map((field) => field?.category);
  let unique;
  let fields;
  if (category) unique = [...new Set(category)];
  if (unique)
    fields = formFields?.formFields
      ?.filter((field) => field.category === unique[0])
      ?.sort((a, b) => a?.order - b?.order);

  if (unique?.length > 0) {
    fields = unique?.map((category) => {
      return formFields?.formFields
        ?.filter((field) => field.category === category)
        ?.sort((a, b) => a?.order - b?.order);
    });
  }

  console.log(fields);
  return (
    fields && (
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
            {fields?.map((section, index) => {
              return (
                <Card title={section[0]?.category} key={index}>
                  <>
                    {section?.map((field) => {
                      return formFieldValue?.map((formField, index) => {
                        if (formField?.type === field.type) {
                          return renderFormFields({
                            type: field?.type,
                            dataType: field?.datatype,
                            element: formField?.element,
                            key: index,
                            label: contentLanguageBilingual({
                              en: field?.label?.en,
                              fr: field?.label?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            }),
                          });
                        }
                      });
                    })}
                  </>
                  <></>
                </Card>
              );
            })}
          </Form>
        </div>
      </FeatureFlag>
    )
  );
}

export default CreateNewOrganization;
