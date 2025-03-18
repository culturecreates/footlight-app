import React, { useEffect, useRef, useState } from 'react';
import Card from '../../../components/Card/Common/Event';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import Icon, { LinkOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { useDispatch, useSelector } from 'react-redux';
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
import ReadOnlyPageTabLayout from '../../../layout/ReadOnlyPageTabLayout/ReadOnlyPageTabLayout';
import { getActiveTabKey } from '../../../redux/reducer/readOnlyTabSlice';
import { isDataValid } from '../../../utils/MultiLingualFormItemSupportFunctions';
import { placeFormRequiredFieldNames } from '../../../constants/placeFormRequiredFieldNames';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import ImageUpload from '../../../components/ImageUpload';
import { clearActiveFallbackFieldsInfo } from '../../../redux/reducer/languageLiteralSlice';
import FallbackInjectorForReadOnlyPages from '../../../components/FallbackInjectorForReadOnlyPages/FallbackInjectorForReadOnlyPages';

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

  const dispatch = useDispatch();

  const { user } = useSelector(getUserDetails);
  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);
  const activeTabKey = useSelector(getActiveTabKey);

  const [locationPlace, setLocationPlace] = useState();
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [artsData, setArtsData] = useState(null);
  const [selectedContainsPlaces, setSelectedContainsPlaces] = useState([]);
  const [derivedEntitiesData, setDerivedEntitiesData] = useState();
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const mainImageData = placeData?.image?.find((image) => image?.isMain) || null;
  const imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];
  const imageGalleryData = placeData?.image?.filter((image) => image && !image?.isMain) || [];

  const formConstants = currentCalendarData?.forms?.filter((form) => form?.formName === 'Place')[0];
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
    dispatch(clearActiveFallbackFieldsInfo());
  }, []);

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
                    data: placeData?.name,
                    requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
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
                      data: placeData?.name,
                      requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                      calendarContentLanguage: calendarContentLanguage,
                    })}
                  </h4>
                  <p
                    className="read-only-event-content-sub-title-primary"
                    data-cy="para-place-disambiguating-description">
                    {contentLanguageBilingual({
                      data: placeData?.disambiguatingDescription,
                      requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
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
                    <div className="place-read-only-image-section">
                      <Card marginResponsive="0px">
                        <Col className="top-level-column">
                          <Row>
                            <Col span={24}>
                              {checkIfFieldIsToBeDisplayed(placeFormRequiredFieldNames.NAME, placeData?.name) && (
                                <>
                                  <p
                                    className="read-only-event-content-sub-title-primary"
                                    data-cy="para-place-name-title">
                                    {t('dashboard.places.readOnly.placeName')}
                                  </p>
                                  {Object.keys(placeData?.name ?? {}).length > 0 && (
                                    <FallbackInjectorForReadOnlyPages fieldName="name" data={placeData?.name}>
                                      <p className="read-only-event-content" data-cy="para-place-name-french">
                                        {contentLanguageBilingual({
                                          data: placeData?.name,
                                          calendarContentLanguage,
                                          requiredLanguageKey: activeTabKey,
                                        })}
                                      </p>
                                    </FallbackInjectorForReadOnlyPages>
                                  )}
                                </>
                              )}
                            </Col>
                            {checkIfFieldIsToBeDisplayed(
                              placeFormRequiredFieldNames.PLACE_TYPE,
                              placeData?.additionalType,
                            ) && (
                              <div>
                                <p className="read-only-event-content-sub-title-primary" data-cy="para-">
                                  {taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false)}
                                </p>
                                {placeData?.additionalType.length > 0 && (
                                  <TreeSelectOption
                                    data-cy="treeselect-place-additional-type"
                                    style={{ marginBottom: '1rem' }}
                                    bordered={false}
                                    open={false}
                                    disabled
                                    treeData={treeTaxonomyOptions(
                                      allTaxonomyData,
                                      user,
                                      'Type',
                                      false,
                                      calendarContentLanguage,
                                    )}
                                    defaultValue={placeData?.additionalType?.map((type) => {
                                      return type?.entityId;
                                    })}
                                    tagRender={(props) => {
                                      const { label } = props;
                                      return <Tags data-cy={`tag-place-${label}`}>{label}</Tags>;
                                    }}
                                  />
                                )}
                              </div>
                            )}

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
                                          data-cy="para-place-dynamic-taxonomy-name">
                                          {bilingual({
                                            data: taxonomy?.name,
                                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                          })}
                                        </p>
                                        {initialTaxonomy?.includes(taxonomy?.id) && initialValues?.length > 0 && (
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
                                              return (
                                                <Tags data-cy={`tag-place-dynamic-taxonomy-${label}`}>{label}</Tags>
                                              );
                                            }}
                                          />
                                        )}
                                      </div>
                                    );
                                }
                              })}
                            </Col>

                            {checkIfFieldIsToBeDisplayed(
                              placeFormRequiredFieldNames.DISAMBIGUATING_DESCRIPTION,
                              placeData?.disambiguatingDescription,
                            ) && (
                              <Col span={24}>
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-place-disambiguating-description-title">
                                  {t('dashboard.places.readOnly.disambiguatingDescription')}
                                </p>

                                {Object.keys(placeData?.disambiguatingDescription ?? {})?.length > 0 && (
                                  <FallbackInjectorForReadOnlyPages
                                    fieldName="disambiguatingDescription"
                                    data={placeData?.disambiguatingDescription}>
                                    <p
                                      className="read-only-event-content"
                                      data-cy="para-place-disambiguating-description-french">
                                      {contentLanguageBilingual({
                                        data: placeData?.disambiguatingDescription,
                                        calendarContentLanguage,
                                        requiredLanguageKey: activeTabKey,
                                      })}
                                    </p>
                                  </FallbackInjectorForReadOnlyPages>
                                )}
                              </Col>
                            )}
                            {checkIfFieldIsToBeDisplayed(
                              placeFormRequiredFieldNames.DESCRIPTION,
                              placeData?.description,
                            ) && (
                              <Col span={24}>
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-place-description-title">
                                  {t('dashboard.places.readOnly.description')}
                                </p>
                                {Object.keys(placeData?.description ?? {})?.length > 0 && (
                                  <FallbackInjectorForReadOnlyPages
                                    fieldName="description"
                                    data={placeData?.description}>
                                    <p>
                                      <div
                                        className="read-only-place-description"
                                        dangerouslySetInnerHTML={{
                                          __html: contentLanguageBilingual({
                                            data: placeData?.description,
                                            calendarContentLanguage,
                                            requiredLanguageKey: activeTabKey,
                                          }),
                                        }}
                                        data-cy="div-place-description-french"
                                      />
                                    </p>
                                  </FallbackInjectorForReadOnlyPages>
                                )}
                              </Col>
                            )}
                            {checkIfFieldIsToBeDisplayed(placeFormRequiredFieldNames.IMAGE, mainImageData) &&
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
                            {imageGalleryData?.length > 0 && imageConfig.enableGallery && (
                              <Col span={24}>
                                <div>
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
                          {checkIfFieldIsToBeDisplayed(
                            placeFormRequiredFieldNames.STREET_ADDRESS,
                            placeData?.address?.streetAddress,
                          ) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-place-street-address-title">
                                {t('dashboard.places.readOnly.address.streetAddress')}
                              </p>
                              {Object.keys(placeData?.address?.streetAddress ?? {})?.length > 0 && (
                                <FallbackInjectorForReadOnlyPages
                                  fieldName="streetAddress"
                                  data={placeData?.address?.streetAddress}>
                                  <p className="read-only-event-content" data-cy="para-place-street-address-french">
                                    {contentLanguageBilingual({
                                      data: placeData?.address?.streetAddress,
                                      calendarContentLanguage,
                                      requiredLanguageKey: activeTabKey,
                                    })}
                                  </p>
                                </FallbackInjectorForReadOnlyPages>
                              )}
                            </Col>
                          )}

                          {checkIfFieldIsToBeDisplayed(
                            placeFormRequiredFieldNames.CITY,
                            placeData?.address?.addressLocality,
                          ) && (
                            <Col span={24}>
                              <p className="read-only-event-content-sub-title-primary" data-cy="para-place-city-title">
                                {t('dashboard.places.readOnly.address.city')}
                              </p>
                              {Object.keys(placeData?.address?.addressLocality ?? {})?.length > 0 && (
                                <ArtsDataLink>
                                  <span style={{ textDecoration: 'underline' }} data-cy="span-place-city">
                                    {contentLanguageBilingual({
                                      data: placeData?.address?.addressLocality,
                                      requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                                      calendarContentLanguage: calendarContentLanguage,
                                    })}
                                  </span>
                                  <LinkOutlined />
                                </ArtsDataLink>
                              )}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(
                            placeFormRequiredFieldNames.POSTAL_CODE,
                            placeData?.address?.postalCode,
                          ) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-place-postalcode-title">
                                {t('dashboard.places.readOnly.address.postalCode')}
                              </p>
                              <p className="read-only-event-content" data-cy="para-place-postalcode">
                                {placeData?.address?.postalCode}
                              </p>
                            </Col>
                          )}
                          <Col span={24}>
                            <Row justify={'space-between'} gutter={[48, 0]}>
                              {checkIfFieldIsToBeDisplayed(
                                placeFormRequiredFieldNames.PROVINCE,
                                placeData?.address?.addressRegion,
                              ) && (
                                <Col span={8}>
                                  <p
                                    className="read-only-event-content-sub-title-primary"
                                    data-cy="para-place-province-title">
                                    {t('dashboard.places.readOnly.address.province')}
                                  </p>
                                  {placeData?.address?.addressRegion && (
                                    <ArtsDataLink>
                                      <span style={{ textDecoration: 'underline' }} data-cy="span-place-province">
                                        {contentLanguageBilingual({
                                          data: placeData?.address?.addressRegion,
                                          requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                                          calendarContentLanguage: calendarContentLanguage,
                                        })}
                                      </span>
                                      <LinkOutlined />
                                    </ArtsDataLink>
                                  )}
                                </Col>
                              )}
                              {checkIfFieldIsToBeDisplayed(
                                placeFormRequiredFieldNames.COUNTRY,
                                placeData?.address?.addressCountry,
                              ) && (
                                <Col span={8}>
                                  <p
                                    className="read-only-event-content-sub-title-primary"
                                    data-cy="para-place-country-title">
                                    {t('dashboard.places.readOnly.address.country')}
                                  </p>
                                  {placeData?.address?.addressCountry && (
                                    <ArtsDataLink>
                                      <span style={{ textDecoration: 'underline' }} data-cy="span-place-country">
                                        {contentLanguageBilingual({
                                          data: placeData?.address?.addressCountry,
                                          requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                                          calendarContentLanguage: calendarContentLanguage,
                                        })}
                                      </span>
                                      <LinkOutlined />
                                    </ArtsDataLink>
                                  )}
                                </Col>
                              )}
                            </Row>
                          </Col>
                          {checkIfFieldIsToBeDisplayed(
                            placeFormRequiredFieldNames.COORDINATES,
                            placeData?.geoCoordinates,
                          ) && (
                            <Col span={10}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-place-coordinates-title">
                                {t('dashboard.places.readOnly.address.coordinates')}
                              </p>
                              {placeData?.geoCoordinates && (
                                <>
                                  <span className="read-only-event-content" data-cy="span-place-coordinates-latitude">
                                    {placeData?.geoCoordinates?.latitude}
                                    <br />
                                  </span>
                                  <span className="read-only-event-content" data-cy="span-place-coordinates-longitute">
                                    {placeData?.geoCoordinates?.longitude}
                                  </span>
                                </>
                              )}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(placeFormRequiredFieldNames.REGION, placeData?.regions) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-place-region-title">
                                {taxonomyDetails(allTaxonomyData?.data, user, 'Region', 'name', false)}
                              </p>
                              {placeData?.regions?.length > 0 && (
                                <TreeSelectOption
                                  data-cy="treeselect-place-region"
                                  style={{ marginBottom: '1rem' }}
                                  bordered={false}
                                  open={false}
                                  disabled
                                  treeData={treeTaxonomyOptions(
                                    allTaxonomyData,
                                    user,
                                    'Region',
                                    false,
                                    calendarContentLanguage,
                                  )}
                                  defaultValue={placeData?.regions?.map((type) => {
                                    return type?.entityId;
                                  })}
                                  tagRender={(props) => {
                                    const { label } = props;
                                    return <Tags data-cy={`tag-place-region-${label}`}>{label}</Tags>;
                                  }}
                                />
                              )}
                            </Col>
                          )}
                          {checkIfFieldIsToBeDisplayed(
                            placeFormRequiredFieldNames.OPENING_HOURS,
                            placeData?.openingHours,
                          ) && (
                            <Col span={24}>
                              <p
                                className="read-only-event-content-sub-title-primary"
                                data-cy="para-place-opening-hours-title">
                                {t('dashboard.places.readOnly.address.openingHoursLink')}
                              </p>
                              {placeData?.openingHours?.uri && (
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
                              )}
                            </Col>
                          )}
                        </Row>
                      </Col>
                      <Col className="top-level-column"></Col>
                    </Card>
                    {checkIfFieldIsToBeDisplayed(
                      placeFormRequiredFieldNames.PLACE_ACCESSIBILITY,
                      placeData?.accessibility,
                    ) && (
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
                                <p
                                  className="read-only-event-content-sub-title-primary"
                                  data-cy="para-place-accessibility-title">
                                  {taxonomyDetails(allTaxonomyData?.data, user, 'PlaceAccessibility', 'name', false)}
                                </p>
                                {placeData?.accessibility?.length > 0 && (
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
                                )}
                              </Col>
                            </Col>
                          </Row>
                        </Col>
                        <Col></Col>
                      </Card>
                    )}
                    {checkIfFieldIsToBeDisplayed(
                      placeFormRequiredFieldNames.CONTAINS_PLACE,
                      placeData?.containsPlace,
                    ) && (
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
                              {placeData?.containsPlace?.length > 0 && (
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
                                        onClickHandle={{
                                          navigationFlag: true,
                                          entityType: containsPlace?.type ?? taxonomyClass.PLACE,
                                          entityId: containsPlace?.key,
                                        }}
                                      />
                                    );
                                  })}
                                </Col>
                              )}
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
                                  onClickHandle={{
                                    navigationFlag: true,
                                    entityType: locationPlace?.type ?? taxonomyClass.PLACE,
                                    entityId: locationPlace?.key,
                                  }}
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
                                        Object.keys(place?.name ?? {})?.length > 0
                                          ? contentLanguageBilingual({
                                              data: place?.name,
                                              requiredLanguageKey: user?.interfaceLanguage?.toLowerCase(),
                                              calendarContentLanguage: calendarContentLanguage,
                                            })
                                          : typeof place?.name === 'string' && place?.name
                                      }
                                      icon={<EnvironmentOutlined style={{ color: '#607EFC' }} />}
                                      onClickHandle={{
                                        navigationFlag: true,
                                        entityType: place?.type ?? taxonomyClass.PLACE,
                                        entityId: place?._id,
                                      }}
                                      calendarContentLanguage={calendarContentLanguage}
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
                                      calendarContentLanguage={calendarContentLanguage}
                                      icon={<CalendarOutlined style={{ color: '#607EFC' }} />}
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
                                        onClickHandle={{
                                          navigationFlag: true,
                                          entityType: event?.type ?? taxonomyClass.EVENT,
                                          entityId: event?._id,
                                        }}
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
                </Col>
              </ReadOnlyPageTabLayout>
            </Row>
          </Col>
        </Row>
      </FeatureFlag>
    )
  );
}

export default PlaceReadOnly;
