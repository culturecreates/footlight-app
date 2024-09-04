import { Button, Col, Divider, Form, Grid, Row, Spin, message, notification } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './widgetSettings.css';
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
import CustomModal from '../../../../components/Modal/Common/CustomModal';
import { copyText } from '../../../../utils/copyText';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { widgetFontCollection } from '../../../../constants/fonts';

const { useBreakpoint } = Grid;
const widgetUrl = process.env.REACT_APP_CALENDAR_WIDGET_BASE_URL;

const WidgetSettings = ({ setDirtyStatus, tabKey }) => {
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

  const [color, setColor] = useState('#607EFC');
  const [locationOptions, setLocationOptions] = useState([]);
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [personOptions, setPersonOptions] = useState([]);
  const [searchKey, setSearchKey] = useState([]);
  const [iframeCode, setIframeCode] = useState('');
  const [previewModal, setPreviewModal] = useState(false);
  const [url, setUrl] = useState(new URL(widgetUrl));
  const [urlMobile, setUrlMObile] = useState(new URL(widgetUrl));

  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery({ sessionId: timestampRef });

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.EVENT);
  const { currentData: taxonomyDataEventType } = useGetAllTaxonomyQuery({
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
  let queryPerson = new URLSearchParams();
  let queryOrganization = new URLSearchParams();

  queryOrganization.append('classes', entitiesClass.organization);
  queryPerson.append('classes', entitiesClass.person);
  queryLocation.append('classes', entitiesClass.place);

  const { currentData: initialEntitiesOrganization } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(queryOrganization.toString()),
    sessionId: timestampRef,
  });
  const { currentData: initialEntitiesPerson } = useGetEntitiesQuery({
    calendarId,
    searchKey: '',
    classes: decodeURIComponent(queryPerson.toString()),
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

  const handleFormValuesChange = (changedValues, allValues) => {
    if (regexForHexCode.test(color)) {
      const width = form.getFieldValue('width') ?? 0;
      const height = form.getFieldValue('height') ?? 600;
      const limit = form.getFieldValue('limit') ?? 9;
      const font = form.getFieldValue('font') ?? 'Roboto';

      const filtersParam =
        arrayToQueryParam(allValues?.eventType ?? [], 'type') +
        arrayToQueryParam(allValues?.location ?? [], 'place') +
        arrayToQueryParam(allValues?.region ?? [], 'region') +
        arrayToQueryParam([...(allValues?.person ?? []), ...(allValues?.organizer ?? [])], 'person-organization');

      const searchEventsFilters = filtersParam;

      const locale = onLanguageSelect(allValues?.language);
      const urlCopy = new URL(widgetUrl);
      const urlCopyMobile = new URL(widgetUrl);

      // Add query parameters to the URL
      urlCopy.searchParams.append('width', width);
      urlCopy.searchParams.append('font', font);
      urlCopy.searchParams.append('limit', limit);
      urlCopy.searchParams.append('calendar', calendarSlug);
      urlCopy.searchParams.append('calendarName', calendarName);
      urlCopy.searchParams.append('logo', calendarLogoUri);
      urlCopy.searchParams.append('searchEventsFilters', searchEventsFilters);
      urlCopy.searchParams.append('locale', locale?.key.toLowerCase());

      if (changedValues.color) {
        urlCopy.searchParams.append('color', changedValues.color);
      } else urlCopy.searchParams.append('color', color);
      urlCopy.searchParams.append('height', height);

      urlCopyMobile.searchParams.append('limit', limit);
      urlCopyMobile.searchParams.append('calendar', calendarSlug);
      urlCopyMobile.searchParams.append('calendarName', calendarName);
      urlCopyMobile.searchParams.append('font', font);
      urlCopyMobile.searchParams.append('logo', calendarLogoUri);
      urlCopyMobile.searchParams.append('searchEventsFilters', searchEventsFilters);
      urlCopyMobile.searchParams.append('locale', locale?.key.toLowerCase());
      urlCopyMobile.searchParams.append('height', '600');
      if (changedValues.color) {
        urlCopyMobile.searchParams.append('color', changedValues.color);
      } else urlCopyMobile.searchParams.append('color', color);
      setUrlMObile(urlCopyMobile);

      setUrl(urlCopy);
      setIframeCode(
        `<iframe src="${urlCopy.href}" width="100%" style="max-width:${width}px; border:none" height="${height}px"></iframe>`,
      );
      setDirtyStatus(true);
    }
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

  const organizerSearch = (inputValue) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.organization);
    setOrganizationOptions([]);

    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities({
      searchKey: inputValue,
      classes: decodeURIComponent(query.toString()),
      calendarId,
    })
      .unwrap()
      .then((response) => {
        setOrganizationOptions(
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

  const personSearch = (inputValue) => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.person);
    setPersonOptions([]);

    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities({
      searchKey: inputValue,
      classes: decodeURIComponent(query.toString()),
      calendarId,
    })
      .unwrap()
      .then((response) => {
        setPersonOptions(
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

  const debounceSearchPlace = useCallback(useDebounce(placesSearch, SEARCH_DELAY), []);
  const debounceSearchOrganizer = useCallback(useDebounce(organizerSearch, SEARCH_DELAY), []);
  const debounceSearchPerson = useCallback(useDebounce(personSearch, SEARCH_DELAY), []);

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
    if (initialEntitiesPerson) {
      setPersonOptions(
        initialEntitiesPerson.map((item) => {
          return {
            value: item?.id,
            label: bilingual({ data: item?.name, interfaceLanguage: user?.interfaceLanguage }),
          };
        }),
      );
    }
  }, [initialEntitiesPerson]);

  useEffect(() => {
    if (initialEntitiesOrganization) {
      setOrganizationOptions(
        initialEntitiesOrganization.map((item) => {
          return {
            value: item?.id,
            label: bilingual({ data: item?.name, interfaceLanguage: user?.interfaceLanguage }),
          };
        }),
      );
    }
  }, [initialEntitiesOrganization]);

  useEffect(() => {
    if (tabKey != '2') return;

    form.resetFields();
    setColor('#607EFC');
    form.setFieldValue('color', color);

    const urlCopy = new URL(widgetUrl);
    const urlCopyMobile = new URL(widgetUrl);

    const height = form.getFieldValue('height') ?? 600;
    const limit = form.getFieldValue('limit') ?? 9;
    const font = form.getFieldValue('font') ?? 'Roboto';
    const locale = form.getFieldValue('locale') ?? languageOptions[0]?.value;

    urlCopy.searchParams.append('logo', calendarLogoUri);
    urlCopy.searchParams.append('locale', onLanguageSelect(locale)?.key.toLowerCase());
    urlCopy.searchParams.append('limit', limit);
    urlCopy.searchParams.append('color', color);
    urlCopy.searchParams.append('font', font);

    urlCopy.searchParams.append('calendar', calendarSlug);
    urlCopy.searchParams.append('calendarName', calendarName);
    urlCopy.searchParams.append('height', height);
    setUrl(urlCopy);

    urlCopyMobile.searchParams.append('logo', calendarLogoUri);
    urlCopyMobile.searchParams.append('locale', onLanguageSelect(locale)?.key.toLowerCase());
    urlCopyMobile.searchParams.append('limit', limit);
    urlCopyMobile.searchParams.append('color', color);
    urlCopyMobile.searchParams.append('font', font);
    urlCopyMobile.searchParams.append('calendar', calendarSlug);
    urlCopyMobile.searchParams.append('calendarName', calendarName);
    urlCopyMobile.searchParams.append('height', '600');

    setUrlMObile(urlCopyMobile);

    setIframeCode(
      `<iframe src="${urlCopy.href}" width="100%" style="max-width:1000px; border:none" height="${height}px"></iframe>`,
    );
  }, [calendarContentLanguage, tabKey]);

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
                                return Promise.resolve();
                              },
                            },
                          ]}
                          data-cy="widget-settings-limit">
                          <StyledInput />
                        </Form.Item>
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
                              initialValue={600}
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
                          initialValue={widgetFontCollection[0]}
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
                          name="organizer"
                          label={t(`${localePath}.organizer`)}
                          data-cy="widget-settings-organizer">
                          <SelectOption
                            mode="multiple"
                            filterOption={false}
                            onSearch={debounceSearchOrganizer}
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
                            options={organizationOptions}
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
                            onSearch={debounceSearchPerson}
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
                            options={personOptions}
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
              <Col flex={'448px'} style={{ display: `${!screens.xl ? 'none' : 'block'}` }}>
                <div className="preview-section-wrapper">
                  <div className="preview-section-wrapper-header">
                    <span>{t(`${localePath}.previewMobile`)}</span>
                    <Outlined
                      size="large"
                      label={t(`${localePath}.previewDesktop`)}
                      data-cy="button-preview"
                      onClick={() => {
                        form
                          .validateFields(['width', 'height', 'limit', 'color'])
                          .then(() => {
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
                  </div>
                  <CustomModal
                    open={previewModal}
                    centered
                    className="widget-settings-page-iframe-modal"
                    width={form.getFieldValue('width') ? `${form.getFieldValue('width')}px` : '1000px'}
                    height={
                      form.getFieldValue('height') ? `${parseInt(form.getFieldValue('height')) + 100}px` : '700px'
                    }
                    title={
                      <span
                        className="quick-create-organization-modal-title"
                        data-cy="widget-settings-page-modal-title">
                        {!screens.lg ? t(`${localePath}.previewMobileBtn`) : t(`${localePath}.previewDesktop`)}
                      </span>
                    }
                    footer={null}
                    onCancel={() => setPreviewModal(false)}>
                    <iframe
                      width="100%"
                      height={form.getFieldValue('height') ? `${form.getFieldValue('height')}px` : '600px'}
                      style={{
                        border: 'none',
                        maxWidth: form.getFieldValue('width') ? `${form.getFieldValue('width')}px` : '100%',
                      }}
                      src={url.href}></iframe>
                  </CustomModal>
                  <iframe src={urlMobile.href}></iframe>
                </div>
              </Col>
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
