import React, { useEffect, useRef, useState } from 'react';
import './organizationsReadOnly.css';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
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

function OrganizationsReadOnly() {
  const { t } = useTranslation();
  const { organizationId, calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const [currentCalendarData] = useOutletContext();

  const {
    data: organizationData,
    isLoading: organizationLoading,
    isSuccess: organizationSuccess,
    isError: organizationError,
  } = useGetOrganizationQuery(
    { id: organizationId, calendarId, sessionId: timestampRef },
    { skip: organizationId ? false : true },
  );
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.ORGANIZATION,
    includeConcepts: true,
  });

  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery();

  const { user } = useSelector(getUserDetails);

  const [locationPlace, setLocationPlace] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  useEffect(() => {
    if (organizationError) navigate(`${PathName.NotFound}`);
  }, [organizationError]);

  useEffect(() => {
    if (organizationSuccess) {
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
    !taxonomyLoading && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Row gutter={[32, 24]} className="read-only-wrapper">
          <Col span={24}>
            <Breadcrumbs
              name={contentLanguageBilingual({
                en: organizationData?.name?.en,
                fr: organizationData?.name?.fr,
                interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                calendarContentLanguage: calendarContentLanguage,
              })}
            />
          </Col>

          <Col span={24}>
            <Row>
              <Col flex={'780px'}>
                <div className="read-only-event-heading">
                  <h4>
                    {contentLanguageBilingual({
                      en: organizationData?.name?.en,
                      fr: organizationData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p className="read-only-event-content-sub-title-secondary">
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
            <Col span={24}>
              <Row>
                <Col span={16}>
                  <ArtsDataInfo
                    artsDataLink={artsDataLinkChecker(organizationData?.sameAs)}
                    name={contentLanguageBilingual({
                      en: organizationData?.name?.en,
                      fr: organizationData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                    disambiguatingDescription={contentLanguageBilingual({
                      en: organizationData?.disambiguatingDescription?.en,
                      fr: organizationData?.disambiguatingDescription?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  />
                </Col>
              </Row>
            </Col>
          )}

          <Card>
            <Col>
              <Row>
                <Col span={24}>
                  <p className="read-only-event-content" style={{ fontSize: '24px' }}>
                    {t('dashboard.organization.readOnly.details')}
                  </p>
                </Col>
                {(organizationData?.name?.fr || organizationData?.name?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.name')}
                    </p>
                    {organizationData?.name?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{organizationData?.name?.fr}</p>
                      </>
                    )}
                    {organizationData?.name?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{organizationData?.name?.en}</p>
                      </>
                    )}
                  </Col>
                )}
                {(organizationData?.disambiguatingDescription?.en ||
                  organizationData?.disambiguatingDescription?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.disambiguatingDescription')}
                    </p>
                    {organizationData?.disambiguatingDescription?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{organizationData?.disambiguatingDescription?.fr}</p>
                      </>
                    )}
                    {organizationData?.disambiguatingDescription?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{organizationData?.disambiguatingDescription?.en}</p>
                      </>
                    )}
                  </Col>
                )}
                {(organizationData?.description?.fr || organizationData?.description?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.description')}
                    </p>
                    {organizationData?.description?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">
                          <div dangerouslySetInnerHTML={{ __html: organizationData?.description?.fr }} />
                        </p>
                      </>
                    )}
                    {organizationData?.description?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">
                          <div dangerouslySetInnerHTML={{ __html: organizationData?.description?.en }} />
                        </p>
                      </>
                    )}
                  </Col>
                )}
                {organizationData?.url?.uri && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.website')}
                    </p>
                    <p>
                      <a
                        href={organizationData?.url?.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="url-links">
                        {organizationData?.url?.uri}
                      </a>
                    </p>
                  </Col>
                )}

                {organizationData?.contactPoint && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.contact')}
                    </p>
                    {organizationData?.contactPoint?.name?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">
                          {t('dashboard.organization.readOnly.frenchContactTitle')}
                        </p>
                        <p className="read-only-event-content">{organizationData?.contactPoint?.name?.fr}</p>
                      </>
                    )}
                    {organizationData?.contactPoint?.name?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">
                          {t('dashboard.organization.readOnly.englishContactTitle')}
                        </p>
                        <p className="read-only-event-content">{organizationData?.contactPoint?.name?.en}</p>
                      </>
                    )}
                    {organizationData?.contactPoint?.url?.uri && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">
                          {t('dashboard.organization.readOnly.website')}
                        </p>
                        <p>
                          <a
                            href={organizationData?.contactPoint?.url?.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="url-links">
                            {organizationData?.contactPoint?.url?.uri}
                          </a>
                        </p>
                      </>
                    )}
                    {organizationData?.contactPoint?.telephone && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">
                          {t('dashboard.organization.readOnly.phoneNumber')}
                        </p>
                        <p className="url-links">{organizationData?.contactPoint?.telephone}</p>
                      </>
                    )}
                    {organizationData?.contactPoint?.email && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">
                          {t('dashboard.organization.readOnly.email')}
                        </p>
                        <p className="url-links">{organizationData?.contactPoint?.email}</p>
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
                              <p className="read-only-event-content-sub-title-primary">
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
                                  return <Tags>{label}</Tags>;
                                }}
                              />
                            </div>
                          );
                      }
                    })}
                  </Col>
                )}
                {locationPlace && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
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
            <Col>
              {organizationData?.logo?.original?.uri && (
                <div style={{ marginTop: '-35%' }}>
                  <img
                    src={organizationData?.logo?.original?.uri}
                    alt="avatar"
                    style={{
                      objectFit: 'cover',
                      width: '151px',
                      height: '151px',
                    }}
                  />
                </div>
              )}
            </Col>
          </Card>
        </Row>
      </FeatureFlag>
    )
  );
}

export default OrganizationsReadOnly;
