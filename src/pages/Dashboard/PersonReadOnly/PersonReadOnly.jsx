import React, { useEffect, useRef, useState } from 'react';
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
import { getExternalSourceId } from '../../../utils/getExternalSourceId';

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
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PERSON,
    includeConcepts: true,
    sessionId: timestampRef,
  });

  const { user } = useSelector(getUserDetails);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);

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
    if (personError) navigate(`${PathName.NotFound}`);
  }, [personError]);

  useEffect(() => {
    if (personData) {
      if (personData?.derivedFrom?.uri) {
        let sourceId = getExternalSourceId(personData?.derivedFrom?.uri);
        getArtsData(sourceId);
      }
    }
  }, [personLoading]);

  return (
    personSuccess &&
    !personLoading &&
    !taxonomyLoading &&
    !artsDataLoading && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Row gutter={[32, 24]} className="read-only-wrapper person-read-only-wrapper" style={{ margin: 0 }}>
          <Col span={24} className="top-level-column">
            <Row gutter={[16, 16]}>
              <Col flex="auto">
                <Breadcrumbs
                  name={contentLanguageBilingual({
                    en: personData?.name?.en,
                    fr: personData?.name?.fr,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    calendarContentLanguage: calendarContentLanguage,
                  })}
                />
              </Col>
              <Col flex="60px" style={{ marginLeft: 'auto' }}>
                <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
                  <ReadOnlyProtectedComponent creator={personData.createdByUserId} isReadOnly={isReadOnly}>
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
                      en: personData?.name?.en,
                      fr: personData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p
                    className="read-only-event-content-sub-title-primary"
                    data-cy="para-person-disambiguating-description">
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
            <Col span={24} className="artsdata-link-wrapper top-level-column">
              <Row>
                <Col flex={'780px'}>
                  <ArtsDataInfo
                    artsDataLink={artsDataLinkChecker(artsData?.sameAs)}
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
                    {(personData?.name?.fr || personData?.name?.en) && (
                      <Col span={24}>
                        <p className="read-only-event-content-sub-title-primary" data-cy="para-person-name-title">
                          {t('dashboard.people.readOnly.name')}
                        </p>
                        {personData?.name?.fr && (
                          <>
                            <p
                              className="read-only-event-content-sub-title-secondary"
                              data-cy="para-person-name-french-title">
                              {t('common.tabFrench')}
                            </p>
                            <p className="read-only-event-content" data-cy="para-person-name-french">
                              {personData?.name?.fr}
                            </p>
                          </>
                        )}
                        {personData?.name?.en && (
                          <>
                            <p
                              className="read-only-event-content-sub-title-secondary"
                              data-cy="para-person-name-english-title">
                              {t('common.tabEnglish')}
                            </p>
                            <p className="read-only-event-content" data-cy="para-person-name-english">
                              {personData?.name?.en}
                            </p>
                          </>
                        )}
                      </Col>
                    )}
                    {personData?.occupation?.length > 0 && (
                      <div>
                        <p className="read-only-event-content-sub-title-primary" data-cy="para-person-occupation-title">
                          {taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false)}
                        </p>
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
                                </div>
                              );
                          }
                        })}
                      </Col>
                    )}
                    {(personData?.disambiguatingDescription?.en || personData?.disambiguatingDescription?.fr) && (
                      <Col span={24}>
                        <p
                          className="read-only-event-content-sub-title-primary"
                          data-cy="para-person-disambiguating-description-title">
                          {t('dashboard.people.readOnly.disambiguatingDescription')}
                        </p>
                        {personData?.disambiguatingDescription?.fr && (
                          <>
                            <p
                              className="read-only-event-content-sub-title-secondary"
                              data-cy="para-person-disambiguating-description-french-title">
                              {t('common.tabFrench')}
                            </p>
                            <p
                              className="read-only-event-content"
                              data-cy="para-person-disambiguating-description-french">
                              {personData?.disambiguatingDescription?.fr}
                            </p>
                          </>
                        )}
                        {personData?.disambiguatingDescription?.en && (
                          <>
                            <p
                              className="read-only-event-content-sub-title-secondary"
                              data-cy="para-person-disambiguating-description-english-title">
                              {t('common.tabEnglish')}
                            </p>
                            <p
                              className="read-only-event-content"
                              data-cy="para-person-disambiguating-description-english">
                              {personData?.disambiguatingDescription?.en}
                            </p>
                          </>
                        )}
                      </Col>
                    )}
                    {(personData?.description?.fr || personData?.description?.en) && (
                      <Col span={24}>
                        <p
                          className="read-only-event-content-sub-title-primary"
                          data-cy="para-person-description-title">
                          {t('dashboard.people.readOnly.description')}
                        </p>
                        {personData?.description?.fr && (
                          <>
                            <p
                              className="read-only-event-content-sub-title-secondary"
                              data-cy="para-person-description-french-title">
                              {t('common.tabFrench')}
                            </p>
                            <p className="read-only-event-content">
                              <div
                                dangerouslySetInnerHTML={{ __html: personData?.description?.fr }}
                                data-cy="div-person-description-french"
                              />
                            </p>
                          </>
                        )}
                        {personData?.description?.en && (
                          <>
                            <p
                              className="read-only-event-content-sub-title-secondary"
                              data-cy="para-person-description-english-title">
                              {t('common.tabEnglish')}
                            </p>
                            <p className="read-only-event-content">
                              <div
                                dangerouslySetInnerHTML={{ __html: personData?.description?.en }}
                                data-cy="div-person-description-english"
                              />
                            </p>
                          </>
                        )}
                      </Col>
                    )}
                    {personData?.url?.uri && (
                      <Col span={24}>
                        <p className="read-only-event-content-sub-title-primary" data-cy="para-person-website-title">
                          {t('dashboard.people.readOnly.website')}
                        </p>
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
                      </Col>
                    )}
                    {personData?.socialMediaLinks?.length > 0 && (
                      <Col span={24}>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.people.readOnly.socialMediaLinks')}
                        </p>
                        {personData?.socialMediaLinks?.map((link, index) => (
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
                  </Row>
                </Col>
                <Col>
                  {personData?.image?.original?.uri && (
                    <div>
                      <img
                        src={personData?.image?.original?.uri}
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
            </Row>
          </Col>
        </Row>
      </FeatureFlag>
    )
  );
}

export default PersonReadOnly;
