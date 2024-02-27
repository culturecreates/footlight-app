import React from 'react';
import { Row, Col, Form, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { calendarSettingsFormFields } from '../../../../constants/calendarSettingsForm';

function CalendarSettings() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  return (
    <Row>
      <Col span={24}>
        <h5> {t('dashboard.settings.calendarSettings.generalSettings')}</h5>
        <p>{t('dashboard.settings.calendarSettings.setUpCalendarDescription')}</p>
      </Col>
      <Col flex={'448px'}>
        <Form form={form} layout="vertical" name="calendar-settings">
          {calendarSettingsFormFields.GENERAL_SETTINGS.map((item, index) => {
            return (
              <Form.Item label={item.label} key={index} rules={item.rules} required={item.required} name={item.name}>
                {item.field({ form, isCrop: false })}
              </Form.Item>
            );
          })}
          <Divider />
          <h5> {t('dashboard.settings.calendarSettings.calendarWidgetSetup')}</h5>
          <p>{t('dashboard.settings.calendarSettings.calendarWidgetDescription')}</p>
          {calendarSettingsFormFields.WIDGET_SETTINGS.map((item, index) => {
            return (
              <Form.Item
                label={item.label}
                key={index}
                rules={item.rules}
                required={item.required}
                name={item.name}
                extra={item.extra}>
                {item.field({ form, isCrop: false })}
              </Form.Item>
            );
          })}
          <Divider />
          <h5> {t('dashboard.settings.calendarSettings.filterPersonalization')}</h5>
          <p>{t('dashboard.settings.calendarSettings.filterDescription')}</p>
          {calendarSettingsFormFields.FILTER_PERSONALIZATION.map((item, index) => {
            return (
              <Form.Item
                label={item.label}
                key={index}
                rules={item.rules}
                required={item.required}
                name={item.name}
                extra={item.extra}>
                {item.field({ form, isCrop: false })}
              </Form.Item>
            );
          })}
        </Form>
      </Col>
    </Row>
  );
}

export default CalendarSettings;
