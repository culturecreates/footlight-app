import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import './personReadOnly.css';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Col, Row, Skeleton } from 'antd';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { urlProtocolCheck } from '../../../components/Input/Common/input.settings';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import OrganizationLogo from '../../../assets/icons/organization-light.svg?react';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import {
  treeDynamicTaxonomyOptions,
  treeTaxonomyOptions,
} from '../../../components/TreeSelectOption/treeSelectOption.settings';
import OutlinedButton from '../../../components/Button/Outlined';
import Alert from '../../../components/Alert';
import Tags from '../../../components/Tags/Common/Tags';
import TreeSelectOption from '../../../components/TreeSelectOption/TreeSelectOption';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import { useGetPersonQuery } from '../../../services/people';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import { loadArtsDataEntity } from '../../../services/artsData';
import Icon, { EnvironmentOutlined, CalendarOutlined, WarningOutlined } from '@ant-design/icons';
import moment from 'moment';
import SelectionItem from '../../../components/List/SelectionItem';
import { useLazyGetEntityDependencyDetailsQuery } from '../../../services/entities';
import MultipleImageUpload from '../../../components/MultipleImageUpload';
import { getActiveTabKey } from '../../../redux/reducer/readOnlyTabSlice';
import ReadOnlyPageTabLayout from '../../../layout/ReadOnlyPageTabLayout/ReadOnlyPageTabLayout';
import { isDataValid, renderData } from '../../../utils/MultiLingualFormItemSupportFunctions';
import { personFormFieldNames } from '../../../constants/personAndOrganizationFormFieldNames';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import ImageUpload from '../../../components/ImageUpload';
import FallbackInjectorForReadOnlyPages from '../../../components/FallbackInjectorForReadOnlyPages/FallbackInjectorForReadOnlyPages';
import { clearActiveFallbackFieldsInfo } from '../../../redux/reducer/languageLiteralSlice';
import { getEmbedUrl } from '../../../utils/getEmbedVideoUrl';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import '../../../components/NoContent/noContent.css';
import {
  isReadOnlyValueEmpty,
  createReadOnlyFieldRenderers,
  getMissingMandatoryFieldKeys,
  shouldShowMandatoryMissingMessage,
} from '../../../utils/readOnlyValueHelpers';
import { entitiesClass } from '../../../constants/entitiesClass';

