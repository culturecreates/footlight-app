import React, { useEffect, useRef, useState } from 'react';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import Icon, { LinkOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
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
import { ReactComponent as OrganizationLogo } from '../../../assets/icons/organization-light.svg';
import TreeSelectOption from '../../../components/TreeSelectOption/TreeSelectOption';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import OutlinedButton from '../../../components/Button/Outlined';
import { featureFlags } from '../../../utils/featureFlags';
import { useGetPlaceQuery, useLazyGetPlaceQuery } from '../../../services/places';
import ArtsDataLink from '../../../components/Tags/ArtsDataLink/ArtsDataLink';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import SelectionItem from '../../../components/List/SelectionItem/SelectionItem';
import { placesOptions } from '../../../components/Select/selectOption.settings';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import ReadOnlyProtectedComponent from '../../../layout/ReadOnlyProtectedComponent';
import { loadArtsDataPlaceEntity } from '../../../services/artsData';
import { getExternalSourceId } from '../../../utils/getExternalSourceId';
import { sourceOptions } from '../../../constants/sourceOptions';
import './placeReadOnly.css';
import moment from 'moment';
import { useLazyGetEntityDependencyDetailsQuery } from '../../../services/entities';
import MultipleImageUpload from '../../../components/MultipleImageUpload';

function PlaceReadOnly() {
  const { t } = useTranslation();
  const { placeId, calendarId } = useParams();
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
    data: placeData,
    isLoading: placeLoading,
    isSuccess: placeSuccess,
    isError: placeError,
  } = useGetPlaceQuery({ placeId, calendarId, sessionId: timestampRef }, { skip: placeId ? false : true });

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PLACE);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery();
  const [getDerivedEntities, { isFetching: isEntityDetailsLoading }] = useLazyGetEntityDependencyDetailsQuery({
    sessionId: timestampRef,
  });

  const { user } = useSelector(getUserDetails);

  const [locationPlace, setLocationPlace] = useState();
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [artsData, setArtsData] = useState(null);
  const [selectedContainsPlaces, setSelectedContainsPlaces] = useState([]);
  const [derivedEntitiesData, setDerivedEntitiesData] = useState();
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const mainImageData = placeData?.image?.find((image) => image?.isMain) || null;
  const imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];

  const getArtsDataPlace = (id) => {
    setArtsDataLoading(true);
    loadArtsDataPlaceEntity({ entityId: id })
      .then((response) => {
        if (response?.data?.length > 0) {
          setArtsData(response?.data[0]);
        }
        setArtsDataLoading(false);
      })
      .catch((error) => {
        setArtsDataLoading(false);
        console.log(error);
      });
  };

  useEffect(() => {
    if (placeError) navigate(`${PathName.NotFound}`);
  }, [placeError]);

  useEffect(() => {
    if (placeId) {
      getDerivedEntities({ id: placeId, calendarId }).then((response) => {
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
  }, [placeId]);

  useEffect(() => {
    if (placeSuccess) {
      if (placeData?.sameAs?.length > 0) {
        let sourceId = artsDataLinkChecker(placeData?.sameAs);
        sourceId = getExternalSourceId(sourceId);
        getArtsDataPlace(sourceId);
      }
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
      if (placeData?.containsPlace?.length > 0) {
        let initialContainsPlace = placeData?.containsPlace?.map((place) => {
          return {
            disambiguatingDescription: place?.disambiguatingDescription,
            id: place?.id,
            name: place?.name,
            image: place?.image?.find((image) => image?.isMain),
            uri: artsDataLinkChecker(place?.sameAs),
          };
        });
        setSelectedContainsPlaces(
          placesOptions(initialContainsPlace, user, calendarContentLanguage, sourceOptions.CMS),
        );
      }
    }
  }, [placeSuccess]);

  return (
    placeSuccess &&
    !placeLoading &&
    !isEntityDetailsLoading &&
    !artsDataLoading &&
    !taxonomyLoading && (
      <FeatureFlag isFeatureEnabled={featureFlags.orgPersonPlacesView}>
        <Row gutter={[32, 24]} className="read-only-wrapper place-read-only">
          <Col className="top-level-column" span={24}>
            <Row>
              <Col flex="auto">
                <Breadcrumbs
                  name={contentLanguageBilingual({
                    en: placeData?.name?.en,
                    fr: placeData?.name?.fr,
                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                    calendarContentLanguage: calendarContentLanguage,
                  })}
                />
              </Col>
              <Col flex="60px" style={{ marginLeft: 'auto' }}>
                <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
                  <ReadOnlyProtectedComponent creator={placeData.createdByUserId} isReadOnly={isReadOnly}>
                    <div className="button-container">
                      <OutlinedButton
                        data-cy="button-edit-place"
                        label={t('dashboard.places.readOnly.edit')}
                        size="middle"
                        style={{ height: '40px', width: '60px' }}
                        onClick={() =>
                          navigate(
                            `${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.AddPlace}?id=${placeData?.id}`,
                          )
                        }
                      />
                    </div>
                  </ReadOnlyProtectedComponent>
                </FeatureFlag>
              </Col>
            </Row>
          </Col>

          <Col className="top-level-column" span={24}>
            <Row>
              <Col>
                <div className="read-only-event-heading">
                  <h4 data-cy="heading-place-name">
                    {contentLanguageBilingual({
                      en: placeData?.name?.en,
                      fr: placeData?.name?.fr,
                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p
                    className="read-only-event-content-sub-title-primary"
                    data-cy="para-place-disambiguating-description">
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
            <Col flex={'780px'} className="artsdata-link-wrapper top-level-column">
              <Row>
                <Col flex={'780px'}>
                  <ArtsDataInfo
                    artsDataLink={artsDataLinkChecker(placeData?.sameAs)}
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
          <div className="place-read-only-image-section">
            <Card marginResponsive="0px">
              <Col className="top-level-column">
                <Row>
                  {(placeData?.name?.fr || placeData?.name?.en) && (
                    <Col span={24}>
                      <p className="read-only-event-content-sub-title-primary" data-cy="para-place-name-title">
                        {t('dashboard.places.readOnly.placeName')}
                      </p>
                      {placeData?.name?.fr && (
                        <>
                          <p
                            className="read-only-event-content-sub-title-secondary"
                            data-cy="para-place-name-french-title">
                            {t('common.tabFrench')}
                          </p>
                          <p className="read-only-event-content" data-cy="para-place-name-french">
                            {placeData?.name?.fr}
                          </p>
                        </>
                      )}
                      {placeData?.name?.en && (
                        <>
                          <p
                            className="read-only-event-content-sub-title-secondary"
                            data-cy="para-place-name-english-title">
                            {t('common.tabEnglish')}
                          </p>
                          <p className="read-only-event-content" data-cy="para-place-name-english">
                            {placeData?.name?.en}
                          </p>
                        </>
                      )}
                    </Col>
                  )}
                  {placeData?.additionalType.length > 0 && (
                    <div>
                      <p className="read-only-event-content-sub-title-primary" data-cy="para-">
                        {taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false)}
                      </p>
                      <TreeSelectOption
                        data-cy="treeselect-place-additional-type"
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
                          return <Tags data-cy={`tag-place-${label}`}>{label}</Tags>;
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
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-place-dynamic-taxonomy-name">
                                  {bilingual({
                                    en: taxonomy?.name?.en,
                                    fr: taxonomy?.name?.fr,
                                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  })}
                                </p>
                                <TreeSelectOption
                                  data-cy={`treeselect-place-dynamic-taxonomy-${index}`}
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
                                    return <Tags data-cy={`tag-place-dynamic-taxonomy-${label}`}>{label}</Tags>;
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
                      <p
                        className="read-only-event-content-sub-title-primary"
                        data-cy="para-place-disambiguating-description-title">
                        {t('dashboard.places.readOnly.disambiguatingDescription')}
                      </p>
                      {placeData?.disambiguatingDescription?.fr && (
                        <>
                          <p
                            className="read-only-event-content-sub-title-secondary"
                            data-cy="para-place-disambiguating-description-french-title">
                            {t('common.tabFrench')}
                          </p>
                          <p className="read-only-event-content" data-cy="para-place-disambiguating-description-french">
                            {placeData?.disambiguatingDescription?.fr}
                          </p>
                        </>
                      )}
                      {placeData?.disambiguatingDescription?.en && (
                        <>
                          <p
                            className="read-only-event-content-sub-title-secondary"
                            data-cy="para-place-disambiguating-description-english-title">
                            {t('common.tabEnglish')}
                          </p>
                          <p
                            className="read-only-event-content"
                            data-cy="para-place-disambiguating-description-english">
                            {placeData?.disambiguatingDescription?.en}
                          </p>
                        </>
                      )}
                    </Col>
                  )}
                  {(placeData?.description?.fr || placeData?.description?.en) && (
                    <Col span={24}>
                      <p className="read-only-event-content-sub-title-primary" data-cy="para-place-description-title">
                        {t('dashboard.places.readOnly.description')}
                      </p>
                      {placeData?.description?.fr && (
                        <>
                          <p
                            className="read-only-event-content-sub-title-secondary"
                            data-cy="para-place-description-french-title">
                            {t('common.tabFrench')}
                          </p>
                          <p className="read-only-event-content">
                            <div
                              dangerouslySetInnerHTML={{ __html: placeData?.description?.fr }}
                              data-cy="div-place-description-french"
                            />
                          </p>
                        </>
                      )}
                      {placeData?.description?.en && (
                        <>
                          <p
                            className="read-only-event-content-sub-title-secondary"
                            data-cy="para-place-description-english-title">
                            {t('common.tabEnglish')}
                          </p>
                          <p className="read-only-event-content">
                            <div
                              dangerouslySetInnerHTML={{ __html: placeData?.description?.en }}
                              data-cy="div-place-description-english"
                            />
                          </p>
                        </>
                      )}
                    </Col>
                  )}
                  {placeData?.image?.length > 0 && imageConfig.enableGallery && (
                    <Col span={24}>
                      <div>
                        <p className="read-only-event-content-sub-title-primary">
                          {t('dashboard.events.addEditEvent.otherInformation.image.additionalImages')}
                        </p>
                        <MultipleImageUpload
                          imageReadOnly={true}
                          largeAspectRatio={
                            currentCalendarData?.imageConfig?.length > 0 ? imageConfig?.large?.aspectRatio : null
                          }
                          thumbnailAspectRatio={
                            currentCalendarData?.imageConfig?.length > 0 ? imageConfig?.thumbnail?.aspectRatio : null
                          }
                          eventImageData={placeData?.image?.filter((image) => !image?.isMain)}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </Col>
              <Col className="top-level-column">
                {mainImageData?.original?.uri && (
                  <div>
                    <img
                      data-cy="image-place-original"
                      src={mainImageData?.original?.uri}
                      alt="avatar"
                      style={{
                        width: '151px',
                        height: '151px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                )}
              </Col>
            </Card>
          </div>
          <Card marginResponsive="0px">
            <Col className="top-level-column">
              <Row gutter={[0, 24]}>
                <Col span={24}>
                  <span
                    className="read-only-event-content"
                    style={{ fontSize: '24px' }}
                    data-cy="span-place-address-title">
                    {t('dashboard.places.readOnly.address.address')}
                  </span>
                </Col>
                {(placeData?.address?.streetAddress?.en || placeData?.address?.streetAddress?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-place-street-address-title">
                      {t('dashboard.places.readOnly.address.streetAddress')}
                    </p>
                    {placeData?.address?.streetAddress?.fr && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-place-street-address-french-title">
                          {t('common.tabFrench')}
                        </p>
                        <p className="read-only-event-content" data-cy="para-place-street-address-french">
                          {placeData?.address?.streetAddress?.fr}
                        </p>
                      </>
                    )}
                    {placeData?.address?.streetAddress?.en && (
                      <>
                        <p
                          className="read-only-event-content-sub-title-secondary"
                          data-cy="para-place-street-address-english-title">
                          {t('common.tabEnglish')}
                        </p>
                        <p className="read-only-event-content" data-cy="para-place-street-address-english">
                          {placeData?.address?.streetAddress?.en}
                        </p>
                      </>
                    )}
                  </Col>
                )}

                {(placeData?.address?.addressLocality?.en || placeData?.address?.addressLocality?.fr) && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-place-city-title">
                      {t('dashboard.places.readOnly.address.city')}
                    </p>
                    <ArtsDataLink>
                      <span style={{ textDecoration: 'underline' }} data-cy="span-place-city">
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
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-place-postalcode-title">
                      {t('dashboard.places.readOnly.address.postalCode')}
                    </p>
                    <p className="read-only-event-content" data-cy="para-place-postalcode">
                      {placeData?.address?.postalCode}
                    </p>
                  </Col>
                )}
                <Col span={24}>
                  <Row justify={'space-between'} gutter={[48, 0]}>
                    {placeData?.address?.addressRegion && (
                      <Col span={8}>
                        <p className="read-only-event-content-sub-title-primary" data-cy="para-place-province-title">
                          {t('dashboard.places.readOnly.address.province')}
                        </p>
                        <ArtsDataLink>
                          <span style={{ textDecoration: 'underline' }} data-cy="span-place-province">
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
                        <p className="read-only-event-content-sub-title-primary" data-cy="para-place-country-title">
                          {t('dashboard.places.readOnly.address.country')}
                        </p>
                        <ArtsDataLink>
                          <span style={{ textDecoration: 'underline' }} data-cy="span-place-country">
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
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-place-coordinates-title">
                      {t('dashboard.places.readOnly.address.coordinates')}
                    </p>
                    <span className="read-only-event-content" data-cy="span-place-coordinates-latitude">
                      {placeData?.geoCoordinates?.latitude}
                      <br />
                    </span>
                    <span className="read-only-event-content" data-cy="span-place-coordinates-longitute">
                      {placeData?.geoCoordinates?.longitude}
                    </span>
                  </Col>
                )}
                {placeData?.regions?.length > 0 && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-place-region-title">
                      {taxonomyDetails(allTaxonomyData?.data, user, 'Region', 'name', false)}
                    </p>
                    <TreeSelectOption
                      data-cy="treeselect-place-region"
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
                        return <Tags data-cy={`tag-place-region-${label}`}>{label}</Tags>;
                      }}
                    />
                  </Col>
                )}
                {placeData?.openingHours?.uri && (
                  <Col span={24}>
                    <p className="read-only-event-content-sub-title-primary" data-cy="para-place-opening-hours-title">
                      {t('dashboard.places.readOnly.address.openingHoursLink')}
                    </p>
                    <p>
                      <a
                        data-cy="anchor-place-opening-hours"
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
            <Col className="top-level-column"></Col>
          </Card>
          {placeData?.accessibility?.length > 0 && (
            <Card marginResponsive="0px">
              <Col>
                <Row gutter={[0, 24]}>
                  <Col span={24}>
                    <p
                      className="read-only-event-content"
                      style={{ fontSize: '24px' }}
                      data-cy="para-place-venue-accessibility-title">
                      {t('dashboard.places.readOnly.venueAccessibility')}
                    </p>

                    <Col span={24}>
                      <p className="read-only-event-content-sub-title-primary" data-cy="para-place-accessibility-title">
                        {taxonomyDetails(allTaxonomyData?.data, user, 'PlaceAccessibility', 'name', false)}
                      </p>
                      <TreeSelectOption
                        data-cy="treeselect-place-accessibility"
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
                          return <Tags data-cy={`tag-place-accessibility-${label}`}>{label}</Tags>;
                        }}
                      />
                    </Col>
                  </Col>
                </Row>
              </Col>
              <Col></Col>
            </Card>
          )}
          {placeData?.containsPlace?.length > 0 && (
            <Card marginResponsive="0px">
              <Col className="top-level-column">
                <Row gutter={[0, 24]}>
                  <Col span={24}>
                    <p
                      className="read-only-event-content"
                      style={{ fontSize: '24px' }}
                      data-cy="para-place-contains-place-title">
                      {t('dashboard.places.createNew.addPlace.containsPlace.containsPlace')}
                    </p>
                    <Col span={24}>
                      {selectedContainsPlaces?.map((containsPlace, index) => {
                        return (
                          <SelectionItem
                            key={index}
                            icon={containsPlace?.label?.props?.icon}
                            name={containsPlace?.name}
                            description={containsPlace?.description}
                            artsDataLink={containsPlace?.uri}
                            artsDataDetails={true}
                            calendarContentLanguage={calendarContentLanguage}
                            bordered
                            itemWidth="423px"
                          />
                        );
                      })}
                    </Col>
                  </Col>
                </Row>
              </Col>
              <Col className="top-level-column"></Col>
            </Card>
          )}
          <Card marginResponsive="0px">
            <Col className="top-level-column">
              <Row gutter={[0, 24]}>
                <Col span={24}>
                  <p
                    className="read-only-event-content"
                    style={{ fontSize: '24px' }}
                    data-cy="para-place-contained-in--place-title">
                    {t('dashboard.places.readOnly.containedInPlace')}
                  </p>
                  <Col span={24}>
                    {placeData?.containedInPlace?.entityId && locationPlace ? (
                      <SelectionItem
                        icon={locationPlace?.label?.props?.icon}
                        name={locationPlace?.name}
                        description={locationPlace?.description}
                        artsDataLink={artsDataLinkChecker(locationPlace?.sameAs)}
                        artsDataDetails={true}
                        itemWidth="423px"
                        calendarContentLanguage={calendarContentLanguage}
                        bordered
                      />
                    ) : (
                      <p
                        className="read-only-event-content-sub-title-primary"
                        data-cy="para-place-contains-place-empty-decription">
                        {t('dashboard.places.readOnly.notContainedInPlace')}
                      </p>
                    )}
                  </Col>
                </Col>
              </Row>
            </Col>
            <Col className="top-level-column"></Col>
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
                            // description={moment(event.startDateTime).format('YYYY-MM-DD')}
                            bordered
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
                      {t('dashboard.organization.createNew.addOrganization.associatedEntities.organizations')}
                      <div className="associated-with-cards-wrapper">
                        {derivedEntitiesData?.organizations?.map((org) => {
                          return (
                            <SelectionItem
                              key={org._id}
                              name={
                                org?.name?.en || org?.name?.fr
                                  ? contentLanguageBilingual({
                                      en: org?.name?.en,
                                      fr: org?.name?.fr,
                                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
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
                              bordered
                              itemWidth="100%"
                            />
                          );
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
                            icon={<CalendarOutlined style={{ color: '#607EFC' }} />}
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

export default PlaceReadOnly;
