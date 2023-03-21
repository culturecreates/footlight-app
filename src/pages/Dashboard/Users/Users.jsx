import React from 'react';
import './users.css';
import { Form, Row, Col, Select } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import LoginInput from '../../../components/Input/Common';
import PasswordInput from '../../../components/Input/Password';
import PrimaryButton from '../../../components/Button/Primary';
import OutlinedButton from '../../../components/Button/Outlined';
import StyledInput from '../../../components/Input/Common';
import { eventStatusOptions } from '../../../constants/eventStatus';

function Users() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const location = useLocation();
  return (
    <div className="user-edit-wrapper">
      <Row>
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <div className="add-edit-event-heading">
                <h4>{t('dashboard.events.addEditEvent.heading.editEvent')}</h4>
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
          <Row>
            <Col>
              <div className="add-edit-event-heading">
                <h4>{t('dashboard.events.addEditEvent.heading.editEvent')}</h4>
              </div>
            </Col>
          </Row>
        </Col>
        <Col>
          <Form
            name="userEdit"
            className="user-edit-form"
            initialValues={{
              remember: true,
            }}
            layout="vertical"
            autoComplete="off"
            requiredMark={false}
            scrollToFirstError={true}
            validateTrigger={'onBlur'}
            form={form}>
            <Form.Item
              name="contactPhoneNumber"
              className="subheading-wrap"
              label={t('dashboard.events.addEditEvent.otherInformation.contact.phoneNumber')}>
              <StyledInput
                placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderPhoneNumber')}
              />
            </Form.Item>
            <Form.Item
              name="contactPhoneNumber"
              className="subheading-wrap"
              label={t('dashboard.events.addEditEvent.otherInformation.contact.phoneNumber')}>
              <StyledInput
                placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderPhoneNumber')}
              />
            </Form.Item>
            <Form.Item
              className="user-edit-form-item"
              name="email"
              label={t('resetPassword.email')}
              labelAlign="left"
              initialValue={location?.state?.email}
              rules={[
                {
                  type: 'email',
                  message: t('resetPassword.validations.invalidEmail'),
                },
                {
                  required: true,
                  message: t('resetPassword.validations.emptyEmail'),
                },
              ]}>
              <LoginInput
                placeholder={t('resetPassword.emailPlaceHolder')}
                disabled={location?.state?.email ? true : false}
              />
            </Form.Item>

            <Form.Item
              className="reset-password-form-item"
              name="newPassword"
              label={t('resetPassword.newPassword')}
              labelAlign="left"
              rules={[
                {
                  required: true,
                  message: t('resetPassword.validations.emptyPassword'),
                },
              ]}>
              <PasswordInput
                placeholder={t('resetPassword.passwordPlaceHolder')}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            <Form.Item
              className="reset-password-form-item"
              name="confirmNewPassword"
              label={t('resetPassword.confirmNewPassword')}
              labelAlign="left"
              rules={[
                {
                  required: true,
                  message: t('resetPassword.validations.emptyPassword'),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    } else return Promise.reject(new Error(t('resetPassword.validations.passwordMatch')));
                  },
                }),
              ]}>
              <PasswordInput
                placeholder={t('resetPassword.passwordPlaceHolder')}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            <Form.Item name="eventStatus" label={t('dashboard.events.addEditEvent.dates.status')}>
              <Select options={eventStatusOptions} />
            </Form.Item>
            <Form.Item name="button" label={t('dashboard.events.addEditEvent.dates.status')}>
              <OutlinedButton
                label={t('dashboard.events.addEditEvent.otherInformation.description.translate')}
                size="large"
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default Users;
