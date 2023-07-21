import React, { useEffect, useRef, useState } from 'react';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery, useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import {
  treeDynamicTaxonomyOptions,
  treeTaxonomyOptions,
} from '../../../components/TreeSelectOption/treeSelectOption.settings';
import Tags from '../../../components/Tags/Common/Tags';
import TreeSelectOption from '../../../components/TreeSelectOption/TreeSelectOption';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import { useGetPlaceQuery, useLazyGetPlaceQuery } from '../../../services/places';
import ArtsDataLink from '../../../components/Tags/ArtsDataLink/ArtsDataLink';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import SelectionItem from '../../../components/List/SelectionItem/SelectionItem';
import { placesOptions } from '../../../components/Select/selectOption.settings';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';

function PlaceReadOnly() {
  const { t } = useTranslation();
  const { placeId, calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const [currentCalendarData] = useOutletContext();

  const {
    data: placeData,
    isLoading: placeLoading,
    isSuccess: placeSuccess,
    isError: placeError,
  } = useGetPlaceQuery({ placeId, calendarId, sessionId: timestampRef }, { skip: placeId ? false : true });
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PLACE,
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery();

  const { user } = useSelector(getUserDetails);

  const [locationPlace, setLocationPlace] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  useEffect(() => {
    if (placeError) navigate(`${PathName.NotFound}`);
  }, [placeError]);

  useEffect(() => {
    if (placeSuccess) {
      if (placeData?.containedInPlace?.entityId) {
        let initialPlace = [];
        let initialPlaceAccessibiltiy = [];
        getPlace({ placeId: placeData?.containedInPlace?.entityId, calendarId })
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
  }, [placeSuccess]);

  return (
    placeSuccess &&
    !placeLoading &&
    !taxonomyLoading && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Row gutter={[32, 24]} className="read-only-wrapper">
          <Col span={24}>
            <Breadcrumbs
              name={contentLanguageBilingual({
                en: placeData?.name?.en,
                fr: placeData?.name?.fr,
                interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                calendarContentLanguage: calendarContentLanguage,
              })}
            />
          </Col>

          <Col span={24}>
            <Row>
              <Col>
                <div className="read-only-event-heading">
                  <h4>
                    {contentLanguageBilingual({
                      en: placeData?.name?.en,
                      fr: placeData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p className="read-only-event-content-sub-title-secondary">
                    {contentLanguageBilingual({
                      en: placeData?.disambiguatingDescription?.en,
                      fr: placeData?.disambiguatingDescription?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
          {artsDataLinkChecker(placeData?.sameAs) && (
            <Col span={24}>
              <Row>
                <Col>
                  <ArtsDataInfo
                    artsDataLink={artsDataLinkChecker(placeData?.sameAs)}
                    name={contentLanguageBilingual({
                      en: placeData?.name?.en,
                      fr: placeData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                    disambiguatingDescription={contentLanguageBilingual({
                      en: placeData?.disambiguatingDescription?.en,
                      fr: placeData?.disambiguatingDescription?.fr,
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
              <Row gutter={[0, 24]}>
                {(placeData?.name?.fr || placeData?.name?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.placeName')}
                    </p>
                    {placeData?.name?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{placeData?.name?.fr}</p>
                      </>
                    )}
                    {placeData?.name?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{placeData?.name?.en}</p>
                      </>
                    )}
                  </Col>
                )}
                {placeData?.additionalType.length > 0 && (
                  <div>
                    <p className="read-only-event-content-sub-title-primary">
                      {taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false)}
                    </p>
                    <TreeSelectOption
                      style={{ marginBottom: '1rem' }}
                      bordered={false}
                      open={false}
                      disabled
                      treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Type', false, calendarContentLanguage)}
                      defaultValue={placeData?.additionalType?.map((type) => {
                        return type?.entityId;
                      })}
                      tagRender={(props) => {
                        const { label } = props;
                        return <Tags>{label}</Tags>;
                      }}
                    />
                  </div>
                )}
                {placeData?.dynamicFields?.length > 0 && (
                  <Col span={24}>
                    {allTaxonomyData?.data?.map((taxonomy, index) => {
                      if (taxonomy?.isDynamicField) {
                        let initialValues,
                          initialTaxonomy = [];
                        placeData?.dynamicFields?.forEach((dynamicField) => {
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
                {(placeData?.disambiguatingDescription?.en || placeData?.disambiguatingDescription?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.disambiguatingDescription')}
                    </p>
                    {placeData?.disambiguatingDescription?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{placeData?.disambiguatingDescription?.fr}</p>
                      </>
                    )}
                    {placeData?.disambiguatingDescription?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{placeData?.disambiguatingDescription?.en}</p>
                      </>
                    )}
                  </Col>
                )}
                {(placeData?.description?.fr || placeData?.description?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.description')}
                    </p>
                    {placeData?.description?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">
                          <div dangerouslySetInnerHTML={{ __html: placeData?.description?.fr }} />
                        </p>
                      </>
                    )}
                    {placeData?.description?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">
                          <div dangerouslySetInnerHTML={{ __html: placeData?.description?.en }} />
                        </p>
                      </>
                    )}
                  </Col>
                )}
              </Row>
            </Col>
            <Col>
              {placeData?.image?.original?.uri && (
                <div style={{ marginTop: '-35%' }}>
                  <img
                    src={placeData?.image?.original?.uri}
                    alt="avatar"
                    style={{
                      width: '151px',
                      height: '151px',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}
            </Col>
          </Card>
          <Card>
            <Col>
              <Row gutter={[0, 24]}>
                <Col span={24}>
                  <p className="read-only-event-content" style={{ fontSize: '24px' }}>
                    {t('dashboard.places.readOnly.address.address')}
                  </p>
                </Col>
                {(placeData?.address?.streetAddress?.en || placeData?.address?.streetAddress?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.address.streetAddress')}
                    </p>
                    {placeData?.address?.streetAddress?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{placeData?.address?.streetAddress?.fr}</p>
                      </>
                    )}
                    {placeData?.address?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{placeData?.address?.streetAddress?.en}</p>
                      </>
                    )}
                  </Col>
                )}
                {(placeData?.name?.fr || placeData?.name?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.placeName')}
                    </p>
                    {placeData?.name?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{placeData?.name?.fr}</p>
                      </>
                    )}
                    {placeData?.name?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{placeData?.name?.en}</p>
                      </>
                    )}
                  </Col>
                )}

                {(placeData?.address?.addressLocality?.en || placeData?.address?.addressLocality?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.address.city')}
                    </p>
                    <ArtsDataLink>
                      <span style={{ textDecoration: 'underline' }}>
                        {contentLanguageBilingual({
                          en: placeData?.address?.addressLocality?.en,
                          fr: placeData?.address?.addressLocality?.fr,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
                      </span>
                      <LinkOutlined />
                    </ArtsDataLink>
                  </Col>
                )}
                {placeData?.address?.postalCode && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.address.postalCode')}
                    </p>
                    <p className="read-only-event-content">{placeData?.address?.postalCode}</p>
                  </Col>
                )}
                <Col span={24}>
                  <Row justify={'space-between'} gutter={[48, 0]}>
                    {placeData?.address?.addressRegion && (
                      <Col span={8}>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.places.readOnly.address.province')}
                        </p>
                        <ArtsDataLink>
                          <span style={{ textDecoration: 'underline' }}>
                            {contentLanguageBilingual({
                              en: placeData?.address?.addressRegion?.en,
                              fr: placeData?.address?.addressRegion?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                          </span>
                          <LinkOutlined />
                        </ArtsDataLink>
                      </Col>
                    )}
                    {placeData?.address?.addressCountry && (
                      <Col span={8}>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.places.readOnly.address.country')}
                        </p>
                        <ArtsDataLink>
                          <span style={{ textDecoration: 'underline' }}>
                            {contentLanguageBilingual({
                              en: placeData?.address?.addressCountry?.en,
                              fr: placeData?.address?.addressCountry?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                          </span>
                          <LinkOutlined />
                        </ArtsDataLink>
                      </Col>
                    )}
                  </Row>
                </Col>
                {placeData?.geoCoordinates && (
                  <Col span={10}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.address.coordinates')}
                    </p>
                    <span className="read-only-event-content">
                      {placeData?.geoCoordinates?.latitude}
                      <br />
                    </span>
                    <span className="read-only-event-content">{placeData?.geoCoordinates?.longitude}</span>
                  </Col>
                )}
                {placeData?.regions?.length > 0 && (
                  <div>
                    <p className="read-only-event-content-sub-title-primary">
                      {taxonomyDetails(allTaxonomyData?.data, user, 'Region', 'name', false)}
                    </p>
                    <TreeSelectOption
                      style={{ marginBottom: '1rem' }}
                      bordered={false}
                      open={false}
                      disabled
                      treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Region', false, calendarContentLanguage)}
                      defaultValue={placeData?.regions?.map((type) => {
                        return type?.entityId;
                      })}
                      tagRender={(props) => {
                        const { label } = props;
                        return <Tags>{label}</Tags>;
                      }}
                    />
                  </div>
                )}
                {placeData?.openingHours?.uri && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.places.readOnly.address.openingHoursLink')}
                    </p>
                    <p>
                      <a
                        href={placeData?.openingHours?.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="url-links">
                        {placeData?.openingHours?.uri}
                      </a>
                    </p>
                  </Col>
                )}
              </Row>
            </Col>
            <Col></Col>
          </Card>
          {placeData?.accessibility?.length > 0 && (
            <Card>
              <Col>
                <Row gutter={[0, 24]}>
                  <Col span={24}>
                    <p className="read-only-event-content" style={{ fontSize: '24px' }}>
                      {t('dashboard.places.readOnly.venueAccessibility')}
                    </p>

                    <Col span={24}>
                      <p className="read-only-event-content-sub-title-primary">
                        {taxonomyDetails(allTaxonomyData?.data, user, 'PlaceAccessibility', 'name', false)}
                      </p>
                      <TreeSelectOption
                        style={{ marginBottom: '1rem' }}
                        bordered={false}
                        open={false}
                        disabled
                        treeData={treeTaxonomyOptions(
                          allTaxonomyData,
                          user,
                          'PlaceAccessibility',
                          false,
                          calendarContentLanguage,
                        )}
                        defaultValue={placeData?.accessibility?.map((accessibility) => {
                          return accessibility?.entityId;
                        })}
                        tagRender={(props) => {
                          const { label } = props;
                          return <Tags>{label}</Tags>;
                        }}
                      />
                    </Col>
                  </Col>
                </Row>
              </Col>
              <Col></Col>
            </Card>
          )}
          <Card>
            <Col>
              <Row gutter={[0, 24]}>
                <Col span={24}>
                  <p className="read-only-event-content" style={{ fontSize: '24px' }}>
                    {t('dashboard.places.readOnly.containedInPlace')}
                  </p>
                  <Col span={24}>
                    {placeData?.containedInPlace?.entityId && locationPlace ? (
                      <SelectionItem
                        icon={locationPlace?.label?.props?.icon}
                        name={locationPlace?.name}
                        description={locationPlace?.description}
                        artsDataLink={artsDataLinkChecker(locationPlace?.sameAs)}
                        itemWidth="423px"
                        calendarContentLanguage={calendarContentLanguage}
                        bordered
                      />
                    ) : (
                      <p className="read-only-event-contentf-sub-title-primary">
                        {t('dashboard.places.readOnly.notContainedInPlace')}
                      </p>
                    )}
                  </Col>
                </Col>
              </Row>
            </Col>
            <Col></Col>
          </Card>
        </Row>
      </FeatureFlag>
    )
  );
}

export default PlaceReadOnly;
