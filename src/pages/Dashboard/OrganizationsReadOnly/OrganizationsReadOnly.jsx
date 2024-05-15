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
import { useSelector } from 'react-redux';
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

  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.ORGANIZATION,
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

  const [locationPlace, setLocationPlace] = useState();
  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const [derivedEntitiesData, setDerivedEntitiesData] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

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
            getAllTaxonomy({
              calendarId,
              search: '',
              taxonomyClass: taxonomyClass.PLACE,
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
                    en: organizationData?.name?.en,
                    fr: organizationData?.name?.fr,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
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
                      en: organizationData?.name?.en,
                      fr: organizationData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p className="read-only-event-content-sub-title-primary" data-cy="para-organization-para">
                    {contentLanguageBilingual({
                      en: organizationData?.disambiguatingDescription?.en,
                      fr: organizationData?.disambiguatingDescription?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
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
                      en: artsData?.name?.en,
                      fr: artsData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                    disambiguatingDescription={contentLanguageBilingual({
                      en: artsData?.disambiguatingDescription?.en,
                      fr: artsData?.disambiguatingDescription?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  />
                </Col>
              </Row>
            </Col>
          )}

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
                {(organizationData?.name?.fr || organizationData?.name?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-organization-name">
                      {t('dashboard.organization.readOnly.name')}
                    </p>
                    {organizationData?.name?.fr && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-organization-name-tab-french">
                          {t('common.tabFrench')}
                        </p>
                        <p className="read-only-event-content" data-cy="para-organization-name-french">
                          {organizationData?.name?.fr}
                        </p>
                      </>
                    )}
                    {organizationData?.name?.en && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-organization-name-tab-english">
                          {t('common.tabEnglish')}
                        </p>
                        <p className="read-only-event-content" data-cy="para-organization-name-english">
                          {organizationData?.name?.en}
                        </p>
                      </>
                    )}
                  </Col>
                )}
                {(organizationData?.disambiguatingDescription?.en ||
                  organizationData?.disambiguatingDescription?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-disambiguating-desc">
                      {t('dashboard.organization.readOnly.disambiguatingDescription')}
                    </p>
                    {organizationData?.disambiguatingDescription?.fr && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-disambiguating-desc-tab-french">
                          {t('common.tabFrench')}
                        </p>
                        <p className="read-only-event-content" data-cy="para-disambiguating-desc-french">
                          {organizationData?.disambiguatingDescription?.fr}
                        </p>
                      </>
                    )}
                    {organizationData?.disambiguatingDescription?.en && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-disambiguating-desc-tab-english">
                          {t('common.tabEnglish')}
                        </p>
                        <p className="read-only-event-content" data-cy="para-disambiguating-desc-english">
                          {organizationData?.disambiguatingDescription?.en}
                        </p>
                      </>
                    )}
                  </Col>
                )}
                {(organizationData?.description?.fr || organizationData?.description?.en) && (
                  <Col span={24}>
                    <p
                      className="read-only-event-content-sub-title-primary"
                      data-cy="para-organization-description-title">
                      {t('dashboard.organization.readOnly.description')}
                    </p>
                    {organizationData?.description?.fr && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-organization-description-tab-french">
                          {t('common.tabFrench')}
                        </p>
                        <p className="read-only-event-content">
                          <div
                            dangerouslySetInnerHTML={{ __html: organizationData?.description?.fr }}
                            data-cy="div-organization-description-french"
                          />
                        </p>
                      </>
                    )}
                    {organizationData?.description?.en && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-organization-description-tab-english">
                          {t('common.tabEnglish')}
                        </p>
                        <p className="read-only-event-content">
                          <div
                            dangerouslySetInnerHTML={{ __html: organizationData?.description?.en }}
                            data-cy="div-organization-description-english"
                          />
                        </p>
                      </>
                    )}
                  </Col>
                )}
                {organizationData?.url?.uri && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-organization-website-title">
                      {t('dashboard.organization.readOnly.website')}
                    </p>
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
                  </Col>
                )}
                {organizationData?.socialMediaLinks?.length > 0 && (
                  <Col span={24}>
                    <p
                      className="read-only-event-content-sub-title-primary"
                      data-cy="para-organization-social-media-title">
                      {t('dashboard.organization.readOnly.socialMediaLinks')}
                    </p>
                    {organizationData?.socialMediaLinks?.map((link, index) => (
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
                {organizationData?.contactPoint && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-organization-contact-title">
                      {t('dashboard.organization.readOnly.contact')}
                    </p>
                    {organizationData?.contactPoint?.name?.fr && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-organization-contact-title-french">
                          {t('dashboard.organization.readOnly.frenchContactTitle')}
                        </p>
                        <p className="read-only-event-content" data-cy="para-organization-contact-french">
                          {organizationData?.contactPoint?.name?.fr}
                        </p>
                      </>
                    )}
                    {organizationData?.contactPoint?.name?.en && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-organization-contact-title-english">
                          {t('dashboard.organization.readOnly.englishContactTitle')}
                        </p>
                        <p className="read-only-event-content" data-cy="para-organization-contact-english">
                          {organizationData?.contactPoint?.name?.en}
                        </p>
                      </>
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
                        if (initialTaxonomy?.includes(taxonomy?.id) && initialValues?.length > 0)
                          return (
                            <div>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy={`para-organization-dynamic-taxonomy-name-${index}`}>
                                {bilingual({
                                  en: taxonomy?.name?.en,
                                  fr: taxonomy?.name?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                              </p>
                              <TreeSelectOption
                                key={index}
                                style={{ marginBottom: '1rem' }}
                                bordered={false}
                                open={false}
                                disabled
                                defaultValue={initialValues}
                                treeData={treeDynamicTaxonomyOptions(taxonomy?.concept, user, calendarContentLanguage)}
                                tagRender={(props) => {
                                  const { label } = props;
                                  return <Tags data-cy={`tag-organization-dynamic-field-${label}`}>{label}</Tags>;
                                }}
                                data-cy="treeselect-organization-dynamic-field"
                              />
                            </div>
                          );
                      }
                    })}
                  </Col>
                )}
                {locationPlace && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-organization-place-title">
                      {t('dashboard.organization.readOnly.location')}
                    </p>
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
                    />
                  </Col>
                )}
              </Row>
            </Col>
            <Col className="top-level-column">
              {organizationData?.logo?.original?.uri && (
                <div>
                  <img
                    src={organizationData?.logo?.original?.uri}
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
                              place?.name?.en || place?.name?.fr
                                ? contentLanguageBilingual({
                                    en: place?.name?.en,
                                    fr: place?.name?.fr,
                                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                    calendarContentLanguage: calendarContentLanguage,
                                  })
                                : typeof place?.name === 'string' && place?.name
                            }
                            icon={<EnvironmentOutlined style={{ color: '#607EFC' }} />}
                            bordered
                            itemWidth="100%"
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
                              person?.name?.en || person?.name?.fr
                                ? contentLanguageBilingual({
                                    en: person?.name?.en,
                                    fr: person?.name?.fr,
                                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                    calendarContentLanguage: calendarContentLanguage,
                                  })
                                : typeof person?.name === 'string' && person?.name
                            }
                            icon={<UserOutlined style={{ color: '#607EFC' }} />}
                            bordered
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
                                event?.name?.en || event?.name?.fr
                                  ? contentLanguageBilingual({
                                      en: event?.name?.en,
                                      fr: event?.name?.fr,
                                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                      calendarContentLanguage: calendarContentLanguage,
                                    })
                                  : typeof event?.name === 'string' && event?.name
                              }
                              icon={<CalendarOutlined style={{ color: '#607EFC' }} />}
                              description={moment(event.startDateTime).format('YYYY-MM-DD')}
                              bordered
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
      </FeatureFlag>
    )
  );
}

export default OrganizationsReadOnly;
