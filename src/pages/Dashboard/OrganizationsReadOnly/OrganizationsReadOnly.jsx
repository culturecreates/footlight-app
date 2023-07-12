import React, { useEffect, useRef, useState } from 'react';
import './organizationsReadOnly.css';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, Col, Row } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useGetOrganizationQuery } from '../../../services/organization';
import { PathName } from '../../../constants/pathName';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { useLazyGetPlaceQuery } from '../../../services/places';
import SelectionItem from '../../../components/List/SelectionItem/SelectionItem';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { placesOptions } from '../../../components/Select/selectOption.settings';

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

  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery();

  const { user } = useSelector(getUserDetails);

  const [locationPlace, setLocationPlace] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  useEffect(() => {
    if (organizationError) navigate(`${PathName.NotFound}`);
  }, [organizationError]);

  console.log(organizationData);

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
    !organizationLoading && (
      <Row gutter={[32, 24]} className="read-only-wrapper">
        <Col span={24}>
          <Breadcrumb className="breadcrumb-item">
            <Breadcrumb.Item>
              <LeftOutlined style={{ marginRight: '17px' }} />
              {t('dashboard.organization.organizations')}
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item">
              {contentLanguageBilingual({
                en: organizationData?.name?.en,
                fr: organizationData?.name?.fr,
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
        <Card>
          <Col>
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <p className="read-only-event-content" style={{ fontSize: '24px' }}>
                  {t('dashboard.organization.readOnly.details')}
                </p>
              </Col>
              <Col span={24}>
                <p className="read-only-event-content-sub-title-primary">{t('dashboard.organization.readOnly.name')}</p>
                <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                <p className="read-only-event-content">{organizationData?.name?.fr}</p>
                <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                <p className="read-only-event-content">{organizationData?.name?.en}</p>
              </Col>
              <Col span={24}>
                <p className="read-only-event-content-sub-title-primary">
                  {t('dashboard.organization.readOnly.disambiguatingDescription')}
                </p>
                <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                <p className="read-only-event-content">{organizationData?.disambiguatingDescription?.fr}</p>
                <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                <p className="read-only-event-content">{organizationData?.disambiguatingDescription?.en}</p>
              </Col>
              <Col span={24}>
                <p className="read-only-event-content-sub-title-primary">
                  {t('dashboard.organization.readOnly.description')}
                </p>
                <p className="read-only-event-content-sub-title-secondary">{t('common.tabFrench')}</p>
                <p className="read-only-event-content">
                  <div dangerouslySetInnerHTML={{ __html: organizationData?.description?.fr }} />
                </p>
                <p className="read-only-event-content-sub-title-secondary">{t('common.tabEnglish')}</p>
                <p className="read-only-event-content">
                  <div dangerouslySetInnerHTML={{ __html: organizationData?.description?.en }} />
                </p>
                <p className="read-only-event-content-sub-title-primary">
                  {t('dashboard.organization.readOnly.website')}
                </p>
                <p>
                  <a href={organizationData?.url?.uri} target="_blank" rel="noopener noreferrer" className="url-links">
                    {organizationData?.url?.uri}
                  </a>
                </p>
              </Col>
              <Col span={24}>
                <p className="read-only-event-content-sub-title-primary">
                  {t('dashboard.organization.readOnly.contact')}
                </p>
                <p className="read-only-event-content-sub-title-secondary">
                  {t('dashboard.organization.readOnly.frenchContactTitle')}
                </p>
                <p className="read-only-event-content">{organizationData?.contactPoint?.name?.fr}</p>
                <p className="read-only-event-content-sub-title-secondary">
                  {t('dashboard.organization.readOnly.englishContactTitle')}
                </p>
                <p className="read-only-event-content">{organizationData?.contactPoint?.name?.en}</p>
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
                <p className="read-only-event-content-sub-title-secondary">
                  {t('dashboard.organization.readOnly.phoneNumber')}
                </p>
                <p className="url-links">{organizationData?.contactPoint?.telephone}</p>
                <p className="read-only-event-content-sub-title-secondary">
                  {t('dashboard.organization.readOnly.email')}
                </p>
                <p className="url-links">{organizationData?.contactPoint?.email}</p>
              </Col>
              <Col span={24}>
                <p className="read-only-event-content-sub-title-primary">
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
                  />
                )}
              </Col>
            </Row>
          </Col>
          <></>
        </Card>
      </Row>
    )
  );
}

export default OrganizationsReadOnly;
