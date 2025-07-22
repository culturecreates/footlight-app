import React, { useEffect, useRef, useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getStandardFieldTranslation, standardFieldsForTaxonomy } from '../../../utils/standardFields';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { taxonomyClassTranslations } from '../../../constants/taxonomyClass';
import { Card, Checkbox, Col, Form, Input, Row, notification } from 'antd';
import Alert from '../../../components/Alert';
import BreadCrumbButton from '../../../components/Button/BreadCrumb/BreadCrumbButton';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../../components/Button/Primary';
import OutlinedButton from '../../..//components/Button/Outlined';
import './addTaxonomy.css';
import { useAddTaxonomyMutation, useLazyGetTaxonomyQuery, useUpdateTaxonomyMutation } from '../../../services/taxonomy';
import Select from '../../../components/Select';
import CardEvent from '../../../components/Card/Common/Event';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';
import { DownOutlined } from '@ant-design/icons';
import { userRolesWithTranslation } from '../../../constants/userRoles';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { setErrorStates } from '../../../redux/reducer/ErrorSlice';
import { RouteLeavingGuard } from '../../../hooks/usePrompt';
import { compareArraysOfObjects } from '../../../utils/genericObjectCompare';
import { PathName } from '../../../constants/pathName';
import StyledSwitch from '../../../components/Switch/StyledSwitch';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import { placeHolderCollectionCreator } from '../../../utils/MultiLingualFormItemSupportFunctions';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems/CreateMultiLingualFormItems';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import DraggableTable from '../../../components/DraggableTree/DraggableTable';
import { sanitizeData, transformLanguageKeys } from '../../../utils/draggableTableUtilFunctions';
import {
  clearActiveFallbackFieldsInfo,
  getActiveFallbackFieldsInfo,
  getIsBannerDismissed,
  getLanguageLiteralBannerDisplayStatus,
  setBannerDismissed,
  setLanguageLiteralBannerDisplayStatus,
} from '../../../redux/reducer/languageLiteralSlice';
import { filterUneditedFallbackValues } from '../../../utils/removeUneditedFallbackValues';

const taxonomyClasses = taxonomyClassTranslations.map((item) => {
  return { ...item, value: item.key };
});
const { TextArea } = Input;

