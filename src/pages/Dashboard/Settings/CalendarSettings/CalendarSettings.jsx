import React, { useRef } from 'react';
import './calendarSettings.css';
import { Row, Col, Form, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { STATIC_FILTERS, calendarSettingsFormFields } from '../../../../constants/calendarSettingsForm';
import { useOutletContext, useParams } from 'react-router-dom';
import { entitiesClass } from '../../../../constants/entitiesClass';
import { useGetAllTaxonomyQuery } from '../../../../services/taxonomy';
import { taxonomyClass } from '../../../../constants/taxonomyClass';
import { contentLanguageBilingual } from '../../../../utils/bilingual';
import { getUserDetails } from '../../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';
import PrimaryButton from '../../../../components/Button/Primary';
import { useUpdateCalendarMutation } from '../../../../services/calendar';

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

  const [updateCalendar] = useUpdateCalendarMutation();

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

  const peopleFilters = filterOptions(allTaxonomyData?.data, entitiesClass.person);

  const placeFilters = filterOptions(allTaxonomyData?.data, entitiesClass.place);

  let initialSelectedFilters = [];
  if (currentCalendarData?.filterPersonalization?.fields?.length > 0)
    initialSelectedFilters = currentCalendarData?.filterPersonalization?.fields;
  if (currentCalendarData?.filterPersonalization?.customFields?.length > 0)
    initialSelectedFilters = initialSelectedFilters.concat(currentCalendarData?.filterPersonalization?.customFields);

  const handleInitialFilters = (data, selectedFilters) => {
    return data?.filter((filter) => selectedFilters?.includes(filter.value))?.map((filter) => filter.value) ?? [];
  };
  // initialSelectedFilters = ['63a0a47c1c6b6c005aad30da', '6467a0a5137a2200640d6abd'];

  initialSelectedFilters = [
    {
      name: entitiesClass.event,
      filters: handleInitialFilters(eventFilters, initialSelectedFilters),
    },
    {
      name: entitiesClass.organization,
      filters: handleInitialFilters(organizationFilters, initialSelectedFilters),
    },
    {
      name: entitiesClass.people,
      filters: handleInitialFilters(peopleFilters, initialSelectedFilters),
    },
    {
      name: entitiesClass.place,
      filters: handleInitialFilters(placeFilters, initialSelectedFilters),
    },
  ];

  const imageConfig =
    currentCalendarData?.imageConfig?.length > 0
      ? currentCalendarData?.imageConfig?.filter((config) => config?.entityName == entitiesClass.event)[0]
      : null;

  const initialValues = {
    calendarNameEn: currentCalendarData?.name?.en,
    calendarNameFr: currentCalendarData?.name?.fr,
    calendarContactEmail: currentCalendarData?.contact,
    calendarTimeZone: currentCalendarData?.timezone,
    calendarDateFormat: currentCalendarData?.dateFormatDisplay,
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

  const onSaveHandler = () => {
    let requiredFields =
      calendarSettingsFormFields?.GENERAL_SETTINGS?.filter((field) => field.required)?.map((field) => field.name) ?? [];
    requiredFields = requiredFields.concat(
      calendarSettingsFormFields?.WIDGET_SETTINGS?.filter((field) => field.required)?.map((field) => field.name) ?? [],
    );
    requiredFields = requiredFields
      .concat(calendarSettingsFormFields?.FILTER_PERSONALIZATION?.map((field) => field.name))
      ?.filter((field) => field);
    form
      .validateFields(requiredFields)
      .then(() => {
        let values = form.getFieldsValue(true);
        STATIC_FILTERS.EVENT.forEach((filter) => {
          values[entitiesClass.event] = values[entitiesClass.event]?.filter((item) => item !== filter.value);
        });
        STATIC_FILTERS.ORGANIZATION.forEach((filter) => {
          values[entitiesClass.organization] = values[entitiesClass.organization]?.filter(
            (item) => item !== filter.value,
          );
        });
        STATIC_FILTERS.PEOPLE.forEach((filter) => {
          values[entitiesClass.person] = values[entitiesClass.person]?.filter((item) => item !== filter.value);
        });
        STATIC_FILTERS.PLACE.forEach((filter) => {
          values[entitiesClass.place] = values[entitiesClass.place]?.filter((item) => item !== filter.value);
        });
        if (values)
          values = {
            name: {
              en: values.calendarNameEn,
              fr: values.calendarNameFr,
            },
            contentLanguage: values.calendarLanguage,
            timezone: values.calendarTimeZone,
            contact: values.calendarContactEmail,
            dateFormatDisplay: values.calendarDateFormat,
            // imageConfig: {
            //   entityName: currentCalendarData?.imageConfig?.entityName,
            //   large: {
            //     aspectRatio: values.imageAspectRatio.large,
            //     maxWidth: values.imageMaxWidth.large,
            //   },
            //   thumbnail: {
            //     aspectRatio: values.imageAspectRatio.thumbnail,
            //     maxWidth: values.imageMaxWidth.thumbnail,
            //   },
            // },
            widgetSettings: {
              listEventsUrlTemplate: values.searchResultTemplate,
              eventDetailsUrlTemplate: values.eventTemplate,
            },
            filterPersonalization: {
              fields: currentCalendarData?.filterPersonalization?.fields,
              customFields: values.People.concat(values.Organization).concat(values.Event).concat(values.Place),
            },
          };
        updateCalendar({ calendarId, data: values })
          .unwrap()
          .then(() => {
            console.log('Calendar updated successfully');
          })
          .catch((errorInfo) => {
            console.log(errorInfo);
          });
      })
      .catch((errorInfo) => {
        console.log(errorInfo);
      });
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
              onClick={onSaveHandler}
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
                      t,
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
                    {item.field({ form, isCrop: false, t })}
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
                    initialValue={
                      initialSelectedFilters?.length > 0
                        ? item.initialValue.concat(
                            initialSelectedFilters?.filter((filter) => filter.name === item.name)[0]?.filters,
                          )
                        : item.initialValue
                    }>
                    {item.field({
                      form,
                      isCrop: false,
                      eventFilters,
                      organizationFilters,
                      peopleFilters,
                      placeFilters,
                      t,
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
