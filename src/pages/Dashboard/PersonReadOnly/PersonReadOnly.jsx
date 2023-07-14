import React, { useEffect, useRef, useState } from 'react';
import './personReadOnly.css';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, Col, Row } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
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
import { useGetPersonQuery } from '../../../services/people';

function PersonReadOnly() {
  const { t } = useTranslation();
  const { personId, calendarId } = useParams();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const [currentCalendarData] = useOutletContext();

  const {
    data: personData,
    isLoading: personLoading,
    isSuccess: personSuccess,
    isError: personError,
  } = useGetPersonQuery({ personId, calendarId, sessionId: timestampRef }, { skip: personId ? false : true });
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PERSON,
    includeConcepts: true,
  });

  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery();

  const { user } = useSelector(getUserDetails);

  const [locationPlace, setLocationPlace] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  useEffect(() => {
    if (personError) navigate(`${PathName.NotFound}`);
  }, [personError]);

  useEffect(() => {
    if (personSuccess) {
      if (personData?.place?.entityId) {
        let initialPlace = [];
        let initialPlaceAccessibiltiy = [];
        getPlace({ placeId: personData?.place?.entityId, calendarId })
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
  }, [personSuccess]);

  return (
    personSuccess &&
    !personLoading &&
    !taxonomyLoading && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Row gutter={[32, 24]} className="read-only-wrapper">
          <Col span={24}>
            <Breadcrumb className="breadcrumb-item">
              <Breadcrumb.Item>
                <LeftOutlined style={{ marginRight: '17px' }} />
                {t('dashboard.organization.organizations')}
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item">
                {contentLanguageBilingual({
                  en: personData?.name?.en,
                  fr: personData?.name?.fr,
                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                  calendarContentLanguage: calendarContentLanguage,
                })}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Col>

          <Col span={24}>
            <Row>
              <Col>
                <div className="read-only-event-heading">
                  <h4>
                    {contentLanguageBilingual({
                      en: personData?.name?.en,
                      fr: personData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p className="read-only-event-content-sub-title-secondary">
                    {contentLanguageBilingual({
                      en: personData?.disambiguatingDescription?.en,
                      fr: personData?.disambiguatingDescription?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
          <Card>
            <Col>
              <Row gutter={[0, 24]}>
                <Col span={24}>
                  <p className="read-only-event-content" style={{ fontSize: '24px' }}>
                    {t('dashboard.organization.readOnly.details')}
                  </p>
                </Col>
                {(personData?.name?.fr || personData?.name?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.name')}
                    </p>
                    {personData?.name?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{personData?.name?.fr}</p>
                      </>
                    )}
                    {personData?.name?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{personData?.name?.en}</p>
                      </>
                    )}
                  </Col>
                )}
                {(personData?.disambiguatingDescription?.en || personData?.disambiguatingDescription?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.disambiguatingDescription')}
                    </p>
                    {personData?.disambiguatingDescription?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">{personData?.disambiguatingDescription?.fr}</p>
                      </>
                    )}
                    {personData?.disambiguatingDescription?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">{personData?.disambiguatingDescription?.en}</p>
                      </>
                    )}
                  </Col>
                )}
                {(personData?.description?.fr || personData?.description?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.description')}
                    </p>
                    {personData?.description?.fr && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                        <p className="read-only-event-content">
                          <div dangerouslySetInnerHTML={{ __html: personData?.description?.fr }} />
                        </p>
                      </>
                    )}
                    {personData?.description?.en && (
                      <>
                        <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                        <p className="read-only-event-content">
                          <div dangerouslySetInnerHTML={{ __html: personData?.description?.en }} />
                        </p>
                      </>
                    )}
                  </Col>
                )}
                {personData?.url?.uri && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.organization.readOnly.website')}
                    </p>
                    <p>
                      <a href={personData?.url?.uri} target="_blank" rel="noopener noreferrer" className="url-links">
                        {personData?.url?.uri}
                      </a>
                    </p>
                  </Col>
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
              {personData?.logo?.original?.uri && (
                <div style={{ marginTop: '-35%' }}>
                  <img
                    src={personData?.logo?.original?.uri}
                    alt="avatar"
                    style={{
                      objectFit: 'cover',
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

export default PersonReadOnly;