const AddTaxonomy = () => {
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  let [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  const isBannerDismissed = useSelector(getIsBannerDismissed);
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);
  const languageLiteralBannerDisplayStatus = useSelector(getLanguageLiteralBannerDisplayStatus);

  const { user } = useSelector(getUserDetails);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  const taxonomyId = searchParams.get('id');
  setContentBackgroundColor('#F9FAFF');

  const [transformedConceptData, setTransformedConceptData] = useState([]);
  const [standardFields, setStandardFields] = useState([]);
  const [dynamic, setDynamic] = useState(location.state?.dynamic ?? false);
  const [fallbackStatus, setFallbackStatus] = useState({});
  const [userAccess, setUserAccess] = useState();
  const [conceptData, setConceptData] = useState([]);
  const [isDirty, setIsDirty] = useState({
    formState: false,
    isSubmitting: false,
  });

  const [getTaxonomy, { data: taxonomyData, isSuccess: isSuccess, isFetching: loading }] = useLazyGetTaxonomyQuery({
    sessionId: timestampRef,
  });
  const [addTaxonomy] = useAddTaxonomyMutation();
  const [updateTaxonomy] = useUpdateTaxonomyMutation();

  const { taxonomyClass } = taxonomyData || {};
  const selectedClass = location.state?.selectedClass;

  function cleanNames(data) {
    return data
      .map((item) => {
        return {
          ...item,
          // eslint-disable-next-line no-unused-vars
          name: Object.fromEntries(Object.entries(item?.name || {}).filter(([_, value]) => value.trim() !== '')),
          children: item?.children ? cleanNames(item.children) : undefined,
        };
      })
      .filter((item) => Object.keys(item.name).length > 0);
  }

  useEffect(() => {
    if (taxonomyId && currentCalendarData) {
      getTaxonomy({ id: taxonomyId, includeConcepts: true, calendarId })
        .unwrap()
        .then((res) => {
          const availableStandardFields = standardFieldsForTaxonomy(
            res?.taxonomyClass,
            currentCalendarData?.fieldTaxonomyMaps,
          );
          setConceptData(cleanNames(res?.concepts));
          setUserAccess(res?.isAdminOnly && [userRolesWithTranslation[0].key]);
          setStandardFields([
            ...availableStandardFields,
            getStandardFieldTranslation({ value: res?.mappedToField, classType: res?.taxonomyClass }),
          ]);
          setDynamic(res?.isDynamicField ?? false);
        });
    }
  }, [taxonomyId, currentCalendarData]);

  useEffect(() => {
    if (user && calendar.length > 0) {
      !adminCheckHandler({ calendar, user }) &&
        dispatch(setErrorStates({ errorCode: '403', isError: true, message: 'Not Authorized' }));
    }
  }, [user, calendar]);

  useEffect(() => {
    // setting class initial value

    const value = taxonomyId ? taxonomyClass : selectedClass;
    let initialTaxonomyValue;

    if (!value) {
      initialTaxonomyValue = taxonomyClasses[0];
      form.setFieldValue('class', taxonomyClasses[0]);
    } else {
      initialTaxonomyValue = taxonomyClasses.find((c) => c.key === value) || {};
      form.setFieldValue('class', initialTaxonomyValue);
    }

    // setting standardFields initial value
    taxonomyData?.mappedToField &&
      initialTaxonomyValue &&
      form.setFieldValue(
        'mappedToField',
        getStandardFieldTranslation({ value: taxonomyData?.mappedToField, classType: initialTaxonomyValue.key }),
      );
  }, [taxonomyData]);

  useEffect(() => {
    // setup for new taxonomy
    if (!taxonomyId && currentCalendarData) {
      if (location.state?.selectedClass) {
        const availableStandardFields = standardFieldsForTaxonomy(
          location.state?.selectedClass ?? taxonomyClasses[0].key,
          currentCalendarData?.fieldTaxonomyMaps,
        );
        setStandardFields(availableStandardFields);
      }
    }
    if (location.state?.id) {
      setSearchParams(location.state?.id);
    }
  }, [currentCalendarData]);

  useEffect(() => {
    if (!calendarContentLanguage) return;

    setEmptyConceptName();
  }, [calendarContentLanguage]);

  const setEmptyConceptName = () => {
    const initialConceptName = {};
    calendarContentLanguage.forEach((language) => {
      initialConceptName[contentLanguageKeyMap[language]] = '';
    });
    form.setFieldValue('conceptName', initialConceptName);
  };

  function cleanEmptyNames(data) {
    return data
      .map((item) => {
        const cleanedName = Object.fromEntries(
          // eslint-disable-next-line no-unused-vars
          Object.entries(item.name || {}).filter(([_, value]) => value.trim() !== ''),
        );

        return {
          ...item,
          name: cleanedName,
          children: item.children ? cleanEmptyNames(item.children) : item.children,
        };
      })
      .filter((item) => Object.keys(item.name).length > 0);
  }

  function cleanConcepts(data) {
    if (!data.concepts || !Array.isArray(data.concepts)) return data;

    return {
      ...data,
      concepts: cleanEmptyNames(data.concepts),
    };
  }

  const saveTaxonomyHandler = (e) => {
    e.preventDefault();
    const filteredConceptData = modifyConceptData(conceptData);
    setIsDirty({
      formState: false,
      isSubmitting: true,
    });
    form
      .validateFields(['name', 'disambiguatingDescription'])
      .then(() => {
        var values = form.getFieldsValue(true);
        const fallbackStatus = activeFallbackFieldsInfo;

        const name = filterUneditedFallbackValues({
          values: values?.name,
          activeFallbackFieldsInfo: fallbackStatus,
          initialDataValue: taxonomyData?.name,
          fieldName: 'name',
        });

        const disambiguatingDescription = filterUneditedFallbackValues({
          values: values?.disambiguatingDescription,
          activeFallbackFieldsInfo: fallbackStatus,
          initialDataValue: taxonomyData?.disambiguatingDescription,
          fieldName: 'disambiguatingDescription',
        });

        const rawBody = {
          name: name,
          taxonomyClass: values?.class?.value,
          isDynamicField: dynamic ?? false,
          includeInFullTextSearch: true,
          ...(dynamic == false && {
            mappedToField: values?.mappedToField?.key ?? values?.mappedToField,
          }),
          isAdminOnly: userAccess?.length > 0,
          disambiguatingDescription: disambiguatingDescription,
          concepts: cleanConcepts({ concepts: [...filteredConceptData] }),
          addToFilter: values?.addToFilter,
        };

        // Filter out undefined values
        const body = Object.fromEntries(Object.entries(rawBody).filter(([, value]) => value !== undefined));

        if (taxonomyId) {
          updateTaxonomy({ calendarId, body, taxonomyId })
            .unwrap()
            .then((res) => {
              if (res.statusCode == 202) {
                getCalendar({ id: calendarId, sessionId: timestampRef });
                notification.success({
                  description: t('dashboard.taxonomy.addNew.messages.update'),
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}`, { replace: true });
              }
            });
        } else {
          addTaxonomy({ calendarId, body })
            .unwrap()
            .then((res) => {
              if (res.statusCode == 202) {
                getCalendar({ id: calendarId, sessionId: timestampRef });
                notification.success({
                  description: t('dashboard.taxonomy.addNew.messages.create'),
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });

                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}`, { replace: true });
              }
            });
        }
      })
      .catch((error) => {
        console.error(error);
        setIsDirty({
          formState: form.isFieldsTouched([
            'userAccess',
            'disambiguatingDescription',
            'name',
            'mappedToField',
            'class',
          ]),
          isSubmitting: false,
        });
      });
  };

  const handleSelectChange = (selectedKeys, option) => {
    let name = {};
    calendarContentLanguage.forEach((language) => {
      const langKey = contentLanguageKeyMap[language];
      if (Object.prototype.hasOwnProperty.call(option, langKey)) {
        name[langKey] = option[langKey];
      } else name[langKey] = option[contentLanguageKeyMap.ENGLISH];
    });

    form.setFieldsValue({ name });
  };

  function modifyConceptData(conceptData) {
    const sanitizedConceptData = sanitizeData(conceptData, fallbackStatus);
    return (
      sanitizedConceptData?.map((item) => {
        // eslint-disable-next-line no-unused-vars
        const filteredName = Object.fromEntries(Object.entries(item.name || {}).filter(([_, value]) => value !== ''));

        return {
          ...(item.id && { id: item.id }),
          name: filteredName,
          children: item.children ? modifyConceptData(item.children) : [],
        };
      }) || []
    );
  }

  const handleValueChange = () => {
    setIsDirty({
      formState: form.isFieldsTouched([
        'userAccess',
        'disambiguatingDescription',
        'name',
        'mappedToField',
        'class',
        'addToFilter',
      ]),
      isSubmitting: false,
    });
  };

  const handleClearAllFallbackStatus = () => {
    dispatch(setBannerDismissed(true));
    dispatch(setLanguageLiteralBannerDisplayStatus(false));

    const sanitizedData = sanitizeData(transformedConceptData, fallbackStatus);
    const filteredConceptData = transformLanguageKeys(sanitizedData);
    setConceptData(filteredConceptData);
  };

  useEffect(() => {
    dispatch(clearActiveFallbackFieldsInfo());
    dispatch(setBannerDismissed(false));
  }, []);

  useEffect(() => {
    if (isReadOnly) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}`, { replace: true });
  }, [isReadOnly]);

  useEffect(() => {
    // Flatten the fallbackStatus structure to extract all tagdisplaystatus values
    const allTagDisplayStatuses = Object.values(fallbackStatus).flatMap((value) =>
      typeof value === 'object'
        ? Object.values(value).map((innerValue) => innerValue.tagdisplaystatus)
        : [value.tagdisplaystatus],
    );

    let shouldDisplay = true;

    const fallbackFieldNames = Object.keys(activeFallbackFieldsInfo) || [];
    let individualFallbackFieldsCollection = [];
    fallbackFieldNames.forEach((name) => {
      individualFallbackFieldsCollection.push(...Object.values(activeFallbackFieldsInfo[name] || []));
    });

    individualFallbackFieldsCollection.forEach((element) => {
      if (element?.tagDisplayStatus) {
        shouldDisplay = false;
      }
    });

    if (!isBannerDismissed) {
      const draggableTreeBannerStatus = allTagDisplayStatuses.every((status) => status === false);
      draggableTreeBannerStatus && shouldDisplay
        ? dispatch(setLanguageLiteralBannerDisplayStatus(false))
        : dispatch(setLanguageLiteralBannerDisplayStatus(true));
    } else {
      dispatch(setLanguageLiteralBannerDisplayStatus(false));
    }
  }, [fallbackStatus, activeFallbackFieldsInfo]);

  return (
    <>
      <RouteLeavingGuard
        isBlocking={
          isDirty.formState ||
          (!isDirty.isSubmitting ? !compareArraysOfObjects(conceptData ?? [], taxonomyData?.concepts ?? []) : false)
        }
      />

      {!loading && calendarContentLanguage && (isSuccess || !taxonomyId) ? (
        <Form layout="vertical" form={form} onValuesChange={handleValueChange}>
          <Row className="add-taxonomy-wrapper" gutter={[16, 16]}>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col>
                      <BreadCrumbButton />
                    </Col>
                    <Col>
                      <div className="add-event-button-wrap">
                        <Form.Item>
                          <PrimaryButton
                            data-cy="button-taxonomy-save"
                            label={t('dashboard.taxonomy.addNew.save')}
                            onClick={(e) => saveTaxonomyHandler(e)}
                          />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <Row>
                    <div className="add-Taxonomy-heading">
                      <h4 data-cy="heading-add-edit-taxonomy">
                        {taxonomyId
                          ? t('dashboard.taxonomy.addNew.editHeading')
                          : t('dashboard.taxonomy.addNew.heading')}
                      </h4>
                    </div>
                  </Row>
                </Col>
              </Row>
              <Row>
                {languageLiteralBannerDisplayStatus && (
                  <Col span={24} className="language-literal-banner">
                    <Row>
                      <Col flex={'780px'}>
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                          <Col span={24}>
                            <Alert
                              message={t('common.forms.languageLiterals.bannerTitle')}
                              type="info"
                              showIcon={false}
                              action={
                                <OutlinedButton
                                  data-cy="button-change-fallback-banner"
                                  size="large"
                                  label={t('common.dismiss')}
                                  onClick={() => handleClearAllFallbackStatus()}
                                />
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                )}
              </Row>
            </Col>
            <CardEvent marginResponsive="0px">
              <>
                <Row>
                  <Col flex={'423px'}>
                    <Form.Item
                      data-cy="form-item-taxonomy-class"
                      label={t('dashboard.taxonomy.addNew.class')}
                      name="class"
                      required
                      className={`classType disabled-dropdown`}>
                      <Select data-cy="dropdown-taxonomy-class" options={taxonomyClasses} disabled />
                    </Form.Item>
                    <span className="field-description" data-cy="span-taxonomy-class-helper-text">
                      {t(`dashboard.taxonomy.addNew.destinationHeading`)}
                    </span>
                  </Col>
                </Row>
                {(dynamic == false || (taxonomyId && !taxonomyData?.isDynamicField)) && (
                  <Row>
                    <Col flex={'423px'}>
                      <Form.Item
                        label={t('dashboard.taxonomy.addNew.mapToField')}
                        required
                        className="mapToField"
                        name="mappedToField"
                        data-cy="form-item-taxonomy-mapped-field-title">
                        <Select
                          data-cy="dropdown-taxonomy-mapped-field"
                          options={standardFields.filter((s) => s !== undefined)}
                          onSelect={handleSelectChange}
                          disabled={
                            form.getFieldValue('class') === '' ||
                            standardFields.filter((s) => s !== undefined).length === 0
                          }
                          trigger={['click']}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Row>
                  <Col flex="423px">
                    <Form.Item label={t('dashboard.taxonomy.addNew.name')} required data-cy="form-item-taxonomy-name">
                      <CreateMultiLingualFormItems
                        calendarContentLanguage={calendarContentLanguage}
                        form={form}
                        entityId={taxonomyId}
                        name={['name']}
                        data={Object.fromEntries(
                          Object.entries(taxonomyData?.name || {}).filter(([, value]) => value !== ''),
                        )}
                        required={true}
                        validations={t('dashboard.taxonomy.addNew.validations.name')}
                        dataCy="input-text-area-taxonomy-name-"
                        placeholder={placeHolderCollectionCreator({
                          calendarContentLanguage,
                          placeholderBase: 'dashboard.taxonomy.addNew.placeHolder.namePlaceHolder',
                          t,
                        })}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          style={{
                            borderRadius: '4px',
                            border: `${
                              calendarContentLanguage?.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                          }}
                          size="large"
                        />
                      </CreateMultiLingualFormItems>

                      <span className="field-description" data-cy="span-taxonomy-name-helper-text">
                        {t(`dashboard.taxonomy.addNew.nameDescription`)}
                      </span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col flex="423px">
                    <Form.Item
                      label={t('dashboard.taxonomy.addNew.description')}
                      data-cy="form-item-taxonomy-description-title">
                      <CreateMultiLingualFormItems
                        calendarContentLanguage={calendarContentLanguage}
                        entityId={taxonomyId}
                        form={form}
                        name={['disambiguatingDescription']}
                        data={Object.fromEntries(
                          Object.entries(taxonomyData?.disambiguatingDescription || {}).filter(
                            ([, value]) => value !== '',
                          ),
                        )}
                        dataCy="input-text-area-taxonomy-description-"
                        placeholder={placeHolderCollectionCreator({
                          calendarContentLanguage,
                          placeholderBase: 'dashboard.taxonomy.addNew.placeHolder.descriptionPlaceHolder',
                          t,
                          postfixFillerText: 'DescriptionPlaceHolder',
                        })}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          style={{
                            borderRadius: '4px',
                            border: `${
                              calendarContentLanguage?.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                          }}
                          size="large"
                        />
                      </CreateMultiLingualFormItems>

                      <span className="field-description" data-cy="span-taxonomy-description-helper-text">
                        {t(`dashboard.taxonomy.addNew.descriptionExplation`)}
                      </span>
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col flex="423px">
                    <div className="userAccess-label">{t('dashboard.taxonomy.addNew.userAccess')}</div>
                    <div name="userAccess" className="user-access" data-cy="form-item-user-access-title">
                      <SearchableCheckbox
                        data-cy="searchable-checkbox-user-roles"
                        value={userAccess}
                        onFilterChange={(values) => {
                          form.setFieldValue('userAccess', values);
                          setUserAccess(values);
                          setIsDirty({
                            ...isDirty,
                            formState: true,
                          });
                        }}
                        data={[userRolesWithTranslation[0]]?.map((role) => {
                          return {
                            key: role.key,
                            label: (
                              <Checkbox value={role.value} key={role.key} style={{ marginLeft: '8px' }}>
                                {t(`dashboard.taxonomy.addNew.adminOnly`)}
                              </Checkbox>
                            ),
                            filtervalue: role.key,
                          };
                        })}>
                        {userAccess?.length > 0
                          ? t(`dashboard.taxonomy.addNew.adminOnly`)
                          : t(`dashboard.taxonomy.addNew.userAccessPlaceHolder`)}
                        <DownOutlined style={{ fontSize: '16px' }} />
                      </SearchableCheckbox>
                    </div>
                    <div className="field-description" style={{ marginTop: 8 }} data-cy="div-user-access-helper-text">
                      {t(`dashboard.taxonomy.addNew.userAccessDescription`)}
                    </div>
                  </Col>
                </Row>

                <Row justify={'start'} align={'top'} gutter={[8, 0]}>
                  <Col>
                    <Form.Item valuePropName="checked" name="addToFilter" initialValue={taxonomyData?.addToFilter}>
                      <StyledSwitch />
                    </Form.Item>
                  </Col>
                  <Col>
                    <span
                      style={{ color: '#222732', minHeight: '32px', display: 'flex', alignItems: 'center' }}
                      data-cy="span-add-to-filter-taxonomy-text">
                      {t('dashboard.taxonomy.addNew.addAsFilter')}
                    </span>
                  </Col>
                </Row>
              </>
              <></>
            </CardEvent>
            <Col span={24}>
              <Row>
                <Col flex="780px" style={{ margin: '32px 0px' }} className="concept-card">
                  <Card bordered={false}>
                    <Row justify="space-between" wrap={false}>
                      <Col>
                        <Row gutter={[16, 16]}>
                          <Col>
                            <Row gutter={[8, 8]} justify="space-between">
                              <Col className="heading-concepts">{t('dashboard.taxonomy.addNew.concepts.heading')}</Col>
                            </Row>
                            <Row>
                              <Col flex="423px" className="text-concepts">
                                {t('dashboard.taxonomy.addNew.concepts.description')}
                              </Col>
                            </Row>
                          </Col>
                        </Row>

                        <Row>
                          <Col
                            span={24}
                            style={{
                              display: 'flex',
                              marginTop: '16px',
                              width: 'calc(100% - 100px)',
                            }}>
                            <Row style={{ flex: 1 }}>
                              <DraggableTable
                                data={conceptData}
                                setData={setConceptData}
                                fallbackStatus={fallbackStatus}
                                setFallbackStatus={setFallbackStatus}
                                transformedData={transformedConceptData}
                                setTransformedData={setTransformedConceptData}
                              />
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      ) : (
        <div style={{ display: 'grid', placeContent: 'center', height: '500px', width: '100%' }}>
          <LoadingIndicator />
        </div>
      )}
    </>
  );
};

export default AddTaxonomy;
