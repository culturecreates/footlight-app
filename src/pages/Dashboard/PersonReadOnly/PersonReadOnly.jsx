import React, { useEffect, useRef } from 'react';
import './personReadOnly.css';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import {} from '@ant-design/icons';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import {
  treeDynamicTaxonomyOptions,
  treeTaxonomyOptions,
} from '../../../components/TreeSelectOption/treeSelectOption.settings';
import Tags from '../../../components/Tags/Common/Tags';
import TreeSelectOption from '../../../components/TreeSelectOption/TreeSelectOption';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import { useGetPersonQuery } from '../../../services/people';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';

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
    sessionId: timestampRef,
  });

  const { user } = useSelector(getUserDetails);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  useEffect(() => {
    if (personError) navigate(`${PathName.NotFound}`);
  }, [personError]);

  return (
    personSuccess &&
    !personLoading &&
    !taxonomyLoading && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Row gutter={[32, 24]} className="read-only-wrapper">
          <Col span={24}>
            <Breadcrumbs
              name={contentLanguageBilingual({
                en: personData?.name?.en,
                fr: personData?.name?.fr,
                interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                calendarContentLanguage: calendarContentLanguage,
              })}
            />
          </Col>

          <Col span={24}>
            <Row>
              <Col flex="780px">
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
          {artsDataLinkChecker(personData?.sameAs) && (
            <Col span={24}>
              <Row>
                <Col span={16}>
                  <ArtsDataInfo
                    artsDataLink={artsDataLinkChecker(personData?.sameAs)}
                    name={contentLanguageBilingual({
                      en: personData?.name?.en,
                      fr: personData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                    disambiguatingDescription={contentLanguageBilingual({
                      en: personData?.disambiguatingDescription?.en,
                      fr: personData?.disambiguatingDescription?.fr,
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
                    {t('dashboard.people.readOnly.details')}
                  </p>
                </Col>
                {(personData?.name?.fr || personData?.name?.en) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">{t('dashboard.people.readOnly.name')}</p>
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
                {personData?.occupation.length > 0 && (
                  <div>
                    <p className="read-only-event-content-sub-title-primary">
                      {taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false)}
                    </p>
                    <TreeSelectOption
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
                        return <Tags>{label}</Tags>;
                      }}
                    />
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
                {(personData?.disambiguatingDescription?.en || personData?.disambiguatingDescription?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary">
                      {t('dashboard.people.readOnly.disambiguatingDescription')}
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
                      {t('dashboard.people.readOnly.description')}
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
                      {t('dashboard.people.readOnly.website')}
                    </p>
                    <p>
                      <a href={personData?.url?.uri} target="_blank" rel="noopener noreferrer" className="url-links">
                        {personData?.url?.uri}
                      </a>
                    </p>
                  </Col>
                )}
              </Row>
            </Col>
            <Col>
              {personData?.image?.original?.uri && (
                <div style={{ marginTop: '-35%' }}>
                  <img
                    src={personData?.image?.original?.uri}
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
        </Row>
      </FeatureFlag>
    )
  );
}

export default PersonReadOnly;
