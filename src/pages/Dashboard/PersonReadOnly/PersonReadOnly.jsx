import React, { useEffect, useRef, useState } from 'react';
import './personReadOnly.css';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { ReactComponent as OrganizationLogo } from '../../../assets/icons/organization-light.svg';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import {
  treeDynamicTaxonomyOptions,
  treeTaxonomyOptions,
} from '../../../components/TreeSelectOption/treeSelectOption.settings';
import OutlinedButton from '../../../components/Button/Outlined';
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
// import { getExternalSourceId } from '../../../utils/getExternalSourceId';
import Icon, { EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
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

function PersonReadOnly() {
  const { t } = useTranslation();
  const { personId, calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  setContentBackgroundColor('#F9FAFF');

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

  const mainImageData = personData?.image?.find((image) => image?.isMain) || null;
  const imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];
  const imageGalleryData = personData?.image?.filter((image) => image && !image?.isMain) || [];

  const formConstants = currentCalendarData?.forms?.filter((form) => form?.formName === 'Organization')[0];
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

  const checkIfFieldIsToBeDisplayed = (field, data, type = 'standard', adminOnly = false) => {
    if (typeof data === 'string' && data !== '') return true;
    if (adminOnly && !adminCheckHandler({ calendar, user })) return false;

    if (Array.isArray(data) && data.length > 0 && data.every((item) => item !== null && item !== undefined))
      return true;
    if (data !== null && isDataValid(data)) return true;

    if (type === 'standard') {
      return mandatoryStandardFields.includes(field);
    } else {
      return mandatoryDynamicFields.includes(field);
    }
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
        // sourceId = getExternalSourceId(sourceId);
        getArtsData(sourceId);
      }
    }
  }, [personLoading]);

  return (
    personSuccess &&
    !personLoading &&
    !isEntityDetailsLoading &&
    !taxonomyLoading &&
    !artsDataLoading && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Row gutter={[32, 24]} className="read-only-wrapper person-read-only-wrapper" style={{ margin: 0 }}>
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
                </Col>
              </Row>
            </Col>
          )}
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
                                    {t('dashboard.people.readOnly.name')}
                                  </p>
                                  {Object.keys(personData?.name ?? {})?.length > 0 && (
                                    <FallbackInjectorForReadOnlyPages
                                      fieldName="name"
                                      data={personData?.name}
                                      languageKey={activeTabKey}>
                                      {(processedData) => renderData(processedData, 'para-person-name-french')}
                                    </FallbackInjectorForReadOnlyPages>
                                  )}
                                </Col>
                              )}
                              {checkIfFieldIsToBeDisplayed(personFormFieldNames.OCCUPATION, personData?.occupation) && (
                                <div>
                                  <p
                                    className="read-only-event-content-sub-title-primary"
                                    data-cy="para-person-occupation-title">
                                    {taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false)}
                                  </p>
                                  {personData?.occupation?.length > 0 && (
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
                                  )}
                                </div>
                              )}
                              {personData?.dynamicFields?.length > 0 && (
                                <Col span={24}>
                                  {allTaxonomyData?.data?.map((taxonomy, index) => {
                                    if (taxonomy?.isDynamicField) {
                                      let initialValues,
                                        initialTaxonomy = [];
                                      personData?.dynamicFields?.forEach((dynamicField) => {
                                        if (taxonomy?.id === dynamicField?.taxonomyId) {
                                          initialValues = dynamicField?.conceptIds;
                                          initialTaxonomy.push(taxonomy?.id);
                                        }
                                      });
                                      if (
                                        checkIfFieldIsToBeDisplayed(
                                          taxonomy?.id,
                                          initialTaxonomy?.includes(taxonomy?.id) ? taxonomy : undefined,
                                          'dynamic',
                                          taxonomy?.isAdminOnly,
                                        )
                                      )
                                        return (
                                          <div>
                                            <p className="read-only-event-content-sub-title-primary">
                                              {bilingual({
                                                data: taxonomy?.name,
                                                interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                              })}
                                            </p>
                                            {initialTaxonomy?.includes(taxonomy?.id) && initialValues?.length > 0 && (
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
                                                  return (
                                                    <Tags data-cy={`tag-person-dynamic-field-${label}`}>{label}</Tags>
                                                  );
                                                }}
                                              />
                                            )}
                                          </div>
                                        );
                                    }
                                  })}
                                </Col>
                              )}
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
                                  {Object.keys(personData?.disambiguatingDescription ?? {})?.length > 0 && (
                                    <FallbackInjectorForReadOnlyPages
                                      fieldName="disambiguatingDescription"
                                      data={personData?.disambiguatingDescription}
                                      languageKey={activeTabKey}>
                                      {(processedData) =>
                                        renderData(processedData, 'para-person-disambiguating-description-french')
                                      }
                                    </FallbackInjectorForReadOnlyPages>
                                  )}
                                </Col>
                              )}

                              {checkIfFieldIsToBeDisplayed(
                                personFormFieldNames.DESCRIPTION,
                                personData?.description,
                              ) && (
                                <Col span={24}>
                                  <p
                                    className="read-only-event-content-sub-title-primary"
                                    data-cy="para-person-description-title">
                                    {t('dashboard.people.readOnly.description')}
                                  </p>
                                  {Object.keys(personData?.description ?? {})?.length > 0 && (
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
                                  {personData?.url?.uri && (
                                    <p>
                                      <a
                                        href={personData?.url?.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="url-links"
                                        data-cy="anchor-person-website">
                                        {personData?.url?.uri}
                                      </a>
                                    </p>
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
                                  {personData?.socialMediaLinks?.length > 0 &&
                                    personData?.socialMediaLinks?.map((link, index) => (
                                      <p key={index}>
                                        <a
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="url-links"
                                          data-cy="anchor-person-social-media-links">
                                          {link}
                                        </a>
                                      </p>
                                    ))}
                                </Col>
                              )}
                              {checkIfFieldIsToBeDisplayed(personFormFieldNames.IMAGE, mainImageData) &&
                                mainImageData?.large?.uri && (
                                  <div>
                                    <p className="read-only-event-content-sub-title-primary">
                                      {t('dashboard.organization.readOnly.image.mainImage')}
                                    </p>
                                    <ImageUpload
                                      imageUrl={mainImageData?.large?.uri}
                                      imageReadOnly={true}
                                      preview={true}
                                      eventImageData={mainImageData}
                                    />
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
                              {checkIfFieldIsToBeDisplayed(
                                personFormFieldNames.VIDEO_URL,
                                personData?.videoUrl?.uri,
                              ) && (
                                <Col style={{ marginTop: '1rem' }}>
                                  <p className="read-only-event-content-sub-title-primary">
                                    {t('dashboard.organization.readOnly.videoLink')}
                                  </p>
                                  {personData?.videoUrl?.uri && (
                                    <p>
                                      <a
                                        href={personData?.videoUrl?.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="url-links">
                                        {personData?.videoUrl?.uri}
                                      </a>
                                    </p>
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
    )
  );
}

export default PersonReadOnly;
