import { Button, Col, Divider, Form, Grid, Row, Spin, message, notification } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './css/widgetSettings.css';
import Outlined from '../../../../components/Button/Outlined';
import StyledInput from '../../../../components/Input/Common';
import ColorPicker from '../../../../components/ColorPicker/ColorPicker';
import TreeSelectOption from '../../../../components/TreeSelectOption';
import { CloseCircleOutlined, CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import NoContent from '../../../../components/NoContent/NoContent';
import { useGetAllTaxonomyQuery } from '../../../../services/taxonomy';
import { taxonomyClass } from '../../../../constants/taxonomyClass';
import { contentLanguageKeyMap } from '../../../../constants/contentLanguage';
import { useOutletContext, useParams } from 'react-router-dom';
import { getUserDetails } from '../../../../redux/reducer/userSlice';
import { useSelector } from 'react-redux';
import Tags from '../../../../components/Tags/Common/Tags';
import { treeTaxonomyOptions } from '../../../../components/TreeSelectOption/treeSelectOption.settings';
import { userLanguages } from '../../../../constants/userLanguages';
import SelectOption from '../../../../components/Select/SelectOption';
import { placeTaxonomyMappedFieldTypes } from '../../../../constants/placeMappedFieldTypes';
import { useGetEntitiesQuery, useLazyGetEntitiesQuery } from '../../../../services/entities';
import { entitiesClass } from '../../../../constants/entitiesClass';
import { bilingual } from '../../../../utils/bilingual';
import { useDebounce } from '../../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../../constants/search';
import { externalSourceOptions } from '../../../../constants/sourceOptions';
import { copyText } from '../../../../utils/copyText';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { filterOptions, redirectionModes, widgetFontCollection } from '../../../../constants/widgetConstants';
import StyledSwitch from '../../../../components/Switch';
import { eventTaxonomyMappedField } from '../../../../constants/eventTaxonomyMappedField';
import { EVENT } from '../../../../constants/standardFieldsTranslations';
import WidgetPreview from './WidgetPreview';

const { useBreakpoint } = Grid;
const widgetUrl = process.env.REACT_APP_CALENDAR_WIDGET_BASE_URL;
const fieldName = {
  organizer: 'organizer',
  performer: 'performer',
  performerOrganization: 'performerOrganization',
};

const WidgetSettings = ({ tabKey }) => {
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const { user } = useSelector(getUserDetails);
  const [currentCalendarData] = useOutletContext();
  const screens = useBreakpoint();
  const [form] = Form.useForm();

  const localePath = 'dashboard.settings.widgetSettings';
  const regexForHexCode = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const calendarSlug = currentCalendarData?.slug;
  const calendarName = currentCalendarData?.name[user?.interfaceLanguage?.toLowerCase()];
  const calendarLogoUri = currentCalendarData?.logo?.original?.uri || '';
  const isWidgetUrlAvailable = !!(
    currentCalendarData?.widgetSettings?.eventDetailsUrlTemplate &&
    currentCalendarData?.widgetSettings?.listEventsUrlTemplate
  );
  const redirectionModesModified = redirectionModes.map((mode) =>
    isWidgetUrlAvailable ? { ...mode, disabled: false } : mode,
  );

  const [color, setColor] = useState('#607EFC');
  const [locationOptions, setLocationOptions] = useState([]);
  const [organizerOptions, setOrganizerOptions] = useState([]);
  const [performerOptions, setPerformerOptions] = useState([]);
  const [performerOrganizerOptions, setPerformerOrganizerOptions] = useState([]);
  const [searchKey, setSearchKey] = useState([]);
  const [iframeCode, setIframeCode] = useState('');
  const [previewModal, setPreviewModal] = useState(false);
  const [url, setUrl] = useState(new URL(widgetUrl));
  const [urlMobile, setUrlMObile] = useState(new URL(widgetUrl));
  const [filterOptionsList, setFilterOptionsList] = useState([]);
  const [showMobileIframe, setShowMobileIframe] = useState(true);
  const [isMaskVisible, setIsMaskVisible] = useState(false);
  const [hasFormChangedSinceLastUpdate, setHasFormChangedSinceLastUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery({ sessionId: timestampRef });

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.EVENT);
  const { currentData: taxonomyDataEventType, isFetching: isEventTaxonomyFetching } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    filters: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });
  taxonomyClassQuery.delete('taxonomy-class');
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PLACE);
  const { currentData: taxonomyDataRegion } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });

  let queryLocation = new URLSearchParams();
  let queryPersonOrganization = new URLSearchParams();

  queryPersonOrganization.append('classes', entitiesClass.person);
  queryPersonOrganization.append('classes', entitiesClass.organization);
  queryLocation.append('classes', entitiesClass.place);

  const { currentData: initialEntitiesPersonOrganization } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(queryPersonOrganization.toString()),
    sessionId: timestampRef,
  });
  const { currentData: initialEntitiesLocations } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(queryLocation.toString()),
    sessionId: timestampRef,
  });

  const lanFormat = () => {
    let requiredLanguages = [];
    calendarContentLanguage.forEach((language) => {
      const languageItem = userLanguages.find((item) => {
        return item.key.toLowerCase() === contentLanguageKeyMap[language];
      });
      if (languageItem) requiredLanguages.push(languageItem);
    });

    return requiredLanguages.length === 0 ? userLanguages : requiredLanguages;
  };

  const languageOptions = lanFormat().map((item) => {
    return { label: item.label, value: item.key };
  });

  const notify = ({ index, messageText }) => {
    notification.warning({
      duration: 2,
      className: 'widget-notification',
      key: `view-notification-warning-${index}`,
      description: messageText,
      placement: 'top',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      closeIcon: (
        <Button
          type="text"
          icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
          onClick={() => message.destroy(`view-notification-warning-${index}`)}
        />
      ),
    });
  };

  const generateUrlWithParams = (baseURL, params, extraParams = {}) => {
    const url = new URL(baseURL);

    Object.entries({ ...params, ...extraParams }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    return url;
  };

  const onUpdate = () => {
    const allValues = form.getFieldsValue(true);
    if (regexForHexCode.test(color) && hasFormChangedSinceLastUpdate) {
      setIsLoading(true);

      const formValues = {
        width: form.getFieldValue('width') ?? 0,
        height: form.getFieldValue('height') ?? 1000,
        limit: form.getFieldValue('limit') ?? 9,
        font: form.getFieldValue('font') ?? 'Roboto',
        redirectionMode: form.getFieldValue('redirectionMode') ?? redirectionModesModified[0].value,
        showFooter: form.getFieldValue('footer-control') ?? false,
        headerText: form.getFieldValue('header-text'),
        disableGroups: form.getFieldValue('disableGroups') ?? false,
        filterOptions: form.getFieldValue('filterOptions')?.join('|'),
        searchEventsFilters:
          arrayToQueryParam(allValues?.eventType ?? [], 'type') +
          arrayToQueryParam(allValues?.location ?? [], 'place') +
          arrayToQueryParam(allValues?.region ?? [], 'region') +
          arrayToQueryParam([...(allValues?.organizer ?? [])], 'organizer') +
          arrayToQueryParam([...(allValues?.person ?? [])], 'performer') +
          arrayToQueryParam([...(allValues?.personOrganization ?? [])], 'person-organization'),
        locale: onLanguageSelect(allValues?.language)?.key.toLowerCase(),
        color: allValues.color || color,
      };

      const params = {
        width: formValues.width,
        font: formValues.font,
        redirectionMode: formValues.redirectionMode,
        limit: formValues.limit,
        calendar: calendarSlug,
        calendarName,
        logo: calendarLogoUri,
        searchEventsFilters: formValues.searchEventsFilters,
        locale: formValues.locale,
        height: formValues.height,
      };
      params.showFooter = formValues.showFooter;
      params.disableGrouping = formValues.disableGroups;
      if (formValues.headerText) params.headerTitle = formValues.headerText;
      params.filterOptions = formValues.filterOptions;

      const urlCopy = generateUrlWithParams(widgetUrl, params, { color: formValues.color });
      const urlCopyMobile = generateUrlWithParams(widgetUrl, params, { color: formValues.color, height: '600' });

      setUrl(urlCopy);
      setUrlMObile(urlCopyMobile);
      setIframeCode(
        `<iframe src="${urlCopy.href}" width="100%" style="max-width:${formValues.width}px; border:none" height="${formValues.height}px"></iframe>`,
      );
      setHasFormChangedSinceLastUpdate(false);
      setTimeout(() => {
        setIsMaskVisible(false);
        setShowMobileIframe(true);
        setIsLoading(false);
      }, 300);
    }
  };

  const handleFormValuesChange = () => {
    setHasFormChangedSinceLastUpdate(true);
    setIsMaskVisible(true);
    setShowMobileIframe(false);
  };

  const onLanguageSelect = (value) => {
    const selectedLanguage = userLanguages.find((item) => item.key === value);
    return selectedLanguage;
  };

  const placesSearch = (inputValue) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    setLocationOptions([]);

    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities({
      searchKey: inputValue,
      classes: decodeURIComponent(query.toString()),
      calendarId,
    })
      .unwrap()
      .then((response) => {
        setLocationOptions(
          response.map((item) => {
            return {
              value: item?.id,
              label: bilingual({ data: item?.name, interfaceLanguage: user?.interfaceLanguage }),
            };
          }),
        );
      })
      .catch((error) => console.log(error));
  };

  const setValueAccoringToType = (value, type) => {
    if (type === fieldName.organizer) {
      setOrganizerOptions(value);
    } else if (type === fieldName.performer) {
      setPerformerOptions(value);
    } else if (type === fieldName.performerOrganization) {
      setPerformerOrganizerOptions(value);
    }
  };

  const performerOrganizerSearch = (inputValue, field) => {
    setValueAccoringToType([], field);

    getEntities({
      searchKey: inputValue,
      classes: decodeURIComponent(queryPersonOrganization.toString()),
      calendarId,
    })
      .unwrap()
      .then((response) => {
        if (
          field === fieldName.organizer ||
          field === fieldName.performer ||
          field === fieldName.performerOrganization
        ) {
          const options = response.map((item) => ({
            value: item?.id,
            label: bilingual({ data: item?.name, interfaceLanguage: user?.interfaceLanguage }),
          }));

          setValueAccoringToType(options, field);
        }
      })
      .catch((error) => console.log(error));
  };

  const debounceSearchPlace = useCallback(useDebounce(placesSearch, SEARCH_DELAY), []);
  const debounceSearchPerformerOrganizer = useCallback(useDebounce(performerOrganizerSearch, SEARCH_DELAY), []);

  useEffect(() => {
    if (initialEntitiesLocations) {
      setLocationOptions(
        initialEntitiesLocations.map((item) => {
          return {
            value: item?.id,
            label: bilingual({ data: item?.name, interfaceLanguage: user?.interfaceLanguage }),
          };
        }),
      );
    }
  }, [initialEntitiesLocations]);

  useEffect(() => {
    if (initialEntitiesPersonOrganization) {
      const options = initialEntitiesPersonOrganization.map((item) => ({
        value: item?.id,
        label: bilingual({ data: item?.name, interfaceLanguage: user?.interfaceLanguage }),
      }));

      setOrganizerOptions(options);
      setPerformerOptions(options);
      setPerformerOrganizerOptions(options);
    }
  }, [initialEntitiesPersonOrganization]);

  useEffect(() => {
    if (tabKey !== '2') return;

    form.resetFields();
    setColor('#607EFC');
    form.setFieldValue('color', color);

    const formValues = {
      height: form.getFieldValue('height') ?? 1000,
      limit: form.getFieldValue('limit') ?? 9,
      font: form.getFieldValue('font') ?? 'Roboto',
      redirectionMode: form.getFieldValue('redirectionMode') ?? redirectionModesModified[0].value,
      locale: onLanguageSelect(form.getFieldValue('locale') ?? languageOptions[0]?.value)?.key.toLowerCase(),
      showFooter: form.getFieldValue('footer-control') ?? false,
      headerText: form.getFieldValue('header-text'),
      disableGroups: form.getFieldValue('disableGroups') ?? false,
      filterOptions: form.getFieldValue('filterOptions')?.join('|'),
      color,
    };

    const params = {
      logo: calendarLogoUri,
      locale: formValues.locale,
      limit: formValues.limit,
      color: formValues.color,
      font: formValues.font,
      redirectionMode: formValues.redirectionMode,
      calendar: calendarSlug,
      calendarName,
      height: formValues.height,
    };

    params.showFooter = formValues.showFooter;
    params.disableGrouping = formValues.disableGroups;
    if (formValues.headerText) params.headerTitle = formValues.headerText;
    params.filterOptions = formValues.filterOptions;

    const urlCopy = generateUrlWithParams(widgetUrl, params);
    const urlCopyMobile = generateUrlWithParams(widgetUrl, params, { height: '600' });

    setUrl(urlCopy);
    setUrlMObile(urlCopyMobile);

    setIframeCode(
      `<iframe src="${urlCopy.href}" width="100%" style="max-width:1000px; border:none" height="${formValues.height}px"></iframe>`,
    );
  }, [calendarContentLanguage, tabKey]);

  useEffect(() => {
    if (!taxonomyDataEventType || isEventTaxonomyFetching) return;

    const allowedFields = [eventTaxonomyMappedField.EVENT_TYPE, eventTaxonomyMappedField.AUDIENCE];
    const selectedStaticFilters = ['DATES', 'PLACE'];

    const selectedFilters = filterOptions.filter((option) => selectedStaticFilters.includes(option.value));

    const dynamicFilters = taxonomyDataEventType.data
      ?.filter((item) => allowedFields.includes(item.mappedToField))
      .map((item) => ({
        label: EVENT.find((translation) => translation.key === item.mappedToField)?.label || '',
        value: item.id,
      }))
      .filter(Boolean);

    setFilterOptionsList([...selectedFilters, ...dynamicFilters]);
  }, [taxonomyDataEventType, isEventTaxonomyFetching]);

  function arrayToQueryParam(arr, paramName) {
    if (!arr || arr.length === 0) {
      return '';
    }

    const queryParam = arr.map((value) => `${paramName}=${value}`).join('&');
    return `&${queryParam}`;
  }

  return (
    <>
      {currentCalendarData ? (
        <Row className="widget-settings" justify="space-between">
          <Col className="widget-settings-wrapper" style={{ margin: 0 }}>
            <Row className="widget-settings-heading-wrapper">
              <h4 className="heading" data-cy="widget-settings-title">
                {t(`${localePath}.title`)}
              </h4>
              <Outlined
                size="large"
                label={!screens.lg ? t(`${localePath}.previewMobileBtn`) : t(`${localePath}.previewDesktop`)}
                style={{ display: `${screens.xl ? 'none' : 'flex'}` }}
                data-cy="button-preview"
                onClick={() => {
                  form
                    .validateFields(['width', 'height', 'limit', 'color'])
                    .then(() => {
                      onUpdate();
                      setPreviewModal(true);
                    })
                    .catch((error) => {
                      error?.errorFields?.map((e, index) => {
                        notify({
                          index,
                          messageText: e.errors[0] != ' ' ? e.errors[0] : t(`${localePath}.validation.color`),
                        });
                      });
                    });
                }}
              />
            </Row>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} justify="space-between" wrap={false}>
              <Col flex={'448px'} style={{ paddingLeft: '0px' }}>
                <div className="configure-section-wrapper">
                  <p className="page-description" data-cy="widget-settings-page-description">
                    {t(`${localePath}.pageDescription`)}
                  </p>
                  <Form
                    layout="vertical"
                    className="widget-settings-form"
                    data-cy="widget-settings-form"
                    form={form}
                    onValuesChange={handleFormValuesChange}>
                    <Row gutter={[32, 4]} className="form-item-container">
                      <Col flex="448px" className="header-text-wrapper">
                        <Form.Item
                          name="header-text"
                          label={t(`${localePath}.headerText`)}
                          data-cy="widget-settings-headerText">
                          <StyledInput />
                        </Form.Item>
                        <p className="header-text-description" data-cy="widget-settings-header-text-description">
                          {t(`${localePath}.headerTextDescription`)}
                        </p>
                      </Col>
                      <Col flex="448px" className="footer-control-wrapper">
                        <Form.Item name="footer-control" initialValue={false} data-cy="widget-settings-headerText">
                          <StyledSwitch defaultChecked={false} />
                        </Form.Item>
                        <p className="footer-control" data-cy="widget-settings-footer-control-label">
                          {t(`${localePath}.showFooter`)}
                        </p>
                      </Col>
                      <Col flex="448px" className="color-select-wrapper">
                        <Form.Item
                          name="color"
                          required
                          label={t(`${localePath}.color`)}
                          {...(!regexForHexCode.test(form.getFieldValue('color')) && {
                            help: t(`${localePath}.validation.color`),
                            validateStatus: 'error',
                          })}
                          initialValue={color}
                          rules={[
                            {
                              validator: (_, value) => {
                                if (!regexForHexCode.test(value)) {
                                  return Promise.reject();
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                          data-cy="widget-settings-color">
                          <StyledInput
                            addonBefore={
                              <ColorPicker
                                color={color}
                                setColor={(color) => {
                                  setColor(color);
                                  form.setFieldValue('color', color);
                                  handleFormValuesChange({ color }, form.getFieldsValue(true));
                                }}
                              />
                            }
                            onChange={(color) => {
                              const value = color?.target?.value;
                              if (regexForHexCode.test(value)) {
                                setColor(color?.target?.value);
                                form.setFieldValue('color', color?.target?.value);
                              }
                            }}
                            placeholder={t(`${localePath}.colorPlaceHolder`)}
                            value={color}
                          />
                        </Form.Item>
                        <p className="page-description" data-cy="widget-settings-page-description">
                          {t(`${localePath}.colorDescreption`)}
                        </p>
                      </Col>
                      <Col flex="448px">
                        <Row gutter={[8, 8]}>
                          <Col flex="209px">
                            <Form.Item
                              name="height"
                              label={t(`${localePath}.height`)}
                              required
                              initialValue={1000}
                              rules={[
                                {
                                  validator: (_, value) => {
                                    if (!value || !/^[1-9][0-9]*$/.test(value)) {
                                      return Promise.reject(t(`${localePath}.validation.height`));
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              validateTrigger={['onChange', 'onBlur']}
                              data-cy="widget-settings-height">
                              <StyledInput />
                            </Form.Item>
                          </Col>

                          <Col flex="209px">
                            <Form.Item
                              name="width"
                              label={t(`${localePath}.width`)}
                              initialValue="1000"
                              rules={[
                                {
                                  validator: (_, value) => {
                                    if (value?.trim() === '') return Promise.resolve();
                                    if (!value || !/^[1-9][0-9]*$/.test(value)) {
                                      return Promise.reject(t(`${localePath}.validation.width`));
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              data-cy="widget-settings-width">
                              <StyledInput />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                      <Col flex="448px">
                        <Form.Item
                          name="font"
                          required
                          label={t(`${localePath}.font`)}
                          initialValue={widgetFontCollection[0]?.value ?? 'Roboto'}
                          data-cy="widget-settings-font">
                          <SelectOption
                            data-cy="widget-settings-font-dropdown"
                            styles={{
                              minWidth: '100%',
                              padding: '8px 0px',
                            }}
                            options={widgetFontCollection}
                          />
                        </Form.Item>
                      </Col>

                      <Col flex="448px">
                        <Form.Item
                          name="filterOptions"
                          label={t(`${localePath}.filterOptions`)}
                          initialValue={[filterOptions[0]?.value]}
                          className="widget-settings-filter-options"
                          data-cy="widget-settings-filter-options">
                          <TreeSelectOption
                            treeDefaultExpandAll
                            notFoundContent={<NoContent />}
                            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                            treeData={filterOptionsList}
                            tagRender={(props) => {
                              const { label, closable, onClose } = props;
                              return (
                                <Tags
                                  closable={closable}
                                  onClose={onClose}
                                  closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                                  data-cy={`tag-event-type-${label}`}>
                                  {label}
                                </Tags>
                              );
                            }}
                            data-cy="widget-settings-treeselect-filter-options"
                          />
                        </Form.Item>
                      </Col>

                      <Col
                        flex="448px"
                        className="datepicker-control-wrapper"
                        style={{
                          display: 'none',
                        }}>
                        <Form.Item
                          name="alwaysOnDatePicker"
                          initialValue={false}
                          data-cy="widget-settings-datepicker-toggle"
                          hidden={true}>
                          <StyledSwitch defaultChecked={false} />
                        </Form.Item>
                        <p className="datepicker-control" data-cy="widget-settings-datepicker-control-label">
                          {t(`${localePath}.datepickerToggle`)}
                        </p>
                      </Col>

                      <Col flex="448px">
                        <Form.Item
                          name="limit"
                          required
                          label={t(`${localePath}.limit`)}
                          initialValue={9}
                          rules={[
                            {
                              validator: (_, value) => {
                                if (!value || !/^[1-9][0-9]*$/.test(value)) {
                                  return Promise.reject(t(`${localePath}.validation.limit`));
                                }
                                if (value > 100) {
                                  return Promise.reject(t(`${localePath}.validation.limitMax`));
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                          data-cy="widget-settings-limit">
                          <StyledInput />
                        </Form.Item>
                      </Col>

                      <Col flex="448px" className="disable-grouping-flag-wrapper">
                        <Form.Item
                          name="disableGroups"
                          required
                          initialValue={false}
                          data-cy="widget-settings-disable-groups">
                          <StyledSwitch defaultChecked={false} />
                        </Form.Item>
                        <p className="disable-groups-description" data-cy="disable-groups-description">
                          {t(`${localePath}.disableGroups`)}
                        </p>
                      </Col>

                      <Col flex="448px" className="redirection-mode-wrapper">
                        <Form.Item
                          name="redirectionMode"
                          required
                          label={t(`${localePath}.redirectionMode`)}
                          initialValue={redirectionModesModified[0].value}
                          data-cy="widget-settings-redirection-mode">
                          <SelectOption
                            data-cy="widget-settings-redirectionMode-dropdown"
                            styles={{
                              minWidth: '100%',
                              padding: '8px 0px',
                            }}
                            options={redirectionModesModified}
                          />
                        </Form.Item>
                        <p className="redirection-mode-description" data-cy="redirection-mode-description">
                          {t(`${localePath}.redirectionModeDescription`)}
                        </p>
                      </Col>

                      <Divider />

                      <Col>
                        <h4 className="heading" data-cy="widget-settings-title">
                          {t(`${localePath}.filterHeading`)}
                        </h4>
                        <p className="page-description" data-cy="widget-settings-page-description">
                          {t(`${localePath}.filterSectionDescription`)}
                        </p>
                      </Col>

                      <Col flex="448px">
                        <Form.Item
                          name="eventType"
                          label={t(`${localePath}.eventType`)}
                          className="widget-settings-event-type"
                          data-cy="widget-settings-event-type">
                          <TreeSelectOption
                            placeholder={<span>{t(`${localePath}.placeholder.eventType`)}</span>}
                            allowClear
                            treeDefaultExpandAll
                            notFoundContent={<NoContent />}
                            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                            treeData={treeTaxonomyOptions(
                              taxonomyDataEventType,
                              user,
                              'EventType',
                              false,
                              calendarContentLanguage,
                            )}
                            tagRender={(props) => {
                              const { label, closable, onClose } = props;
                              return (
                                <Tags
                                  closable={closable}
                                  onClose={onClose}
                                  closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                                  data-cy={`tag-event-type-${label}`}>
                                  {label}
                                </Tags>
                              );
                            }}
                            data-cy="widget-settings-treeselect-event-type"
                          />
                        </Form.Item>
                      </Col>

                      <Col flex="448px" className="widget-settings-language">
                        <Form.Item
                          name="language"
                          label={t(`${localePath}.language`)}
                          required
                          initialValue={languageOptions[0]?.value ?? []}
                          data-cy="widget-settings-language-label">
                          <SelectOption
                            data-cy="widget-settings-language"
                            styles={{
                              minWidth: '100%',
                              padding: '8px 0px',
                            }}
                            options={languageOptions}
                          />
                        </Form.Item>
                      </Col>

                      <Col flex="448px" className="widget-settings-region">
                        <Form.Item
                          name="region"
                          label={t(`${localePath}.region`)}
                          data-cy="widget-settings-region-label">
                          <TreeSelectOption
                            data-cy="treeselect-place-region"
                            allowClear
                            treeDefaultExpandAll
                            notFoundContent={<NoContent />}
                            placeholder={<span>{t(`${localePath}.placeholder.region`)}</span>}
                            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                            treeData={treeTaxonomyOptions(
                              taxonomyDataRegion,
                              user,
                              placeTaxonomyMappedFieldTypes.REGION,
                              false,
                              calendarContentLanguage,
                            )}
                            tagRender={(props) => {
                              const { label, closable, onClose } = props;
                              return (
                                <Tags
                                  data-cy={`tag-place-${label}`}
                                  closable={closable}
                                  onClose={onClose}
                                  closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                                  {label}
                                </Tags>
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>

                      <Col flex="448px" className="widget-settings-location">
                        <Form.Item
                          name="location"
                          label={t(`${localePath}.location`)}
                          data-cy="widget-settings-location">
                          <SelectOption
                            mode="multiple"
                            filterOption={false}
                            onSearch={debounceSearchPlace}
                            showSearch
                            value={searchKey}
                            onChange={(newValue) => {
                              setSearchKey(newValue);
                            }}
                            onBlur={() => {
                              debounceSearchPlace('');
                            }}
                            allowClear
                            placeholder={<span>{t(`${localePath}.placeholder.place`)}</span>}
                            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                            options={locationOptions}
                            notFoundContent={
                              isEntitiesFetching ? (
                                <div style={{ width: '100%', display: 'grid', placeContent: 'center' }}>
                                  <Spin size="medium" />
                                </div>
                              ) : (
                                <NoContent />
                              )
                            }
                            tagRender={(props) => {
                              const { label, closable, onClose } = props;
                              return (
                                <Tags
                                  closable={closable}
                                  onClose={onClose}
                                  closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                                  data-cy={`widget-settings-tag-select-${label}`}>
                                  {label}
                                </Tags>
                              );
                            }}
                            data-cy="widget-settings-location-select"
                          />
                        </Form.Item>
                      </Col>
                      <Col flex="448px" className="widget-settings-organizer">
                        <Form.Item
                          name="personOrganization"
                          label={t(`${localePath}.personOrganization`)}
                          data-cy="widget-settings-person-organization">
                          <SelectOption
                            mode="multiple"
                            filterOption={false}
                            onSearch={(value) =>
                              debounceSearchPerformerOrganizer(value, fieldName.performerOrganization)
                            }
                            showSearch
                            allowClear
                            placeholder={<span>{t(`${localePath}.placeholder.OrganizationsAndPeople`)}</span>}
                            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                            notFoundContent={
                              isEntitiesFetching ? (
                                <div style={{ width: '100%', display: 'grid', placeContent: 'center' }}>
                                  <Spin size="medium" />
                                </div>
                              ) : (
                                <NoContent />
                              )
                            }
                            options={performerOrganizerOptions}
                            tagRender={(props) => {
                              const { label, closable, onClose } = props;
                              return (
                                <Tags
                                  closable={closable}
                                  onClose={onClose}
                                  closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                                  data-cy={`widget-settings-tag-select-${label}`}>
                                  {label}
                                </Tags>
                              );
                            }}
                            data-cy="widget-settings-organizer-person-select"
                          />
                        </Form.Item>
                      </Col>
                      <Col flex="448px" className="widget-settings-organizer">
                        <Form.Item
                          name="organizer"
                          label={t(`${localePath}.organizer`)}
                          data-cy="widget-settings-organizer">
                          <SelectOption
                            mode="multiple"
                            filterOption={false}
                            onSearch={(value) => debounceSearchPerformerOrganizer(value, fieldName.organizer)}
                            showSearch
                            allowClear
                            placeholder={<span>{t(`${localePath}.placeholder.OrganizationsAndPeople`)}</span>}
                            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                            notFoundContent={
                              isEntitiesFetching ? (
                                <div style={{ width: '100%', display: 'grid', placeContent: 'center' }}>
                                  <Spin size="medium" />
                                </div>
                              ) : (
                                <NoContent />
                              )
                            }
                            options={organizerOptions}
                            tagRender={(props) => {
                              const { label, closable, onClose } = props;
                              return (
                                <Tags
                                  closable={closable}
                                  onClose={onClose}
                                  closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                                  data-cy={`widget-settings-tag-select-${label}`}>
                                  {label}
                                </Tags>
                              );
                            }}
                            data-cy="widget-settings-organizer-select"
                          />
                        </Form.Item>
                      </Col>
                      <Col flex="448px" className="widget-settings-person">
                        <Form.Item name="person" label={t(`${localePath}.person`)} data-cy="widget-settings-person">
                          <SelectOption
                            mode="multiple"
                            filterOption={false}
                            onSearch={(value) => debounceSearchPerformerOrganizer(value, fieldName.performer)}
                            showSearch
                            allowClear
                            placeholder={<span>{t(`${localePath}.placeholder.OrganizationsAndPeople`)}</span>}
                            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                            notFoundContent={
                              isEntitiesFetching ? (
                                <div style={{ width: '100%', display: 'grid', placeContent: 'center' }}>
                                  <Spin size="medium" />
                                </div>
                              ) : (
                                <NoContent />
                              )
                            }
                            options={performerOptions}
                            tagRender={(props) => {
                              const { label, closable, onClose } = props;
                              return (
                                <Tags
                                  closable={closable}
                                  onClose={onClose}
                                  closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
                                  data-cy={`widget-settings-tag-select-${label}`}>
                                  {label}
                                </Tags>
                              );
                            }}
                            data-cy="widget-settings-person-select"
                          />
                        </Form.Item>
                      </Col>

                      <Divider />

                      <Col>
                        <h4 className="heading" data-cy="widget-settings-title">
                          {t(`${localePath}.codeSectionTitle`)}
                        </h4>
                        <p className="page-description" data-cy="widget-settings-page-description">
                          {t(`${localePath}.codeSectionInfo`)}
                        </p>
                      </Col>

                      <Col flex="448px" className="widget-settings-code">
                        <div className="widget-settings-code-container">
                          <span style={{ display: 'flex', alignItems: 'center' }}>{iframeCode}</span>
                          <Outlined
                            size="large"
                            label={t(`${localePath}.copy`)}
                            onClick={() => {
                              form
                                .validateFields(['width', 'height', 'limit', 'color'])
                                .then(() => {
                                  copyText({
                                    textToCopy: iframeCode,
                                    message: t(`${localePath}.copyNotification`),
                                  });
                                })
                                .catch((error) => {
                                  error?.errorFields?.map((e, index) => {
                                    notify({
                                      index,
                                      messageText:
                                        e.errors[0] != ' ' ? e.errors[0] : t(`${localePath}.validation.color`),
                                    });
                                  });
                                });
                            }}
                            icon={<CopyOutlined style={{ color: '#1B3DE6' }} size="12px" />}
                            data-cy="button-copy"
                          />
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Col>
              <WidgetPreview
                setPreviewModal={setPreviewModal}
                mobileWidgetUrl={urlMobile}
                fullscreenWidgetUrl={url}
                form={form}
                notify={notify}
                previewModal={previewModal}
                showMobileIframe={showMobileIframe}
                handleUpdate={onUpdate}
                isMaskVisible={isMaskVisible}
                isLoading={isLoading}
              />
            </Row>
          </Col>
        </Row>
      ) : (
        <div className="loading-container">
          <LoadingIndicator />
        </div>
      )}
    </>
  );
};

export default WidgetSettings;
