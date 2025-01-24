import React, { useEffect, useRef, useState } from 'react';
import './organizationsReadOnly.css';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import OutlinedButton from '../../../components/Button/Outlined';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useGetOrganizationQuery } from '../../../services/organization';
import { PathName } from '../../../constants/pathName';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useLazyGetPlaceQuery } from '../../../services/places';
import SelectionItem from '../../../components/List/SelectionItem/SelectionItem';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery, useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { placesOptions } from '../../../components/Select/selectOption.settings';
import { treeDynamicTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import Tags from '../../../components/Tags/Common/Tags';
import TreeSelectOption from '../../../components/TreeSelectOption/TreeSelectOption';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import Breadcrumbs from '../../../components/Breadcrumbs';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import { loadArtsDataEntity } from '../../../services/artsData';
import { getExternalSourceId } from '../../../utils/getExternalSourceId';
import { CalendarOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useLazyGetEntityDependencyDetailsQuery } from '../../../services/entities';
import MultipleImageUpload from '../../../components/MultipleImageUpload';
import { getActiveTabKey } from '../../../redux/reducer/readOnlyTabSlice';
import ReadOnlyPageTabLayout from '../../../layout/ReadOnlyPageTabLayout/ReadOnlyPageTabLayout';
import { isDataValid } from '../../../utils/MultiLingualFormItemSupportFunctions';
import { organizationFormFieldNames } from '../../../constants/personAndOrganizationFormFieldNames';
import ImageUpload from '../../../components/ImageUpload';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import FallbackInjectorForReadOnlyPages from '../../../components/FallbackInjectorForReadOnlyPages/FallbackInjectorForReadOnlyPages';
import { clearActiveFallbackFieldsInfo } from '../../../redux/reducer/languageLiteralSlice';

function OrganizationsReadOnly() {
  const { t } = useTranslation();
  const { organizationId, calendarId } = useParams();
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

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.ORGANIZATION);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
  });

  const {
    data: organizationData,
    isLoading: organizationLoading,
    isSuccess: organizationSuccess,
    isError: organizationError,
  } = useGetOrganizationQuery(
    { id: organizationId, calendarId, sessionId: timestampRef },
    { skip: organizationId ? false : true },
  );

  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery();
  const [getDerivedEntities, { isFetching: isEntityDetailsLoading }] = useLazyGetEntityDependencyDetailsQuery({
    sessionId: timestampRef,
  });
  const { user } = useSelector(getUserDetails);
  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  const activeTabKey = useSelector(getActiveTabKey);
  const dispatch = useDispatch();

  const [locationPlace, setLocationPlace] = useState();
  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const [derivedEntitiesData, setDerivedEntitiesData] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];
  const imageGalleryData = organizationData?.image?.filter((image) => image && !image?.isMain) || [];
  const mainImageData = organizationData?.image?.find((image) => image?.isMain) || null;

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
    if (organizationError) navigate(`${PathName.NotFound}`);
  }, [organizationError]);

  useEffect(() => {
    if (organizationId) {
      getDerivedEntities({ id: organizationId, calendarId }).then((response) => {
        if (
          response?.data?.events?.length > 0 ||
          response?.data?.people?.length > 0 ||
          response?.data?.places?.length > 0
        ) {
          setDerivedEntitiesData(response?.data);
          setDerivedEntitiesDisplayStatus(true);
        }
      });
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationSuccess) {
      if (organizationData?.sameAs?.length > 0) {
        let sourceId = artsDataLinkChecker(organizationData?.sameAs);
        sourceId = getExternalSourceId(sourceId);
        getArtsData(sourceId);
      }
      if (organizationData?.place?.entityId) {
        let initialPlace = [];
        let initialPlaceAccessibiltiy = [];
        getPlace({ placeId: organizationData?.place?.entityId, calendarId })
          .unwrap()
          .then((response) => {
            initialPlace = [response];
            initialPlace[0] = {
              ...initialPlace[0],
              ['openingHours']: initialPlace[0]?.openingHours?.uri,
            };
            let taxonomyClassQuery = new URLSearchParams();
            taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PLACE);
            getAllTaxonomy({
              calendarId,
              search: '',
              taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
              includeConcepts: true,
            })
              .unwrap()
              .then((res) => {
                res?.data?.forEach((taxonomy) => {
                  if (taxonomy?.mappedToField === 'PlaceAccessibility') {
                    response?.accessibility?.forEach((accessibility) => {
                      taxonomy?.concept?.forEach((concept) => {
                        if (concept?.id == accessibility?.entityId) {
                          initialPlaceAccessibiltiy = initialPlaceAccessibiltiy?.concat([concept]);
                        }
                      });
                    });
                  }
                });
                initialPlace[0] = {
                  ...initialPlace[0],
                  ['accessibility']: initialPlaceAccessibiltiy,
                };
                setLocationPlace(placesOptions(initialPlace, user, calendarContentLanguage)[0]);
              })
              .catch((error) => console.log(error));
          });
      }
    }
  }, [organizationSuccess]);

  return (
    organizationSuccess &&
    !organizationLoading &&
    !isEntityDetailsLoading &&
    !taxonomyLoading &&
    !artsDataLoading && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Row gutter={[32, 24]} className="read-only-wrapper organization-read-only">
          <Col span={24} className="top-level-column">
            <Row>
              <Col flex="auto">
                <Breadcrumbs
                  name={contentLanguageBilingual({
                    data: organizationData?.name,
                    requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                    calendarContentLanguage: calendarContentLanguage,
                  })}
                />
              </Col>
              <Col flex="60px" style={{ marginLeft: 'auto' }}>
                <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
                  <ReadOnlyProtectedComponent
                    creator={organizationData.createdByUserId}
                    entityId={organizationData?.id}
                    isReadOnly={isReadOnly}>
                    <div className="button-container">
                      <OutlinedButton
                        data-cy="button-edit-organization"
                        label={t('dashboard.organization.readOnly.edit')}
                        size="middle"
                        style={{ height: '40px', width: '60px' }}
                        onClick={() =>
                          navigate(
                            `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.AddOrganization}?id=${organizationData?.id}`,
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
              <Col flex={'780px'}>
                <div className="read-only-event-heading">
                  <h4 data-cy="heading-organization-name">
                    {contentLanguageBilingual({
                      data: organizationData?.name,
                      requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p className="read-only-event-content-sub-title-primary" data-cy="para-organization-para">
                    {contentLanguageBilingual({
                      data: organizationData?.disambiguatingDescription,
                      requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
          {artsDataLinkChecker(organizationData?.sameAs) && (
            <Col flex={'780px'} className="artsdata-link-wrapper top-level-column">
              <Row>
                <Col flex={'780px'}>
                  <ArtsDataInfo
                    artsDataLink={artsDataLinkChecker(organizationData?.sameAs)}
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
                    <Card marginResponsive="0px">
                      <Col className="top-level-column">
                        <Row>
                          <Col span={24}>
                            <p
                              className="read-only-event-content"
                              style={{ fontSize: '24px' }}
                              data-cy="para-organization-details-title">
                              {t('dashboard.organization.readOnly.details')}
                            </p>
                          </Col>
                          {checkIfFieldIsToBeDisplayed(organizationFormFieldNames.NAME, organizationData?.name) && (
                            <Col span={24}>
                              <p className="read-only-event-content-sub-title-primary" data-cy="para-organization-name">
                                {t('dashboard.organization.readOnly.name')}
                              </p>
                              {Object.keys(organizationData?.name ?? {})?.length > 0 && (
                                <FallbackInjectorForReadOnlyPages fieldName="name" data={organizationData?.name}>
                                  <p className="read-only-event-content" data-cy="para-organization-name-french">
                                    {contentLanguageBilingual({
                                      data: organizationData?.name,
                                      calendarContentLanguage,
                                      requiredLanguageKey: activeTabKey,
                                    })}
                                  </p>
                                </FallbackInjectorForReadOnlyPages>
                              )}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(
                            organizationFormFieldNames.DISAMBIGUATING_DESCRIPTION,
                            organizationData?.disambiguatingDescription,
                          ) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-disambiguating-desc">
                                {t('dashboard.organization.readOnly.disambiguatingDescription')}
                              </p>
                              {Object.keys(organizationData?.disambiguatingDescription ?? {})?.length > 0 && (
                                <FallbackInjectorForReadOnlyPages
                                  fieldName="disambiguatingDescription"
                                  data={organizationData?.disambiguatingDescription}>
                                  <p className="read-only-event-content" data-cy="para-disambiguating-desc-french">
                                    {contentLanguageBilingual({
                                      data: organizationData?.disambiguatingDescription,
                                      calendarContentLanguage,
                                      requiredLanguageKey: activeTabKey,
                                    })}
                                  </p>
                                </FallbackInjectorForReadOnlyPages>
                              )}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(
                            organizationFormFieldNames.DESCRIPTION,
                            organizationData?.description,
                          ) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-organization-description-title">
                                {t('dashboard.organization.readOnly.description')}
                              </p>
                              {Object.keys(organizationData?.description ?? {})?.length > 0 && (
                                <FallbackInjectorForReadOnlyPages
                                  fieldName="description"
                                  data={organizationData?.description}>
                                  <p className="read-only-event-content">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: contentLanguageBilingual({
                                          data: organizationData?.description,
                                          calendarContentLanguage,
                                          requiredLanguageKey: activeTabKey,
                                        }),
                                      }}
                                      data-cy="div-organization-description-french"
                                    />
                                  </p>
                                </FallbackInjectorForReadOnlyPages>
                              )}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(organizationFormFieldNames.WEBSITE, organizationData?.url) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-organization-website-title">
                                {t('dashboard.organization.readOnly.website')}
                              </p>
                              {organizationData?.url?.uri && (
                                <p>
                                  <a
                                    href={organizationData?.url?.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="url-links"
                                    data-cy="anchor-organization-website">
                                    {organizationData?.url?.uri}
                                  </a>
                                </p>
                              )}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(
                            organizationFormFieldNames.SOCIAL_MEDIA,
                            organizationData?.socialMediaLinks,
                          ) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-organization-social-media-title">
                                {t('dashboard.organization.readOnly.socialMediaLinks')}
                              </p>
                              {organizationData?.socialMediaLinks?.length > 0 &&
                                organizationData?.socialMediaLinks?.map((link, index) => (
                                  <p key={index}>
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="url-links"
                                      data-cy={`anchor-organization-social-media-${index}`}>
                                      {link}
                                    </a>
                                  </p>
                                ))}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(organizationFormFieldNames.LOGO, organizationData?.logo) &&
                            organizationData?.logo?.large?.uri && (
                              <div>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.organization.readOnly.logo')}
                                </p>
                                <ImageUpload
                                  imageUrl={organizationData?.logo?.large?.uri}
                                  imageReadOnly={true}
                                  preview={true}
                                  eventImageData={organizationData?.logo?.large}
                                />
                              </div>
                            )}
                          {checkIfFieldIsToBeDisplayed(
                            organizationFormFieldNames.IMAGE,
                            organizationData?.image?.find((image) => image?.isMain),
                          ) &&
                            organizationData?.image?.find((image) => image?.isMain)?.large?.uri && (
                              <div>
                                <p className="read-only-event-content-sub-title-primary">
                                  {t('dashboard.organization.readOnly.image.mainImage')}
                                </p>
                                <ImageUpload
                                  imageUrl={organizationData?.image?.find((image) => image?.isMain)?.large?.uri}
                                  imageReadOnly={true}
                                  preview={true}
                                  eventImageData={organizationData?.image?.find((image) => image?.isMain)?.large}
                                />
                              </div>
                            )}
                          {checkIfFieldIsToBeDisplayed(
                            organizationFormFieldNames.IMAGE,
                            imageConfig.enableGallery ? imageGalleryData : [],
                          ) && (
                            <div>
                              <p className="read-only-event-content-sub-title-primary">
                                {t('dashboard.events.addEditEvent.otherInformation.image.additionalImages')}
                              </p>
                              {imageGalleryData?.length > 0 && imageConfig.enableGallery && (
                                <>
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
                                </>
                              )}
                            </div>
                          )}
                          {checkIfFieldIsToBeDisplayed(
                            organizationFormFieldNames.CONTACT_TITLE,
                            organizationData?.contactPoint,
                          ) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-organization-contact-title">
                                {t('dashboard.organization.readOnly.contact')}
                              </p>
                              {Object.keys(organizationData?.contactPoint ?? {})?.length > 0 && (
                                <FallbackInjectorForReadOnlyPages
                                  fieldName="contactPoint"
                                  data={organizationData?.contactPoint}>
                                  <p className="read-only-event-content" data-cy="para-organization-contact-french">
                                    {contentLanguageBilingual({
                                      data: organizationData?.contactPoint?.name,
                                      calendarContentLanguage,
                                      requiredLanguageKey: activeTabKey,
                                    })}
                                  </p>
                                </FallbackInjectorForReadOnlyPages>
                              )}
                              {organizationData?.contactPoint?.url?.uri && (
                                <>
                                  <p
                                    className="read-only-event-content-sub-title-secondary"
                                    data-cy="para-organization-contact-website-title">
                                    {t('dashboard.organization.readOnly.website')}
                                  </p>
                                  <p>
                                    <a
                                      href={organizationData?.contactPoint?.url?.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="url-links"
                                      data-cy="anchor-organization-contact-website">
                                      {organizationData?.contactPoint?.url?.uri}
                                    </a>
                                  </p>
                                </>
                              )}
                              {organizationData?.contactPoint?.telephone && (
                                <>
                                  <p
                                    className="read-only-event-content-sub-title-secondary"
                                    data-cy="para-organization-contact-telephone-title">
                                    {t('dashboard.organization.readOnly.phoneNumber')}
                                  </p>
                                  <p className="url-links" data-cy="para-organization-contact-telephone">
                                    {organizationData?.contactPoint?.telephone}
                                  </p>
                                </>
                              )}
                              {organizationData?.contactPoint?.email && (
                                <>
                                  <p
                                    className="read-only-event-content-sub-title-secondary"
                                    data-cy="para-organization-contact-email-title">
                                    {t('dashboard.organization.readOnly.email')}
                                  </p>
                                  <p className="url-links" data-cy="para-organization-contact-email">
                                    {organizationData?.contactPoint?.email}
                                  </p>
                                </>
                              )}
                            </Col>
                          )}
                          {organizationData?.dynamicFields?.length > 0 && (
                            <Col span={24}>
                              {allTaxonomyData?.data?.map((taxonomy, index) => {
                                if (taxonomy?.isDynamicField) {
                                  let initialValues,
                                    initialTaxonomy = [];
                                  organizationData?.dynamicFields?.forEach((dynamicField) => {
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
                                        <p
                                          className="read-only-event-content-sub-title-primary"
                                          data-cy={`para-organization-dynamic-taxonomy-name-${index}`}>
                                          {bilingual({
                                            data: taxonomy?.name,
                                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                          })}
                                        </p>
                                        {initialTaxonomy?.includes(taxonomy?.id) && initialValues?.length > 0 && (
                                          <TreeSelectOption
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
                                                <Tags data-cy={`tag-organization-dynamic-field-${label}`}>{label}</Tags>
                                              );
                                            }}
                                            data-cy="treeselect-organization-dynamic-field"
                                          />
                                        )}
                                      </div>
                                    );
                                }
                              })}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(organizationFormFieldNames.LOCATION, locationPlace) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-organization-place-title">
                                {t('dashboard.organization.readOnly.location')}
                              </p>
                              {locationPlace && (
                                <SelectionItem
                                  icon={locationPlace?.label?.props?.icon}
                                  name={locationPlace?.name}
                                  description={locationPlace?.description}
                                  itemWidth="423px"
                                  postalAddress={locationPlace?.postalAddress}
                                  accessibility={locationPlace?.accessibility}
                                  openingHours={locationPlace?.openingHours}
                                  calendarContentLanguage={calendarContentLanguage}
                                  bordered
                                  onClickHandle={{
                                    navigationFlag: true,
                                    entityType: locationPlace?.type ?? taxonomyClass.PLACE,
                                    entityId: locationPlace?.value,
                                  }}
                                />
                              )}
                            </Col>
                          )}
                        </Row>
                      </Col>
                      <Col className="top-level-column">
                        {(organizationData?.logo?.original?.uri || mainImageData?.original?.uri) && (
                          <div>
                            <img
                              src={organizationData?.logo?.original?.uri ?? mainImageData?.original?.uri}
                              alt="avatar"
                              style={{
                                objectFit: 'contain',
                                width: '151px',
                                height: '151px',
                              }}
                              data-cy="image-organization-logo"
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
                                      itemWidth="100%"
                                      onClickHandle={{
                                        navigationFlag: true,
                                        entityType: place?.type ?? taxonomyClass.PLACE,
                                        entityId: place?._id,
                                      }}
                                    />;
                                  })}
                                </div>
                              </p>
                            </div>
                          )}
                          {derivedEntitiesData?.people?.length > 0 && (
                            <div>
                              <p className="associated-with-title">
                                {t('dashboard.organization.createNew.addOrganization.associatedEntities.people')}
                                <div className="associated-with-cards-wrapper">
                                  {derivedEntitiesData?.people?.map((person) => {
                                    <SelectionItem
                                      key={person._id}
                                      name={
                                        Object.keys(person?.name ?? {})?.length > 0
                                          ? contentLanguageBilingual({
                                              data: person?.name,
                                              requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                                              calendarContentLanguage: calendarContentLanguage,
                                            })
                                          : typeof person?.name === 'string' && person?.name
                                      }
                                      icon={<UserOutlined style={{ color: '#607EFC' }} />}
                                      calendarContentLanguage={calendarContentLanguage}
                                      bordered
                                      onClickHandle={{
                                        navigationFlag: true,
                                        entityType: person?.type ?? taxonomyClass.PERSON,
                                        entityId: person?._id,
                                      }}
                                      itemWidth="100%"
                                    />;
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
                                        calendarContentLanguage={calendarContentLanguage}
                                        bordered
                                        onClickHandle={{
                                          navigationFlag: true,
                                          entityType: event?.type ?? taxonomyClass.EVENT,
                                          entityId: event?._id,
                                        }}
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
              </ReadOnlyPageTabLayout>
            </Row>
          </Col>
        </Row>
      </FeatureFlag>
    )
  );
}

export default OrganizationsReadOnly;
