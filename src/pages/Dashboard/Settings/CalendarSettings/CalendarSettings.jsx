import React from 'react';
import { Row, Col, Form, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { calendarSettingsFormFields } from '../../../../constants/calendarSettingsForm';
import { useOutletContext } from 'react-router-dom';
import { entitiesClass } from '../../../../constants/entitiesClass';

function CalendarSettings() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [currentCalendarData] = useOutletContext();

  const imageConfig =
    currentCalendarData?.imageConfig?.length > 0
      ? currentCalendarData?.imageConfig?.filter((config) => config?.entityName == entitiesClass.event)[0]
      : null;

  const initialValues = {
    calendarName: currentCalendarData?.name?.en ?? currentCalendarData?.name?.fr,
    calendarContactEmail: currentCalendarData?.contact,
    eventTemplate: currentCalendarData?.widgetSettings?.eventDetailsUrlTemplate,
    searchResultTemplate: currentCalendarData?.widgetSettings?.listEventsUrlTemplate,
    calendarLanguage: [currentCalendarData?.contentLanguage],
    imageAspectRatio: {
      large: imageConfig?.large?.aspectRatio,
      thumbnail: imageConfig?.thumbnail?.aspectRatio,
    },
    imageMaxWidth: {
      large: imageConfig?.large?.maxWidth,
      thumbnail: imageConfig?.thumbnail?.maxWidth,
    },
  };

  return (
    currentCalendarData && (
      <Row>
        <Col span={24}>
          <h5> {t('dashboard.settings.calendarSettings.generalSettings')}</h5>
          <p>{t('dashboard.settings.calendarSettings.setUpCalendarDescription')}</p>
        </Col>
        <Col flex={'448px'}>
          <Form form={form} layout="vertical" name="calendar-settings" initialValues={initialValues}>
            {calendarSettingsFormFields.GENERAL_SETTINGS.map((item, index) => {
              return (
                <Form.Item label={item.label} key={index} rules={item.rules} required={item.required} name={item.name}>
                  {item.field({
                    form,
                    isCrop: false,
                    largeAspectRatio: imageConfig?.large?.aspectRatio,
                    thumbnailAspectRatio: imageConfig?.thumbnail?.aspectRatio,
                    largeMaxWidth: imageConfig?.large?.maxWidth,
                    thumbnailMaxWidth: imageConfig?.thumbnail?.maxWidth,
                    logoUri: imageConfig?.image?.uri,
                  })}
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
    )
  );
}

export default CalendarSettings;
