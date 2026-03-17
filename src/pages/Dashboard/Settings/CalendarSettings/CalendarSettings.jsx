import React, { useEffect, useRef, useState, useMemo } from 'react';
import './calendarSettings.css';
import { Row, Col, Form, Divider, notification, Button, message } from 'antd';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
import { useAddImageMutation } from '../../../../services/image';
import { calendarModes } from '../../../../constants/calendarModes';
import LoadingIndicator from '../../../../components/LoadingIndicator/LoadingIndicator';

function CalendarSettings({ setDirtyStatus, tabKey }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [currentCalendarData, , , , , , , , , isCurrentCalendarInfoLoading] = useOutletContext();
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

  const [updateCalendar, { isLoading: updateCalendarLoading }] = useUpdateCalendarMutation();
  const [addImage, { isLoading: addImageLoading }] = useAddImageMutation();
  const [debouncedLoading, setDebouncedLoading] = useState(true);

  const isAnyLoading = useMemo(
    () =>
      !currentCalendarData ||
      isCurrentCalendarInfoLoading ||
      taxonomyLoading ||
      addImageLoading ||
      updateCalendarLoading,
    [currentCalendarData, isCurrentCalendarInfoLoading, taxonomyLoading, addImageLoading, updateCalendarLoading],
  );

  useEffect(() => {
    if (isAnyLoading) {
      setDebouncedLoading(true);
    } else {
      const timer = setTimeout(() => {
        setDebouncedLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAnyLoading]);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const filterOptions = (data, taxonomyClass) => {
    return (
      data
        ?.filter((item) => item?.taxonomyClass === taxonomyClass)
        .map((taxonomy) => {
          return {
            label: contentLanguageBilingual({
              data: taxonomy?.name,
              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
              calendarContentLanguage: calendarContentLanguage,
            }),
            value: taxonomy.id,
          };
        }) ?? []
    );
  };
  const organizationFilters = filterOptions(allTaxonomyData?.data, entitiesClass.organization);

  const peopleFilters = filterOptions(allTaxonomyData?.data, entitiesClass.person);

  const placeFilters = filterOptions(allTaxonomyData?.data, entitiesClass.place);
  const eventTaxonomies = filterOptions(allTaxonomyData?.data, entitiesClass.event);
  const eventFilters = [...eventTaxonomies, ...placeFilters];

  const initialSelectedFilters = {
    [entitiesClass.event]: currentCalendarData?.filterPersonalization?.events ?? [],
    [entitiesClass.organization]: currentCalendarData?.filterPersonalization?.organization ?? [],
    [entitiesClass.person]: currentCalendarData?.filterPersonalization?.people ?? [],
    [entitiesClass.place]: currentCalendarData?.filterPersonalization?.places ?? [],
  };

  const imageConfig = currentCalendarData?.imageConfig?.length > 0 ? currentCalendarData?.imageConfig[0] : null;
  let aspectRatioSet = new Set([
    '1:1',
    '2:1',
    '4:3',
    '5:4',
    '16:9',
    imageConfig?.thumbnail?.aspectRatio,
    imageConfig?.large?.aspectRatio,
  ]);

  let aspectRatios = Array.from(aspectRatioSet)
    .map((ratio) => {
      return {
        label: ratio,
        value: ratio,
        title: ratio,
      };
    })
    ?.filter((ratio) => ratio.value);

  const [aspectRatioOptions, setAspectRatioOptions] = React.useState(aspectRatios);

  const initialValues = {
    calendarName: currentCalendarData?.name,
    calendarContactEmail: currentCalendarData?.contact,
    calendarSlug: currentCalendarData?.slug,
    calendarTimeZone: currentCalendarData?.timezone,
    calendarDateFormat: currentCalendarData?.dateFormatDisplay,
    eventTemplate: currentCalendarData?.widgetSettings?.eventDetailsUrlTemplate,
    searchResultTemplate: currentCalendarData?.widgetSettings?.listEventsUrlTemplate,
    calendarLanguage: currentCalendarData?.contentLanguage,
    imageAspectRatio: {
      large: imageConfig?.large?.aspectRatio,
      thumbnail: imageConfig?.thumbnail?.aspectRatio,
    },
    imageMaxWidth: {
      large: imageConfig?.large?.maxWidth,
      thumbnail: imageConfig?.thumbnail?.maxWidth,
    },
    calendarLogo: currentCalendarData?.logo?.original?.uri,
    readOnly: currentCalendarData?.mode === calendarModes.READ_ONLY ? true : false,
    enableGallery: imageConfig?.enableGallery,
  };

  const udpateCalendarHandler = (data) => {
    updateCalendar({ calendarId, data })
      .unwrap()
      .then(() => {
        setDirtyStatus(false);
        reloadWithCallback();
      })
      .catch((errorInfo) => {
        console.log(errorInfo);
      });
  };

  function reloadWithCallback() {
    sessionStorage.setItem('reloadCallback', 'true');
    window.location.reload();
  }

  const onSaveHandler = () => {
    let requiredFields =
      calendarSettingsFormFields?.GENERAL_SETTINGS?.filter((field) => field.required)?.map((field) => field.name) ?? [];
    requiredFields = [
      ...requiredFields,
      ['imageAspectRatio', 'thumbnail'],
      ['imageMaxWidth', 'thumbnail'],
      ['imageMaxWidth', 'large'],
      ['imageAspectRatio', 'large'],
    ];
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
        let calendarData = {};
        if (values)
          calendarData = {
            name: values?.calendarName,
            contentLanguage: values?.calendarLanguage,
            timezone: values.calendarTimeZone,
            contact: values.calendarContactEmail,
            dateFormatDisplay: values.calendarDateFormat,
            imageConfig: [
              {
                entityNames: Object.keys(entitiesClass)
                  .map((key) => {
                    if (entitiesClass[key] !== entitiesClass.people) return entitiesClass[key];
                  })
                  ?.filter((key) => key),
                large: {
                  aspectRatio: values.imageAspectRatio.large,
                  maxWidth: Number(values.imageMaxWidth.large),
                },
                thumbnail: {
                  aspectRatio: values.imageAspectRatio.thumbnail,
                  maxWidth: Number(values.imageMaxWidth.thumbnail),
                },
                enableGallery: values?.enableGallery ?? false,
              },
            ],
            mode: values.readOnly ? calendarModes.READ_ONLY : calendarModes.READ_WRITE,
            languageFallbacks: currentCalendarData?.languageFallbacks,
            forms: currentCalendarData?.forms,
            namespace: currentCalendarData?.namespace,
            widgetSettings: {
              listEventsUrlTemplate: values.searchResultTemplate,
              eventDetailsUrlTemplate: values.eventTemplate,
            },
            filterPersonalization: {
              events:
                values[entitiesClass.event]?.filter((item) => !STATIC_FILTERS.FILTER_LIST.EVENT.includes(item)) ?? [],
              organization:
                values[entitiesClass.organization]?.filter(
                  (item) => !STATIC_FILTERS.FILTER_LIST.ORGANIZATION.includes(item),
                ) ?? [],
              people:
                values[entitiesClass.person]?.filter((item) => !STATIC_FILTERS.FILTER_LIST.PEOPLE.includes(item)) ?? [],
              places:
                values[entitiesClass.place]?.filter((item) => !STATIC_FILTERS.FILTER_LIST.PLACE.includes(item)) ?? [],
            },
          };
        if (values?.dragger?.length > 0 && values?.dragger[0]?.originFileObj) {
          const formdata = new FormData();
          formdata.append('file', values?.dragger[0].originFileObj);
          formdata &&
            addImage({ data: formdata, calendarId })
              .unwrap()
              .then((response) => {
                calendarData['logo'] = {
                  original: {
                    entityId: response?.data?.original?.entityId,
                    height: response?.data?.height,
                    width: response?.data?.width,
                  },
                };
                udpateCalendarHandler(calendarData);
              })
              .catch((error) => {
                console.log(error);
                const element = document.getElementsByClassName('calendarLogo');
                element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
              });
        } else {
          if (values?.calendarLogo) {
            if (values?.dragger && values?.dragger?.length == 0) calendarData['logo'] = null;
            else {
              if (currentCalendarData?.logo?.type == 'ImageObject')
                calendarData['logo'] = {
                  original: {
                    entityId: currentCalendarData?.logo?.original?.entityId,
                    height: currentCalendarData?.logo?.original?.height,
                    width: currentCalendarData?.logo?.original?.width,
                  },
                };
              else
                calendarData = {
                  ...calendarData,
                  logo: {
                    url: {
                      uri: currentCalendarData?.logo?.original?.uri,
                    },
                  },
                };
            }
          }
          udpateCalendarHandler(calendarData);
        }
      })
      .catch((errorInfo) => {
        message.warning({
          duration: 10,
          maxCount: 1,
          key: 'calendar-save-as-warning',
          content: (
            <>
              {t('common.validations.informationRequired')} &nbsp;
              <Button
                data-cy="button-place-save-as-warning"
                type="text"
                icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                onClick={() => message.destroy('calendar-save-as-warning')}
              />
            </>
          ),
          icon: <ExclamationCircleOutlined />,
        });
        console.log(errorInfo);
      });
  };

  useEffect(() => {
    if (tabKey != '3') return;

    form.resetFields();
  }, [tabKey]);

  useEffect(() => {
    if (sessionStorage.getItem('reloadCallback') === 'true') {
      sessionStorage.removeItem('reloadCallback');

      notification.success({
        description: t('dashboard.settings.calendarSettings.notifications.update'),
        placement: 'top',
        closeIcon: <></>,
        maxCount: 1,
        duration: 3,
      });
    }
  }, []);

  return !debouncedLoading ? (
    <div style={{ paddingTop: '24px' }}>
      <Row className="calendar-settings-wrapper" gutter={[0, 18]}>
        <Col span={24}>
          <Row justify={'space-between'}>
            <Col>
              <h5 className="calendar-settings-heading" data-cy="heading5-calendar-settings">
                {t('dashboard.settings.calendarSettings.generalSettings')}
              </h5>
            </Col>
            <Col>
              <PrimaryButton
                label={t('dashboard.events.addEditEvent.saveOptions.save')}
                data-cy="button-save-calendar-settings"
                onClick={onSaveHandler}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <p className="calendar-settings-description" data-cy="para-calendar-settings-description">
            {t('dashboard.settings.calendarSettings.setUpCalendarDescription')}
          </p>
        </Col>
        <Col flex={'448px'}>
          <Form
            form={form}
            layout="vertical"
            name="calendar-settings"
            initialValues={initialValues}
            onFieldsChange={() => {
              setDirtyStatus(true);
            }}>
            {calendarSettingsFormFields.GENERAL_SETTINGS.map((item, index) => {
              return (
                <Form.Item
                  label={item.label}
                  key={index}
                  rules={item.rules}
                  className={item.className ?? ''}
                  required={item.required}
                  name={item.name}
                  hidden={item.hidden}>
                  {item.field({
                    form,
                    isCrop: false,
                    initialValues,
                    calendarContentLanguage,
                    largeAspectRatio: imageConfig?.large?.aspectRatio,
                    thumbnailAspectRatio: imageConfig?.thumbnail?.aspectRatio,
                    largeMaxWidth: imageConfig?.large?.maxWidth,
                    thumbnailMaxWidth: imageConfig?.thumbnail?.maxWidth,
                    logoUri: currentCalendarData?.logo?.original?.uri,
                    aspectRatios: aspectRatioOptions,
                    setAspectRatioOptions,
                    thumbnailImage: currentCalendarData?.logo?.thumbnail?.uri,
                    // customRatio,
                    // setCustomRatio,
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
                    initialSelectedFilters
                      ? item.initialValue.concat(initialSelectedFilters[item.name])
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
  ) : (
    <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingIndicator />
    </div>
  );
}

export default CalendarSettings;
