import React, { useRef } from 'react';
import './calendarSettings.css';
import { Row, Col, Form, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { calendarSettingsFormFields } from '../../../../constants/calendarSettingsForm';
import { useOutletContext, useParams } from 'react-router-dom';
import { entitiesClass } from '../../../../constants/entitiesClass';
import { useGetAllTaxonomyQuery } from '../../../../services/taxonomy';
import { taxonomyClass } from '../../../../constants/taxonomyClass';
import { contentLanguageBilingual } from '../../../../utils/bilingual';
import { getUserDetails } from '../../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';
import PrimaryButton from '../../../../components/Button/Primary';

function CalendarSettings() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [currentCalendarData] = useOutletContext();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);

  let query = new URLSearchParams();
  query.append('taxonomy-class', taxonomyClass.ORGANIZATION);
  query.append('taxonomy-class', taxonomyClass.EVENT);
  query.append('taxonomy-class', taxonomyClass.PERSON);
  query.append('taxonomy-class', taxonomyClass.PLACE);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(query.toString()),
    includeConcepts: false,
    addToFilter: true,
    sessionId: timestampRef,
  });

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const filterOptions = (data, taxonomyClass) => {
    return (
      data
        ?.filter((item) => item?.taxonomyClass === taxonomyClass)
        .map((taxonomy) => {
          return {
            label: contentLanguageBilingual({
              en: taxonomy?.name?.en,
              fr: taxonomy?.name?.fr,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            }),
            value: taxonomy.id,
          };
        }) ?? []
    );
  };
  const eventFilters = filterOptions(allTaxonomyData?.data, entitiesClass.event);

  const organizationFilters = filterOptions(allTaxonomyData?.data, entitiesClass.organization);

  const peopleFilters = filterOptions(allTaxonomyData?.data, entitiesClass.people);

  const placeFilters = filterOptions(allTaxonomyData?.data, entitiesClass.place);

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
    currentCalendarData &&
    !taxonomyLoading && (
      <div style={{ paddingTop: '24px' }}>
        <Row className="calendar-settings-wrapper" gutter={[0, 18]}>
          <Col span={22}>
            <h5 className="calendar-settings-heading" data-cy="heading5-calendar-settings">
              {t('dashboard.settings.calendarSettings.generalSettings')}
            </h5>
          </Col>
          <Col span={2}>
            <PrimaryButton
              label={t('dashboard.events.addEditEvent.saveOptions.save')}
              data-cy="button-save-calendar-settings"
              // onClick={onSaveHandler}
            />
          </Col>
          <Col span={24}>
            <p className="calendar-settings-description" data-cy="para-calendar-settings-description">
              {t('dashboard.settings.calendarSettings.setUpCalendarDescription')}
            </p>
          </Col>
          <Col flex={'448px'}>
            <Form form={form} layout="vertical" name="calendar-settings" initialValues={initialValues}>
              {calendarSettingsFormFields.GENERAL_SETTINGS.map((item, index) => {
                return (
                  <Form.Item
                    label={item.label}
                    key={index}
                    rules={item.rules}
                    required={item.required}
                    name={item.name}>
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
              <h5 className="calendar-settings-heading">
                {t('dashboard.settings.calendarSettings.calendarWidgetSetup')}
              </h5>
              <p className="calendar-settings-description">
                {t('dashboard.settings.calendarSettings.calendarWidgetDescription')}
              </p>
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
              <h5 className="calendar-settings-heading">
                {t('dashboard.settings.calendarSettings.filterPersonalization')}
              </h5>
              <p className="calendar-settings-description">
                {t('dashboard.settings.calendarSettings.filterDescription')}
              </p>
              {calendarSettingsFormFields.FILTER_PERSONALIZATION.map((item, index) => {
                return (
                  <Form.Item
                    label={item.label}
                    key={index}
                    rules={item.rules}
                    required={item.required}
                    name={item.name}
                    extra={item.extra}
                    initialValue={item.initialValue}>
                    {item.field({
                      form,
                      isCrop: false,
                      eventFilters,
                      organizationFilters,
                      peopleFilters,
                      placeFilters,
                    })}
                  </Form.Item>
                );
              })}
            </Form>
          </Col>
        </Row>
      </div>
    )
  );
}

export default CalendarSettings;