function PersonReadOnly() {
  const { t } = useTranslation();
  const { personId, calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const stickyHeaderRef = useRef(null);
  const navigate = useNavigate();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();

  const {
    data: personData,
    isLoading: personLoading,
    isSuccess: personSuccess,
    isError: personError,
  } = useGetPersonQuery({ personId, calendarId, sessionId: timestampRef }, { skip: personId ? false : true });

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PERSON);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [getDerivedEntities, { isFetching: isEntityDetailsLoading }] = useLazyGetEntityDependencyDetailsQuery({
    sessionId: timestampRef,
  });

  const { user } = useSelector(getUserDetails);
  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);
  const activeTabKey = useSelector(getActiveTabKey);
  const dispatch = useDispatch();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [derivedEntitiesData, setDerivedEntitiesData] = useState();
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(true);

  const isAnyLoading = useMemo(
    () => personLoading || isEntityDetailsLoading || taxonomyLoading || !personSuccess,
    [personLoading, isEntityDetailsLoading, taxonomyLoading, personSuccess],
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

  const mainImageData = personData?.image?.find((image) => image?.isMain) || null;
  const imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];
  const imageGalleryData = personData?.image?.filter((image) => image && !image?.isMain) || [];

  const formConstants = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.person)[0];
  let mandatoryStandardFields = [];
  let mandatoryDynamicFields = [];
  formConstants?.formFieldProperties?.mandatoryFields?.standardFields?.forEach((field) => {
    if (isDataValid(field)) {
      const fieldValue = Object.values(field)[0];
      mandatoryStandardFields.push(fieldValue);
    }
  });
  formConstants?.formFieldProperties?.mandatoryFields?.dynamicFields?.forEach((field) => {
    if (isDataValid(field)) {
      mandatoryDynamicFields.push(field);
    }
  });

  const { checkIfFieldIsToBeDisplayed, renderMissingValueMessage } = createReadOnlyFieldRenderers({
    mandatoryStandardFields,
    mandatoryDynamicFields,
    canViewAdminOnly: adminCheckHandler({ calendar, user }),
    t,
  });

  const missingRequiredFieldKeys = useMemo(() => {
    const standardFieldValueMap = {
      [personFormFieldNames.NAME]: personData?.name,
      [personFormFieldNames.DISAMBIGUATING_DESCRIPTION]: personData?.disambiguatingDescription,
      [personFormFieldNames.DESCRIPTION]: personData?.description,
      [personFormFieldNames.WEBSITE]: personData?.url?.uri,
      [personFormFieldNames.SOCIAL_MEDIA]: personData?.socialMediaLinks,
      [personFormFieldNames.IMAGE]: personData?.image,
      [personFormFieldNames.OCCUPATION]: personData?.occupation,
      [personFormFieldNames.VIDEO_URL]: personData?.videoUrl?.uri,
      [personFormFieldNames.ADDITIONAL_LINKS]: personData?.additionalLinks,
    };

    return getMissingMandatoryFieldKeys({
      mandatoryFieldKeys: mandatoryStandardFields,
      fieldValueMap: standardFieldValueMap,
    });
  }, [mandatoryStandardFields, personData]);

  const hasMissingRequiredFields = missingRequiredFieldKeys.length > 0;

  const renderLabelWithWarning = (fieldKey, label, value, type = 'standard') => {
    const mandatoryFieldKeys = type === 'standard' ? mandatoryStandardFields : mandatoryDynamicFields;
    const showWarning = shouldShowMandatoryMissingMessage({
      fieldKey,
      value,
      mandatoryFieldKeys,
    });

    return (
      <span className="read-only-missing-label-wrapper">
        {label}
        {showWarning && (
          <WarningOutlined
            className="read-only-missing-label-icon"
            aria-label={t('common.readOnly.emptyValue', { fieldName: label })}
          />
        )}
      </span>
    );
  };

  const getArtsData = (id) => {
    setArtsDataLoading(true);
    loadArtsDataEntity({ entityId: id })
      .then((response) => {
        setArtsData(response?.data[0]);
        setArtsDataLoading(false);
      })
      .catch((error) => {
        setArtsDataLoading(false);
        console.log(error);
      });
  };

  useLayoutEffect(() => {
    if (stickyHeaderRef.current) {
      document.documentElement.style.setProperty(
        '--person-read-only-header-height',
        `${stickyHeaderRef.current.offsetHeight}px`,
      );
    }
  }); // no deps — runs after every render to always capture the correct header height

  useEffect(() => {
    setContentBackgroundColor('#F9FAFF');
  }, [setContentBackgroundColor]);

  useEffect(() => {
    dispatch(clearActiveFallbackFieldsInfo());
  }, []);

  useEffect(() => {
    if (personError) navigate(`${PathName.NotFound}`);
  }, [personError]);

  useEffect(() => {
    if (personId) {
      getDerivedEntities({ id: personId, calendarId }).then((response) => {
        if (
          response?.data?.events?.length > 0 ||
          response?.data?.people?.length > 0 ||
          response?.data?.organizations?.length > 0
        ) {
          setDerivedEntitiesData(response?.data);
          setDerivedEntitiesDisplayStatus(true);
        }
      });
    }
  }, [personId]);

  useEffect(() => {
    if (personData) {
      if (personData?.sameAs?.length > 0) {
        let sourceId = artsDataLinkChecker(personData?.sameAs);
        getArtsData(sourceId);
      }
    }
  }, [personLoading]);

  return !debouncedLoading ? (
    <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
      <Row gutter={[32, 24]} className="read-only-wrapper person-read-only-wrapper" style={{ margin: 0 }}>
        <div className="person-read-only-sticky-header" ref={stickyHeaderRef}>
          <Col span={24} className="top-level-column">
            <Row gutter={[16, 16]}>
              <Col flex="auto">
                <Breadcrumbs
                  name={contentLanguageBilingual({
                    data: personData?.name,
                    requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                    calendarContentLanguage: calendarContentLanguage,
                  })}
                />
              </Col>
              <Col flex="60px" style={{ marginLeft: 'auto' }}>
                <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
                  <ReadOnlyProtectedComponent
                    creator={personData.createdByUserId}
                    entityId={personData?.id}
                    isReadOnly={isReadOnly}>
                    <div className="button-container">
                      <OutlinedButton
                        data-cy="button-edit-person"
                        label={t('dashboard.people.readOnly.edit')}
                        size="middle"
                        style={{ height: '40px', width: '60px' }}
                        onClick={() =>
                          navigate(
                            `${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.AddPerson}?id=${personData?.id}`,
                          )
                        }
                      />
                    </div>
                  </ReadOnlyProtectedComponent>
                </FeatureFlag>
              </Col>
            </Row>
          </Col>

          <Col span={24} className="top-level-column">
            <Row>
              <Col flex="780px">
                <div className="read-only-event-heading">
                  <h4 data-cy="heading-person-name">
                    {contentLanguageBilingual({
                      data: personData?.name,
                      requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p
                    className="read-only-event-content-sub-title-primary"
                    data-cy="para-person-disambiguating-description">
                    {contentLanguageBilingual({
                      data: personData?.disambiguatingDescription,
                      requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
          {artsDataLinkChecker(personData?.sameAs) && (
            <Col span={24} className="artsdata-link-wrapper top-level-column">
              <Row>
                <Col flex={'750px'}>
                  {artsDataLoading ? (
                    <div style={{ padding: '12px 0' }}>
                      <Skeleton active paragraph={{ rows: 1, width: '100%' }} title={false} style={{ width: '100%' }} />
                    </div>
                  ) : artsData ? (
                    <ArtsDataInfo
                      artsDataLink={artsDataLinkChecker(personData?.sameAs)}
                      name={contentLanguageBilingual({
                        data: artsData?.name,
                        requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                        calendarContentLanguage: calendarContentLanguage,
                      })}
                      disambiguatingDescription={contentLanguageBilingual({
                        data: artsData?.disambiguatingDescription,
                        requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                        calendarContentLanguage: calendarContentLanguage,
                      })}
                    />
                  ) : null}
                </Col>
              </Row>
            </Col>
          )}

          {hasMissingRequiredFields && (
            <Col span={24} className="artsdata-link-wrapper top-level-column">
              <Row>
                <Col flex={'750px'}>
                  <Alert
                    message={t('common.readOnly.missingRequiredBanner')}
                    type="warning"
                    showIcon
                    additionalClassName="alert-warning"
                  />
                </Col>
              </Row>
            </Col>
          )}
        </div>
        <Col span={24} flex={'780px'}>
          <Row>
            <ReadOnlyPageTabLayout>
              <Col span={24}>
                <Row gutter={[32, 24]}>
                  <Col className="read-only-content-wrapper top-level-column" span={24}>
                    <Row>
                      <Card marginResponsive="0">
                        <Col>
                          <Row>
                            <Col span={24}>
                              <p
                                className="read-only-event-content read-only-detail-heading"
                                data-cy="para-person-details-title">
                                {t('dashboard.people.readOnly.details')}
                              </p>
                            </Col>

                            {checkIfFieldIsToBeDisplayed(personFormFieldNames.NAME, personData?.name) && (
                              <Col span={24}>
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-person-name-title">
                                  {renderLabelWithWarning(
                                    personFormFieldNames.NAME,
                                    t('dashboard.people.readOnly.name'),
                                    personData?.name,
                                  )}
                                </p>
                                {!isReadOnlyValueEmpty(personData?.name) ? (
                                  <FallbackInjectorForReadOnlyPages
                                    fieldName="name"
                                    data={personData?.name}
                                    languageKey={activeTabKey}>
                                    {(processedData) => renderData(processedData, 'para-person-name-french')}
                                  </FallbackInjectorForReadOnlyPages>
                                ) : (
                                  renderMissingValueMessage(
                                    personFormFieldNames.NAME,
                                    t('dashboard.people.readOnly.name'),
                                    personData?.name,
                                    'div-person-name-missing-message',
                                  )
                                )}
                              </Col>
                            )}
                            {checkIfFieldIsToBeDisplayed(personFormFieldNames.OCCUPATION, personData?.occupation) && (
                              <div>
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-person-occupation-title">
                                  {renderLabelWithWarning(
                                    personFormFieldNames.OCCUPATION,
                                    taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false),
                                    personData?.occupation,
                                  )}
                                </p>
                                {!isReadOnlyValueEmpty(personData?.occupation) ? (
                                  <TreeSelectOption
                                    data-cy="treeselect-person-occupation"
                                    style={{ marginBottom: '1rem' }}
                                    bordered={false}
                                    open={false}
                                    disabled
                                    treeData={treeTaxonomyOptions(
                                      allTaxonomyData,
                                      user,
                                      'Occupation',
                                      false,
                                      calendarContentLanguage,
                                    )}
                                    defaultValue={personData?.occupation?.map((type) => {
                                      return type?.entityId;
                                    })}
                                    tagRender={(props) => {
                                      const { label } = props;
                                      return <Tags data-cy={`tag-person-occupation-${label}`}>{label}</Tags>;
                                    }}
                                  />
                                ) : (
                                  renderMissingValueMessage(
                                    personFormFieldNames.OCCUPATION,
                                    taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false),
                                    personData?.occupation,
                                    'div-person-occupation-missing-message',
                                  )
                                )}
                              </div>
                            )}
                            <Col span={24}>
                              {allTaxonomyData?.data?.map((taxonomy, index) => {
                                if (!taxonomy?.isDynamicField) {
                                  return null;
                                }

                                let initialValues,
                                  initialTaxonomy = [];
                                personData?.dynamicFields?.forEach((dynamicField) => {
                                  if (taxonomy?.id === dynamicField?.taxonomyId) {
                                    initialValues = dynamicField?.conceptIds;
                                    initialTaxonomy.push(taxonomy?.id);
                                  }
                                });

                                const dynamicValue = initialTaxonomy?.includes(taxonomy?.id) ? taxonomy : initialValues;
                                const shouldDisplayDynamicField = checkIfFieldIsToBeDisplayed(
                                  taxonomy?.id,
                                  dynamicValue,
                                  'dynamic',
                                  taxonomy?.isAdminOnly,
                                );

                                if (!shouldDisplayDynamicField) {
                                  return null;
                                }

                                return (
                                  <div key={index}>
                                    <p className="read-only-event-content-sub-title-primary">
                                      {bilingual({
                                        data: taxonomy?.name,
                                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                      })}
                                    </p>
                                    {!isReadOnlyValueEmpty(initialValues) ? (
                                      <TreeSelectOption
                                        data-cy={`treeselect-person-dynamic-field-${index}`}
                                        key={index}
                                        style={{ marginBottom: '1rem' }}
                                        bordered={false}
                                        open={false}
                                        disabled
                                        defaultValue={initialValues}
                                        treeData={treeDynamicTaxonomyOptions(
                                          taxonomy?.concept,
                                          user,
                                          calendarContentLanguage,
                                        )}
                                        tagRender={(props) => {
                                          const { label } = props;
                                          return <Tags data-cy={`tag-person-dynamic-field-${label}`}>{label}</Tags>;
                                        }}
                                      />
                                    ) : (
                                      renderMissingValueMessage(
                                        taxonomy?.id,
                                        bilingual({
                                          data: taxonomy?.name,
                                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                        }),
                                        initialValues,
                                        `div-person-dynamic-field-missing-${index}`,
                                        'dynamic',
                                      )
                                    )}
                                  </div>
                                );
                              })}
                            </Col>
                            {checkIfFieldIsToBeDisplayed(
                              personFormFieldNames.DISAMBIGUATING_DESCRIPTION,
                              personData?.disambiguatingDescription,
                            ) && (
                              <Col span={24}>
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-person-disambiguating-description-title">
                                  {t('dashboard.people.readOnly.disambiguatingDescription')}
                                </p>
                                {!isReadOnlyValueEmpty(personData?.disambiguatingDescription) ? (
                                  <FallbackInjectorForReadOnlyPages
                                    fieldName="disambiguatingDescription"
                                    data={personData?.disambiguatingDescription}
                                    languageKey={activeTabKey}>
                                    {(processedData) =>
                                      renderData(processedData, 'para-person-disambiguating-description-french')
                                    }
                                  </FallbackInjectorForReadOnlyPages>
                                ) : (
                                  renderMissingValueMessage(
                                    personFormFieldNames.DISAMBIGUATING_DESCRIPTION,
                                    t('dashboard.people.readOnly.disambiguatingDescription'),
                                    personData?.disambiguatingDescription,
                                    'div-person-disambiguating-description-missing-message',
                                  )
                                )}
                              </Col>
                            )}

                            {checkIfFieldIsToBeDisplayed(personFormFieldNames.DESCRIPTION, personData?.description) && (
                              <Col span={24}>
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-person-description-title">
                                  {renderLabelWithWarning(
                                    personFormFieldNames.DESCRIPTION,
                                    t('dashboard.people.readOnly.description'),
                                    personData?.description,
                                  )}
                                </p>
                                {!isReadOnlyValueEmpty(personData?.description) ? (
                                  <FallbackInjectorForReadOnlyPages
                                    fieldName="description"
                                    data={personData?.description}
                                    languageKey={activeTabKey}>
                                    {(processedData) => {
                                      return (
                                        <p>
                                          <div
                                            className="read-only-person-description"
                                            dangerouslySetInnerHTML={{
                                              __html: contentLanguageBilingual({
                                                data: processedData,
                                                calendarContentLanguage,
                                                requiredLanguageKey: activeTabKey,
                                              }),
                                            }}
                                            data-cy="div-person-description-french"
                                          />
                                        </p>
                                      );
                                    }}
                                  </FallbackInjectorForReadOnlyPages>
                                ) : (
                                  renderMissingValueMessage(
                                    personFormFieldNames.DESCRIPTION,
                                    t('dashboard.people.readOnly.description'),
                                    personData?.description,
                                    'div-person-description-missing-message',
                                  )
                                )}
                              </Col>
                            )}
                            {checkIfFieldIsToBeDisplayed(personFormFieldNames.WEBSITE, personData?.url) && (
                              <Col span={24}>
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-person-website-title">
                                  {t('dashboard.people.readOnly.website')}
                                </p>
                                {!isReadOnlyValueEmpty(personData?.url?.uri) ? (
                                  <p>
                                    <a
                                      href={urlProtocolCheck(personData?.url?.uri)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="url-links"
                                      data-cy="anchor-person-website">
                                      {personData?.url?.uri}
                                    </a>
                                  </p>
                                ) : (
                                  renderMissingValueMessage(
                                    personFormFieldNames.WEBSITE,
                                    t('dashboard.people.readOnly.website'),
                                    personData?.url?.uri,
                                    'div-person-website-missing-message',
                                  )
                                )}
                              </Col>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              personFormFieldNames.SOCIAL_MEDIA,
                              personData?.socialMediaLinks,
                            ) && (
                              <Col span={24}>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.people.readOnly.socialMediaLinks')}
                                </p>
                                {!isReadOnlyValueEmpty(personData?.socialMediaLinks)
                                  ? personData?.socialMediaLinks?.map((link, index) => (
                                      <p key={index}>
                                        <a
                                          href={urlProtocolCheck(link)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="url-links"
                                          data-cy="anchor-person-social-media-links">
                                          {link}
                                        </a>
                                      </p>
                                    ))
                                  : renderMissingValueMessage(
                                      personFormFieldNames.SOCIAL_MEDIA,
                                      t('dashboard.people.readOnly.socialMediaLinks'),
                                      personData?.socialMediaLinks,
                                      'div-person-social-media-missing-message',
                                    )}
                              </Col>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              personFormFieldNames.ADDITIONAL_LINKS,
                              personData?.additionalLinks,
                            ) && (
                              <Col span={24}>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.people.readOnly.additionalLinks')}
                                </p>
                                {!isReadOnlyValueEmpty(personData?.additionalLinks)
                                  ? personData?.additionalLinks?.map((link, index) => (
                                      <div key={index}>
                                        {Object.keys(link?.name ?? {})?.length > 0 && (
                                          <FallbackInjectorForReadOnlyPages
                                            fieldName="additionalLinkName"
                                            data={link?.name}
                                            languageKey={activeTabKey}>
                                            {(processedData) =>
                                              renderData(processedData, 'para-person-additionalLinks-', {
                                                marginBottom: '0px',
                                              })
                                            }
                                          </FallbackInjectorForReadOnlyPages>
                                        )}

                                        {(link.uri || link.email) && (
                                          <p>
                                            <a
                                              href={link.email ? `mailto:${link.email}` : urlProtocolCheck(link.uri)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="url-links"
                                              data-cy="anchor-person-social-media-links">
                                              {link.uri || link.email}
                                            </a>
                                          </p>
                                        )}
                                      </div>
                                    ))
                                  : renderMissingValueMessage(
                                      personFormFieldNames.ADDITIONAL_LINKS,
                                      t('dashboard.people.readOnly.additionalLinks'),
                                      personData?.additionalLinks,
                                      'div-person-additional-links-missing-message',
                                    )}
                              </Col>
                            )}
                            {checkIfFieldIsToBeDisplayed(personFormFieldNames.IMAGE, mainImageData) && (
                              <div>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.organization.readOnly.image.mainImage')}
                                </p>
                                {!isReadOnlyValueEmpty(mainImageData?.large?.uri) ? (
                                  <ImageUpload
                                    imageUrl={mainImageData?.large?.uri}
                                    imageReadOnly={true}
                                    preview={true}
                                    eventImageData={mainImageData}
                                  />
                                ) : (
                                  renderMissingValueMessage(
                                    personFormFieldNames.IMAGE,
                                    t('dashboard.organization.readOnly.image.mainImage'),
                                    mainImageData,
                                    'div-person-main-image-missing-message',
                                  )
                                )}
                              </div>
                            )}
                            {imageConfig.enableGallery && imageGalleryData?.length > 0 && (
                              <Col span={24}>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.events.addEditEvent.otherInformation.image.additionalImages')}
                                </p>
                                <MultipleImageUpload
                                  imageReadOnly={true}
                                  largeAspectRatio={
                                    currentCalendarData?.imageConfig?.length > 0
                                      ? imageConfig?.large?.aspectRatio
                                      : null
                                  }
                                  thumbnailAspectRatio={
                                    currentCalendarData?.imageConfig?.length > 0
                                      ? imageConfig?.thumbnail?.aspectRatio
                                      : null
                                  }
                                  eventImageData={imageGalleryData}
                                />
                              </Col>
                            )}
                            {checkIfFieldIsToBeDisplayed(personFormFieldNames.VIDEO_URL, personData?.videoUrl?.uri) && (
                              <Col style={{ marginTop: '1rem' }}>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.organization.readOnly.videoLink')}
                                </p>
                                {!isReadOnlyValueEmpty(personData?.videoUrl?.uri) ? (
                                  <p>
                                    <a
                                      href={urlProtocolCheck(personData?.videoUrl?.uri)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="url-links">
                                      {personData?.videoUrl?.uri}
                                    </a>
                                  </p>
                                ) : (
                                  renderMissingValueMessage(
                                    personFormFieldNames.VIDEO_URL,
                                    t('dashboard.organization.readOnly.videoLink'),
                                    personData?.videoUrl?.uri,
                                    'div-person-video-link-missing-message',
                                  )
                                )}
                              </Col>
                            )}
                            {getEmbedUrl(personData?.videoUrl?.uri) !== '' && (
                              <Col span={24}>
                                <iframe
                                  className="iframe-video-embed"
                                  width="100%"
                                  height="315"
                                  src={getEmbedUrl(personData?.videoUrl?.uri)}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowfullscreen></iframe>
                              </Col>
                            )}
                          </Row>
                        </Col>
                        <Col>
                          {mainImageData?.original?.uri && (
                            <div>
                              <img
                                src={mainImageData?.original?.uri}
                                alt="avatar"
                                style={{
                                  width: '151px',
                                  height: '151px',
                                  objectFit: 'contain',
                                }}
                                data-cy="image-person-original"
                              />
                            </div>
                          )}
                        </Col>
                      </Card>

                      {derivedEntitiesDisplayStatus && (
                        <Card marginResponsive="0px">
                          <div className="associated-with-section">
                            <h5 className="associated-with-section-title">
                              {t('dashboard.organization.createNew.addOrganization.associatedEntities.title')}
                            </h5>
                            {derivedEntitiesData?.places?.length > 0 && (
                              <div>
                                <p className="associated-with-title">
                                  {t('dashboard.organization.createNew.addOrganization.associatedEntities.place')}
                                  <div className="associated-with-cards-wrapper">
                                    {derivedEntitiesData?.places?.map((place) => {
                                      <SelectionItem
                                        key={place._id}
                                        name={
                                          Object.keys(place?.name ?? {})?.length > 0
                                            ? contentLanguageBilingual({
                                                data: place?.name,
                                                requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                                                calendarContentLanguage: calendarContentLanguage,
                                              })
                                            : typeof place?.name === 'string' && place?.name
                                        }
                                        icon={<EnvironmentOutlined style={{ color: '#607EFC' }} />}
                                        calendarContentLanguage={calendarContentLanguage}
                                        bordered
                                        onClickHandle={{
                                          navigationFlag: true,
                                          entityType: place?.type ?? taxonomyClass.PLACE,
                                          entityId: place?._id,
                                        }}
                                        itemWidth="100%"
                                      />;
                                    })}
                                  </div>
                                </p>
                              </div>
                            )}
                            {derivedEntitiesData?.organizations?.length > 0 && (
                              <div>
                                <p className="associated-with-title">
                                  {t(
                                    'dashboard.organization.createNew.addOrganization.associatedEntities.organizations',
                                  )}
                                  <div className="associated-with-cards-wrapper">
                                    {derivedEntitiesData?.organizations?.map((org) => {
                                      return (
                                        <SelectionItem
                                          key={org._id}
                                          name={
                                            Object.keys(org?.name ?? {})?.length > 0
                                              ? contentLanguageBilingual({
                                                  data: org?.name,
                                                  requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                                                  calendarContentLanguage: calendarContentLanguage,
                                                })
                                              : typeof org?.name === 'string' && org?.name
                                          }
                                          icon={
                                            <Icon
                                              component={OrganizationLogo}
                                              style={{ color: '#607EFC', fontSize: '18px' }}
                                              data-cy="organization-logo"
                                            />
                                          }
                                          onClickHandle={{
                                            navigationFlag: true,
                                            entityType: org?.type ?? taxonomyClass.ORGANIZATION,
                                            entityId: org?._id,
                                          }}
                                          calendarContentLanguage={calendarContentLanguage}
                                          bordered
                                          itemWidth="100%"
                                        />
                                      );
                                    })}
                                  </div>
                                </p>
                              </div>
                            )}
                            {derivedEntitiesData?.events?.length > 0 && (
                              <div>
                                <p className="associated-with-title">
                                  {t('dashboard.organization.createNew.addOrganization.associatedEntities.events')}
                                  <div className="associated-with-cards-wrapper">
                                    {derivedEntitiesData?.events?.map((event) => {
                                      return (
                                        <SelectionItem
                                          key={event._id}
                                          name={
                                            Object.keys(event?.name ?? {})?.length > 0
                                              ? contentLanguageBilingual({
                                                  data: event?.name,
                                                  requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                                                  calendarContentLanguage: calendarContentLanguage,
                                                })
                                              : typeof event?.name === 'string' && event?.name
                                          }
                                          icon={<CalendarOutlined style={{ color: '#607EFC' }} />}
                                          description={moment(event.startDateTime).format('YYYY-MM-DD')}
                                          bordered
                                          onClickHandle={{
                                            navigationFlag: true,
                                            entityType: event?.type ?? taxonomyClass.EVENT,
                                            entityId: event?._id,
                                          }}
                                          calendarContentLanguage={calendarContentLanguage}
                                          itemWidth="100%"
                                        />
                                      );
                                    })}
                                  </div>
                                </p>
                              </div>
                            )}
                          </div>
                          <></>
                        </Card>
                      )}
                    </Row>
                  </Col>
                </Row>
              </Col>
            </ReadOnlyPageTabLayout>
          </Row>
        </Col>
      </Row>
    </FeatureFlag>
  ) : (
    <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingIndicator />
    </div>
  );
}

export default PersonReadOnly;
