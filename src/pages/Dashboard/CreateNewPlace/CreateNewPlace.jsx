import React, { useRef, useEffect, useState } from 'react';
import './createNewPlace.css';
import '../AddEvent/addEvent.css';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import { Button, Col, Form, Input, Popover, Row, message, notification, Dropdown } from 'antd';
import {
  LeftOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import PrimaryButton from '../../../components/Button/Primary';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { PathName } from '../../../constants/pathName';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import { useTranslation } from 'react-i18next';
import { loadArtsDataEntity } from '../../../services/artsData';
import {
  useAddPlaceMutation,
  useGetPlaceQuery,
  useLazyGetPlaceQuery,
  useUpdatePlaceMutation,
} from '../../../services/places';
import { useSelector } from 'react-redux';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import ContentLanguageInput from '../../../components/ContentLanguageInput';
import Card from '../../../components/Card/Common/Event';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../../components/BilingualInput';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import { placeTaxonomyMappedFieldTypes } from '../../../constants/placeMappedFieldTypes';
import { useGetAllTaxonomyQuery, useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import TreeSelectOption from '../../../components/TreeSelectOption';
import NoContent from '../../../components/NoContent/NoContent';
import {
  treeDynamicTaxonomyOptions,
  treeTaxonomyOptions,
} from '../../../components/TreeSelectOption/treeSelectOption.settings';
import Tags from '../../../components/Tags/Common/Tags';
import StyledInput from '../../../components/Input/Common';
import SelectionItem from '../../../components/List/SelectionItem';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import { useLazyGetEntitiesQuery } from '../../../services/entities';
import { entitiesClass } from '../../../constants/entitiesClass';
import { placesOptions } from '../../../components/Select/selectOption.settings';
import TextEditor from '../../../components/TextEditor';
import ImageUpload from '../../../components/ImageUpload';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import ChangeType from '../../../components/ChangeType';
import { addressTypeOptions, addressTypeOptionsFieldNames } from '../../../constants/addressTypeOptions';
import {
  placeAccessibilityTypeOptions,
  placeAccessibilityTypeOptionsFieldNames,
} from '../../../constants/placeAccessibilityTypeOptions';
import { urlProtocolCheck } from '../../../components/Input/Common/input.settings';
import { useAddImageMutation } from '../../../services/image';
import { usePrompt } from '../../../hooks/usePrompt';
import { useAddPostalAddressMutation } from '../../../services/postalAddress';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

const { TextArea } = Input;

function CreateNewPlace() {
  const timestampRef = useRef(Date.now()).current;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentCalendarData] = useOutletContext();
  const { user } = useSelector(getUserDetails);
  const { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const formFieldNames = {
    NAME: 'name',
    ENGLISH: 'english',
    FRENCH: 'french',
    TYPE: 'type',
    STREET_ADDRESS_ENGLISH: 'streetAddressEn',
    STREET_ADDRESS_FRENCH: 'streetAddress',
    CITY_FRENCH: 'addressLocality',
    CITY_ENGLISH: 'addressLocalityEn',
    POSTAL_CODE: 'postalCode',
    PROVINCE_ENGLISH: 'addressRegionEn',
    PROVINCE_FRENCH: 'addressRegion',
    COUNTRY_ENGLISH: 'addressCountryEn',
    COUNTRY_FRENCH: 'addressCountry',
    COORDINATES: 'coordinates',
    CONTAINED_IN_PLACE: 'containedInPlace',
    PLACE_ACCESSIBILITY: 'placeAccessibility',
    DISAMBIGUATING_DESCRIPTION_ENGLISH: 'englishDisambiguatingDescription',
    DISAMBIGUATING_DESCRIPTION_FRENCH: 'frenchDisambiguatingDescription',
    EDITOR_FRENCH: 'frenchEditor',
    EDITOR_ENGLISH: 'englishEditor',
    DRAGGER: 'dragger',
    DRAGGER_WRAP: 'draggerWrap',
    DYNAMIC_FIELS: 'dynamicFields',
    OPENING_HOURS: 'openingHours',
    ACCESSIBILITY_NOTE_WRAP: 'accessibilityNotewrap',
    ACCESSIBILITY_NOTE_ENGLISH: 'englishAccessibilityNote',
    ACCESSIBILITY_NOTE_FRENCH: 'frenchAccessibilityNote',
    REGION: 'region',
  };
  const placeId = searchParams.get('id');
  const artsDataId = location?.state?.data?.id ?? null;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { currentData: placeData, isLoading: isPlaceLoading } = useGetPlaceQuery(
    { placeId: placeId, calendarId, sessionId: timestampRef },
    { skip: placeId ? false : true },
  );
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PLACE,
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [getEntities] = useLazyGetEntitiesQuery({ sessionId: timestampRef });
  const [addImage, { error: isAddImageError, isLoading: addImageLoading }] = useAddImageMutation();
  const [addPlace, { isLoading: addPlaceLoading }] = useAddPlaceMutation();
  const [updatePlace, { isLoading: updatePlaceLoading }] = useUpdatePlaceMutation();
  const [addPostalAddress] = useAddPostalAddressMutation();
  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery({ sessionId: timestampRef });

  const reactQuillRefFr = useRef(null);
  const reactQuillRefEn = useRef(null);

  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState({
    containedInPlace: false,
  });
  const [containedInPlace, setContainedInPlace] = useState();
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [descriptionMinimumWordCount] = useState(1);
  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [addedFields, setAddedFields] = useState([]);
  const [scrollToSelectedField, setScrollToSelectedField] = useState();
  const [showDialog, setShowDialog] = useState(false);
  const [address, setAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  usePrompt(t('common.unsavedChanges'), showDialog);

  const addUpdatePlaceApiHandler = (placeObj) => {
    var promise = new Promise(function (resolve, reject) {
      if (!placeId || placeId === '') {
        if (artsDataId && artsData) {
          let artsDataSameAs = Array.isArray(artsData?.sameAs);
          if (artsDataSameAs)
            placeObj = {
              ...placeObj,
              sameAs: artsData?.sameAs,
            };
          else
            placeObj = {
              ...placeObj,
              sameAs: [artsData?.sameAs],
            };
        }
        addPlace({
          data: placeObj,
          calendarId,
        })
          .unwrap()
          .then((response) => {
            resolve(response?.id);
            notification.success({
              description: t('dashboard.places.createNew.addPlace.notification.addSuccess'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}`);
          })
          .catch((errorInfo) => {
            reject();
            console.log(errorInfo);
          });
      } else {
        placeObj = {
          ...placeObj,
          sameAs: placeData?.sameAs,
        };
        updatePlace({
          data: placeObj,
          calendarId,
          placeId,
        })
          .unwrap()
          .then(() => {
            resolve(placeId);
            notification.success({
              description: t('dashboard.places.createNew.addPlace.notification.editSuccess'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}`);
          })
          .catch((error) => {
            reject();
            console.log(error);
          });
      }
    });
    return promise;
  };

  const onSaveHandler = (event) => {
    event?.preventDefault();
    setShowDialog(false);
    var promise = new Promise(function (resolve, reject) {
      form
        .validateFields([
          ...new Set([
            formFieldNames.FRENCH,
            formFieldNames.ENGLISH,
            formFieldNames.TYPE,
            formFieldNames.STREET_ADDRESS_ENGLISH,
            formFieldNames.STREET_ADDRESS_FRENCH,
          ]),
        ])
        .then(() => {
          var values = form.getFieldsValue(true);
          let placeObj, languageKey, dynamicFields;
          if (calendarContentLanguage == contentLanguage.ENGLISH) languageKey = 'en';
          else if (calendarContentLanguage == contentLanguage.FRENCH) languageKey = 'fr';
          let postalObj = {
            addressCountry: { [languageKey]: values.addressCountry },
            addressLocality: { [languageKey]: values.addressLocality },
            addressRegion: { [languageKey]: values.addressRegion },
            postalCode: values.postalCode,
            streetAddress: { [languageKey]: values.streetAddress },
          };

          if (calendarContentLanguage == contentLanguage.BILINGUAL) {
            postalObj.addressCountry = {
              fr: values.addressCountry,
              en: values.addressCountryEn,
            };
            postalObj.addressLocality = {
              fr: values.addressLocality,
              en: values.addressLocalityEn,
            };
            postalObj.addressRegion = {
              fr: values.addressRegion,
              en: values.addressRegionEn,
            };
            postalObj.streetAddress = {
              fr: values.streetAddress,
              en: values.streetAddressEn,
            };
          }

          if (values?.dynamicFields) {
            dynamicFields = Object.keys(values?.dynamicFields)?.map((dynamicField) => {
              return {
                taxonomyId: dynamicField,
                conceptIds: values?.dynamicFields[dynamicField],
              };
            });
          }
          let imageCrop = form.getFieldValue('imageCrop');
          imageCrop = {
            large: {
              xCoordinate: imageCrop?.large?.x,
              yCoordinate: imageCrop?.large?.y,
              height: imageCrop?.large?.height,
              width: imageCrop?.large?.width,
            },
            thumbnail: {
              xCoordinate: imageCrop?.thumbnail?.x,
              yCoordinate: imageCrop?.thumbnail?.y,
              height: imageCrop?.thumbnail?.height,
              width: imageCrop?.thumbnail?.width,
            },
            original: {
              entityId: imageCrop?.original?.entityId,
              height: imageCrop?.original?.height,
              width: imageCrop?.original?.width,
            },
          };
          placeObj = {
            name: {
              en: values?.english,
              fr: values?.french,
            },
            description: {
              en: values?.englishEditor,
              fr: values?.frenchEditor,
            },
            openingHours: { uri: urlProtocolCheck(values?.openingHours) },
            containedInPlace: values?.containedInPlace ? { entityId: values?.containedInPlace } : undefined,
            geo: {
              latitude: values?.latitude,
              longitude: values?.longitude,
            },

            accessibilityNote: {
              fr: values?.frenchAccessibilityNote,
              en: values?.englishAccessibilityNote,
            },
            accessibility: values?.placeAccessibility
              ? values?.placeAccessibility.map((item) => {
                  const obj = {
                    entityId: item,
                  };
                  return obj;
                })
              : undefined,
            regions: values?.region
              ? values.region.map((item) => {
                  const obj = {
                    entityId: item,
                  };
                  return obj;
                })
              : undefined,
            additionalType: values?.type
              ? values?.type.map((item) => {
                  const obj = {
                    entityId: item,
                  };
                  return obj;
                })
              : undefined,
            disambiguatingDescription: {
              fr: values.frenchDisambiguatingDescription,
              en: values.englishDisambiguatingDescription,
            },
            ...(values?.dynamicFields && { dynamicFields }),
          };
          if (values?.dragger?.length > 0 && values?.dragger[0]?.originFileObj) {
            const formdata = new FormData();
            formdata.append('file', values?.dragger[0].originFileObj);
            formdata &&
              addImage({ data: formdata, calendarId })
                .unwrap()
                .then((response) => {
                  if (featureFlags.imageCropFeature) {
                    let entityId = response?.data?.original?.entityId;
                    imageCrop = {
                      ...imageCrop,
                      original: {
                        ...imageCrop?.original,
                        entityId,
                      },
                    };
                  } else
                    imageCrop = {
                      ...imageCrop,
                      original: {
                        ...imageCrop?.original,
                        entityId: response?.data?.original?.entityId,
                        height: response?.data?.height,
                        width: response?.data?.width,
                      },
                    };
                  placeObj['image'] = imageCrop;
                  addPostalAddress({ data: postalObj, calendarId })
                    .unwrap()
                    .then((response) => {
                      if (response && response?.statusCode == 202) {
                        addUpdatePlaceApiHandler(placeObj)
                          .then((id) => resolve(id))
                          .catch((error) => {
                            reject();
                            console.log(error);
                          });
                      }
                    })
                    .catch((error) => console.log(error));
                })
                .catch((error) => {
                  console.log(error);
                  const element = document.getElementsByClassName(formFieldNames.DRAGGER_WRAP);
                  element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                });
          } else {
            if (values?.draggerWrap) {
              if (values?.dragger && values?.dragger?.length == 0) placeObj['image'] = null;
              else placeObj['image'] = imageCrop;
            }

            addPostalAddress({ data: postalObj, calendarId })
              .unwrap()
              .then((response) => {
                if (response && response?.statusCode == 202) {
                  addUpdatePlaceApiHandler(placeObj)
                    .then((id) => resolve(id))
                    .catch((error) => {
                      reject();
                      console.log(error);
                    });
                }
              })
              .catch((error) => console.log(error));
          }
        })
        .catch((error) => {
          console.log(error);
          message.warning({
            duration: 10,
            maxCount: 1,
            key: 'place-save-as-warning',
            content: (
              <>
                {t('dashboard.places.createNew.addPlace.notification.saveError')} &nbsp;
                <Button
                  type="text"
                  icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                  onClick={() => message.destroy('place-save-as-warning')}
                />
              </>
            ),
            icon: <ExclamationCircleOutlined />,
          });
        });
    });

    return promise;
  };

  const handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => {
        form.setFieldsValue({
          address: results[0]?.formatted_address,
          addressCountry: results[0].address_components.find((item) => item.types.includes('country'))?.long_name,
          addressCountryEn: results[0].address_components.find((item) => item.types.includes('country'))?.long_name,
          addressLocality: results[0].address_components.find((item) => item.types.includes('locality'))?.long_name,
          addressLocalityEn: results[0].address_components.find((item) => item.types.includes('locality'))?.long_name,
          addressRegion: results[0].address_components.find((item) =>
            item.types.includes('administrative_area_level_1'),
          )?.short_name,
          addressRegionEn: results[0].address_components.find((item) =>
            item.types.includes('administrative_area_level_1'),
          )?.short_name,
          postalCode: results[0].address_components.find((item) => item.types.includes('postal_code'))?.long_name,
        });
        let streetNumber =
          results[0].address_components.find((item) => item.types.includes('street_number'))?.long_name ?? null;
        let streetName = results[0].address_components.find((item) => item.types.includes('route'))?.long_name ?? null;
        let streetAddress = streetNumber + ' ' + streetName;
        if (streetNumber && streetName) streetAddress = streetNumber + ' ' + streetName;
        else if (streetNumber && !streetName) streetAddress = streetNumber;
        else if (!streetNumber && streetName) streetAddress = streetName;
        else if (!streetNumber && !streetName) streetAddress = null;
        form.setFieldsValue({
          streetAddress: streetAddress,
          streetAddressEn: streetAddress,
        });
        return getLatLng(results[0]);
      })
      .then((latLng) => {
        form.setFieldsValue({
          latitude: '' + latLng.lat,
          longitude: '' + latLng.lng,
          coordinates: latLng.lat + ',' + latLng.lng,
        });
      })
      .catch((error) => console.error(error));
    setDropdownOpen(false);
  };

  const handleChange = (address) => {
    if (address === '') setDropdownOpen(false);
    else setDropdownOpen(true);
    setAddress(address);
  };

  const placesSearch = (inputValue = '') => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    getEntities({ searchKey: inputValue, classes: decodeURIComponent(query.toString()), calendarId })
      .unwrap()
      .then((response) => {
        setAllPlacesList(placesOptions(response, user, calendarContentLanguage));
      })
      .catch((error) => console.log(error));
  };

  const addFieldsHandler = (fieldNames) => {
    let array = addedFields?.concat(fieldNames);
    array = [...new Set(array)];
    setAddedFields(array);
    setScrollToSelectedField(array?.at(-1));
  };

  useEffect(() => {
    if (addedFields?.length > 0) {
      const element = document.getElementsByClassName(scrollToSelectedField);
      element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [addedFields]);

  console.log(artsData);

  useEffect(() => {
    if (calendarId && placeData && currentCalendarData) {
      let initialAddedFields = [],
        initialPlaceAccessibiltiy = [],
        initialPlace;
      if (routinghandler(user, calendarId, placeData?.createdByUserId, null, true)) {
        if (placeData?.containedInPlace?.entityId) {
          getPlace({ placeId: placeData?.containedInPlace?.entityId, calendarId })
            .unwrap()
            .then((response) => {
              if (response?.accessibility?.length > 0) {
                getAllTaxonomy({
                  calendarId,
                  search: '',
                  taxonomyClass: taxonomyClass.PLACE,
                  includeConcepts: true,
                  sessionId: timestampRef,
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
                    initialPlace = {
                      ...response,
                      ['accessibility']: initialPlaceAccessibiltiy,
                    };
                    setContainedInPlace(placesOptions([initialPlace], user, calendarContentLanguage)[0]);
                  })
                  .catch((error) => console.log(error));
              } else {
                initialPlace = {
                  ...response,
                  ['accessibility']: [],
                };
                setContainedInPlace(placesOptions([response], user, calendarContentLanguage)[0]);
              }
            })
            .catch((error) => console.log(error));
          form.setFieldValue(formFieldNames.CONTAINED_IN_PLACE, placeData?.containedInPlace?.entityId);
        }
        if (placeData?.image) {
          form.setFieldsValue({
            imageCrop: {
              large: {
                x: placeData?.image?.large?.xCoordinate,
                y: placeData?.image?.large?.yCoordinate,
                height: placeData?.image?.large?.height,
                width: placeData?.image?.large?.width,
              },
              original: {
                entityId: placeData?.image?.original?.entityId ?? null,
                height: placeData?.image?.original?.height,
                width: placeData?.image?.original?.width,
              },
              thumbnail: {
                x: placeData?.image?.thumbnail?.xCoordinate,
                y: placeData?.image?.thumbnail?.yCoordinate,
                height: placeData?.image?.thumbnail?.height,
                width: placeData?.image?.thumbnail?.width,
              },
            },
          });
        }
        if (placeData?.openingHours) initialAddedFields = initialAddedFields?.concat(formFieldNames?.OPENING_HOURS);
        if (placeData?.accessibilityNote)
          initialAddedFields = initialAddedFields?.concat(formFieldNames?.ACCESSIBILITY_NOTE_WRAP);
        form.setFieldsValue({
          latitude: placeData.geoCoordinates && '' + placeData.geoCoordinates.latitude,
          longitude: placeData.geoCoordinates && '' + placeData.geoCoordinates.longitude,
          coordinates: placeData.geoCoordinates.latitude + ',' + placeData.geoCoordinates.longitude,
        });
        setAddedFields(initialAddedFields);
      } else
        window.location.replace(`${location?.origin}${PathName.Dashboard}/${calendarId}${PathName.Places}/${placeId}`);
    }
  }, [isPlaceLoading, currentCalendarData]);

  useEffect(() => {
    if (artsDataId) {
      setArtsDataLoading(true);
      loadArtsDataEntity({ entityId: artsDataId })
        .then((response) => {
          setArtsData(response?.data[0]);
          setArtsDataLoading(false);
        })
        .catch((error) => {
          setArtsDataLoading(false);
          console.log(error);
        });
    } else if (location?.state?.name)
      form.setFieldValue({
        name: {
          fr: location?.state?.name,
          en: location?.state?.name,
        },
      });

    placesSearch('');
  }, []);

  return !isPlaceLoading && !artsDataLoading && !taxonomyLoading ? (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <div className="add-edit-wrapper add-organization-wrapper">
        <Form form={form} layout="vertical" name="organization">
          <Row gutter={[32, 2]}>
            <Col span={24}>
              <Row justify="space-between">
                <Col>
                  <div className="button-container">
                    <Button
                      type="link"
                      onClick={() => navigate(-1)}
                      icon={<LeftOutlined style={{ marginRight: '17px' }} />}>
                      {t('dashboard.places.createNew.search.breadcrumb')}
                    </Button>
                  </div>
                </Col>
                <Col>
                  <div className="add-event-button-wrap">
                    <Form.Item>
                      <PrimaryButton
                        label={t('dashboard.events.addEditEvent.saveOptions.save')}
                        onClick={(e) => onSaveHandler(e)}
                        disabled={addImageLoading || addPlaceLoading || updatePlaceLoading ? true : false}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col>
              <div className="add-edit-event-heading">
                <h4>
                  {placeId
                    ? t('dashboard.places.createNew.addPlace.editPlace')
                    : t('dashboard.places.createNew.addPlace.newPlace')}
                </h4>
              </div>
            </Col>
          </Row>
          <Card>
            <>
              {artsDataLinkChecker(placeData?.sameAs) && (
                <Row>
                  <Col span={24}>
                    <p className="add-entity-label">
                      {t('dashboard.organization.createNew.addOrganization.dataSource')}
                    </p>
                  </Col>
                  <Col span={24}>
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
                  <Col span={24}>
                    <div style={{ display: 'inline' }}>
                      <span className="add-event-date-heading">
                        {t('dashboard.places.createNew.addPlace.question.firstPart')}
                      </span>
                      <span
                        className="add-event-date-heading"
                        style={{
                          color: '#1b3de6',
                          textDecoration: 'underline',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.Search}`);
                        }}>
                        {t('dashboard.places.createNew.addPlace.question.secondPart')}
                      </span>
                      <span className="add-event-date-heading">
                        {t('dashboard.places.createNew.addPlace.question.thirdPart')}
                      </span>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div>
                      <br />
                    </div>
                  </Col>
                </Row>
              )}
              <Form.Item label={t('dashboard.places.createNew.addPlace.name')} required={true}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.name}>
                    <Form.Item
                      name={formFieldNames.FRENCH}
                      key={contentLanguage.FRENCH}
                      initialValue={placeData?.name?.fr}
                      dependencies={[formFieldNames.ENGLISH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.ENGLISH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name={formFieldNames.ENGLISH}
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.name?.en}
                      dependencies={[formFieldNames.FRENCH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.FRENCH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>

              <Form.Item
                name={formFieldNames.TYPE}
                label={taxonomyDetails(allTaxonomyData?.data, user, placeTaxonomyMappedFieldTypes.TYPE, 'name', false)}
                initialValue={placeData?.additionalType?.map((type) => {
                  return type?.entityId;
                })}
                required={true}>
                <TreeSelectOption
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderEventType')}
                  allowClear
                  treeDefaultExpandAll
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={treeTaxonomyOptions(
                    allTaxonomyData,
                    user,
                    placeTaxonomyMappedFieldTypes.TYPE,
                    false,
                    calendarContentLanguage,
                  )}
                  tagRender={(props) => {
                    const { label, closable, onClose } = props;
                    return (
                      <Tags
                        closable={closable}
                        onClose={onClose}
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
                />
              </Form.Item>
              <Form.Item
                label={t('dashboard.places.createNew.addPlace.disambiguatingDescription.disambiguatingDescription')}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.name}>
                    <Form.Item
                      name={formFieldNames.DISAMBIGUATING_DESCRIPTION_FRENCH}
                      key={contentLanguage.FRENCH}
                      initialValue={placeData?.name?.fr}
                      dependencies={[formFieldNames.DISAMBIGUATING_DESCRIPTION_ENGLISH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.DISAMBIGUATING_DESCRIPTION_ENGLISH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t(
                          'dashboard.places.createNew.addPlace.disambiguatingDescription.placeholder.french',
                        )}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name={formFieldNames.DISAMBIGUATING_DESCRIPTION_ENGLISH}
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.name?.en}
                      dependencies={[formFieldNames.DISAMBIGUATING_DESCRIPTION_FRENCH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.DISAMBIGUATING_DESCRIPTION_FRENCH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t(
                          'dashboard.places.createNew.addPlace.disambiguatingDescription.placeholder.english',
                        )}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>
              <Form.Item label={t('dashboard.places.createNew.addPlace.description.description')}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.description}>
                    <TextEditor
                      formName={formFieldNames.EDITOR_FRENCH}
                      key={contentLanguage.FRENCH}
                      calendarContentLanguage={calendarContentLanguage}
                      initialValue={placeData?.description?.fr}
                      dependencies={[formFieldNames.EDITOR_ENGLISH]}
                      currentReactQuillRef={reactQuillRefFr}
                      editorLanguage={'fr'}
                      placeholder={t('dashboard.events.addEditEvent.otherInformation.description.frenchPlaceholder')}
                      descriptionMinimumWordCount={descriptionMinimumWordCount}
                      rules={[
                        () => ({
                          validator() {
                            if (
                              reactQuillRefFr?.current?.unprivilegedEditor?.getLength() > 1 ||
                              reactQuillRefEn?.current?.unprivilegedEditor?.getLength() > 1
                            ) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(
                                new Error(
                                  calendarContentLanguage === contentLanguage.ENGLISH ||
                                  calendarContentLanguage === contentLanguage.FRENCH
                                    ? t(
                                        'dashboard.events.addEditEvent.validations.otherInformation.unilingualEmptyDescription',
                                      )
                                    : calendarContentLanguage === contentLanguage.BILINGUAL &&
                                      t('dashboard.events.addEditEvent.validations.otherInformation.emptyDescription', {
                                        wordCount: descriptionMinimumWordCount,
                                      }),
                                ),
                              );
                          },
                        }),
                        () => ({
                          validator() {
                            if (
                              reactQuillRefFr?.current?.unprivilegedEditor
                                ?.getText()
                                .split(' ')
                                ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                            ) {
                              return Promise.resolve();
                            } else if (
                              reactQuillRefEn?.current?.unprivilegedEditor
                                ?.getText()
                                .split(' ')
                                ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                            )
                              return Promise.resolve();
                            else
                              return Promise.reject(
                                new Error(
                                  calendarContentLanguage === contentLanguage.ENGLISH ||
                                  calendarContentLanguage === contentLanguage.FRENCH
                                    ? t(
                                        'dashboard.events.addEditEvent.validations.otherInformation.unilingualDescriptionShort',
                                      )
                                    : calendarContentLanguage === contentLanguage.BILINGUAL &&
                                      t('dashboard.events.addEditEvent.validations.otherInformation.frenchShort'),
                                ),
                              );
                          },
                        }),
                      ]}
                    />

                    <TextEditor
                      formName={formFieldNames.EDITOR_ENGLISH}
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.description?.en}
                      calendarContentLanguage={calendarContentLanguage}
                      dependencies={[formFieldNames.EDITOR_FRENCH]}
                      currentReactQuillRef={reactQuillRefEn}
                      editorLanguage={'en'}
                      placeholder={t('dashboard.events.addEditEvent.otherInformation.description.englishPlaceholder')}
                      descriptionMinimumWordCount={descriptionMinimumWordCount}
                      rules={[
                        () => ({
                          validator() {
                            if (
                              reactQuillRefFr?.current?.unprivilegedEditor?.getLength() > 1 ||
                              reactQuillRefEn?.current?.unprivilegedEditor?.getLength() > 1
                            ) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(
                                new Error(
                                  calendarContentLanguage === contentLanguage.ENGLISH ||
                                  calendarContentLanguage === contentLanguage.FRENCH
                                    ? t(
                                        'dashboard.events.addEditEvent.validations.otherInformation.unilingualEmptyDescription',
                                      )
                                    : calendarContentLanguage === contentLanguage.BILINGUAL &&
                                      t('dashboard.events.addEditEvent.validations.otherInformation.emptyDescription', {
                                        wordCount: descriptionMinimumWordCount,
                                      }),
                                ),
                              );
                          },
                        }),
                        () => ({
                          validator() {
                            if (
                              reactQuillRefEn?.current?.unprivilegedEditor
                                ?.getText()
                                .split(' ')
                                ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                            ) {
                              return Promise.resolve();
                            } else if (
                              reactQuillRefFr?.current?.unprivilegedEditor
                                ?.getText()
                                .split(' ')
                                ?.filter((n) => n != '')?.length > descriptionMinimumWordCount
                            )
                              return Promise.resolve();
                            else
                              return Promise.reject(
                                new Error(
                                  calendarContentLanguage === contentLanguage.ENGLISH ||
                                  calendarContentLanguage === contentLanguage.FRENCH
                                    ? t(
                                        'dashboard.events.addEditEvent.validations.otherInformation.unilingualDescriptionShort',
                                      )
                                    : calendarContentLanguage === contentLanguage.BILINGUAL &&
                                      t('dashboard.events.addEditEvent.validations.otherInformation.englishShort'),
                                ),
                              );
                          },
                        }),
                      ]}
                    />
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>
              <Form.Item
                label={t('dashboard.places.createNew.addPlace.image.image')}
                name={formFieldNames.DRAGGER_WRAP}
                className="draggerWrap"
                initialValue={placeData?.image && placeData?.image?.original?.uri}
                {...(isAddImageError && {
                  help: t('dashboard.events.addEditEvent.validations.errorImage'),
                  validateStatus: 'error',
                })}
                rules={[
                  ({ getFieldValue }) => ({
                    validator() {
                      if (
                        (getFieldValue(formFieldNames.DRAGGER) != undefined &&
                          getFieldValue(formFieldNames.DRAGGER)?.length > 0) ||
                        (placeData?.image?.original?.uri && !getFieldValue(formFieldNames.DRAGGER)) ||
                        (placeData?.image?.original?.uri && getFieldValue(formFieldNames.DRAGGER)?.length > 0)
                      ) {
                        return Promise.resolve();
                      } else
                        return Promise.reject(
                          new Error(t('dashboard.events.addEditEvent.validations.otherInformation.emptyImage')),
                        );
                    },
                  }),
                ]}>
                <Row>
                  <Col>
                    <p className="add-event-date-heading">
                      {t('dashboard.places.createNew.addPlace.image.subheading')}
                    </p>
                  </Col>
                </Row>
                <ImageUpload
                  imageUrl={placeData?.image?.large?.uri}
                  originalImageUrl={placeData?.image?.original?.uri}
                  imageReadOnly={false}
                  preview={true}
                  setImageCropOpen={setImageCropOpen}
                  imageCropOpen={imageCropOpen}
                  form={form}
                  eventImageData={placeData?.image}
                  largeAspectRatio={
                    currentCalendarData?.imageConfig?.length > 0
                      ? currentCalendarData?.imageConfig[0]?.large?.aspectRatio
                      : null
                  }
                  thumbnailAspectRatio={
                    currentCalendarData?.imageConfig?.length > 0
                      ? currentCalendarData?.imageConfig[0]?.thumbnail?.aspectRatio
                      : null
                  }
                  isCrop={featureFlags.imageCropFeature}
                />
              </Form.Item>
              {allTaxonomyData?.data?.map((taxonomy, index) => {
                if (taxonomy?.isDynamicField) {
                  let initialValues;
                  placeData?.dynamicFields?.forEach((dynamicField) => {
                    if (taxonomy?.id === dynamicField?.taxonomyId) initialValues = dynamicField?.conceptIds;
                  });
                  return (
                    <Form.Item
                      key={index}
                      name={[formFieldNames.DYNAMIC_FIELS, taxonomy?.id]}
                      label={bilingual({
                        en: taxonomy?.name?.en,
                        fr: taxonomy?.name?.fr,
                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                      })}
                      initialValue={initialValues}>
                      <TreeSelectOption
                        allowClear
                        treeDefaultExpandAll
                        notFoundContent={<NoContent />}
                        clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                        treeData={treeDynamicTaxonomyOptions(taxonomy?.concept, user, calendarContentLanguage)}
                        tagRender={(props) => {
                          const { label, closable, onClose } = props;
                          return (
                            <Tags
                              closable={closable}
                              onClose={onClose}
                              closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                              {label}
                            </Tags>
                          );
                        }}
                      />
                    </Form.Item>
                  );
                }
              })}
            </>
            <></>
          </Card>
          <Card title={t('dashboard.places.createNew.addPlace.address.address')}>
            <>
              <Row>
                <Col>
                  <p className="add-event-date-heading">
                    {t('dashboard.places.createNew.addPlace.address.subheading')}
                  </p>
                </Col>
              </Row>
              <Form.Item name="addressSearch">
                <PlacesAutocomplete value={address} onChange={handleChange} onSelect={handleSelect}>
                  {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                    <Dropdown
                      open={dropdownOpen}
                      overlayClassName="filter-sort-dropdown-wrapper"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      menu={{
                        items: suggestions?.map((suggestion, index) => {
                          return {
                            key: index,
                            label: (
                              <div {...getSuggestionItemProps(suggestion)} key={index}>
                                <span>{suggestion.description}</span>
                              </div>
                            ),
                          };
                        }),
                        selectable: true,
                      }}
                      trigger={['click']}>
                      <StyledInput
                        autoComplete="off"
                        {...getInputProps({
                          placeholder: t('dashboard.events.addEditEvent.location.quickCreatePlace.searchPlaceholder'),
                        })}
                        prefix={
                          <SearchOutlined
                            className="events-search-icon"
                            style={{ color: '#B6C1C9', fontSize: '18px' }}
                          />
                        }
                      />
                    </Dropdown>
                  )}
                </PlacesAutocomplete>
              </Form.Item>
              <Form.Item label={t('dashboard.places.createNew.addPlace.address.streetAddress')} required={true}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.name}>
                    <Form.Item
                      name={formFieldNames.STREET_ADDRESS_FRENCH}
                      key={contentLanguage.FRENCH}
                      initialValue={placeData?.name?.fr}
                      dependencies={[formFieldNames.STREET_ADDRESS_ENGLISH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.STREET_ADDRESS_ENGLISH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.places.createNew.addPlace.address.streetAddressPlaceholder.french')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name={formFieldNames.STREET_ADDRESS_ENGLISH}
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.name?.en}
                      dependencies={[formFieldNames.STREET_ADDRESS_FRENCH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.STREET_ADDRESS_FRENCH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.places.createNew.addPlace.address.streetAddressPlaceholder.english')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>
              <Form.Item label={t('dashboard.places.createNew.addPlace.address.city.city')}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.name}>
                    <Form.Item
                      name={formFieldNames.CITY_FRENCH}
                      key={contentLanguage.FRENCH}
                      initialValue={placeData?.name?.fr}
                      dependencies={[formFieldNames.CITY_ENGLISH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.CITY_ENGLISH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.places.createNew.addPlace.address.city.placeholder.french')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name={formFieldNames.CITY_ENGLISH}
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.name?.en}
                      dependencies={[formFieldNames.CITY_FRENCH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.CITY_FRENCH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.places.createNew.addPlace.address.city.placeholder.english')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>
              <Form.Item
                name={formFieldNames.POSTAL_CODE}
                initialValue={placeData?.address?.postalCode}
                label={t('dashboard.places.createNew.addPlace.address.postalCode.postalCode')}
                rules={[
                  {
                    type: 'url',
                    message: t('dashboard.events.addEditEvent.validations.url'),
                  },
                ]}>
                <StyledInput placeholder={t('dashboard.places.createNew.addPlace.address.postalCode.placeholder')} />
              </Form.Item>
              <Row gutter={[16, 0]}>
                <Col span={12}>
                  <Form.Item label={t('dashboard.places.createNew.addPlace.address.province.province')}>
                    <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                      <BilingualInput fieldData={placeData?.name}>
                        <Form.Item
                          name={formFieldNames.PROVINCE_FRENCH}
                          key={contentLanguage.FRENCH}
                          initialValue={placeData?.name?.fr}
                          dependencies={[formFieldNames.PROVINCE_ENGLISH]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value || getFieldValue(formFieldNames.PROVINCE_ENGLISH)) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.places.createNew.addPlace.address.province.placeholder.french')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                        <Form.Item
                          name={formFieldNames.PROVINCE_ENGLISH}
                          key={contentLanguage.ENGLISH}
                          initialValue={placeData?.name?.en}
                          dependencies={[formFieldNames.PROVINCE_FRENCH]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value || getFieldValue(formFieldNames.PROVINCE_FRENCH)) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.places.createNew.addPlace.address.province.placeholder.english')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                      </BilingualInput>
                    </ContentLanguageInput>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t('dashboard.places.createNew.addPlace.address.country.country')}>
                    <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                      <BilingualInput fieldData={placeData?.name}>
                        <Form.Item
                          name={formFieldNames.COUNTRY_FRENCH}
                          key={contentLanguage.FRENCH}
                          initialValue={placeData?.name?.fr}
                          dependencies={[formFieldNames.COUNTRY_ENGLISH]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value || getFieldValue(formFieldNames.COUNTRY_ENGLISH)) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.places.createNew.addPlace.address.country.placeholder.french')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                        <Form.Item
                          name={formFieldNames.COUNTRY_ENGLISH}
                          key={contentLanguage.ENGLISH}
                          initialValue={placeData?.name?.en}
                          dependencies={[formFieldNames.COUNTRY_FRENCH]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value || getFieldValue(formFieldNames.COUNTRY_FRENCH)) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.places.createNew.addPlace.address.country.placeholder.english')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                      </BilingualInput>
                    </ContentLanguageInput>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name={formFieldNames.COORDINATES}
                label={t('dashboard.places.createNew.addPlace.address.coordinates.coordinates')}>
                <StyledInput />
              </Form.Item>
              <Form.Item
                name={formFieldNames.REGION}
                label={taxonomyDetails(
                  allTaxonomyData?.data,
                  user,
                  placeTaxonomyMappedFieldTypes.REGION,
                  'name',
                  false,
                )}
                initialValue={placeData?.regions?.map((type) => {
                  return type?.entityId;
                })}>
                <TreeSelectOption
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderEventType')}
                  allowClear
                  treeDefaultExpandAll
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={treeTaxonomyOptions(
                    allTaxonomyData,
                    user,
                    placeTaxonomyMappedFieldTypes.REGION,
                    false,
                    calendarContentLanguage,
                  )}
                  tagRender={(props) => {
                    const { label, closable, onClose } = props;
                    return (
                      <Tags
                        closable={closable}
                        onClose={onClose}
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
                />
              </Form.Item>
              <Form.Item
                name={formFieldNames.OPENING_HOURS}
                className={`${formFieldNames.OPENING_HOURS} subheading-wrap`}
                label={t('dashboard.places.createNew.addPlace.address.openingHours.openingHours')}
                initialValue={placeData?.openingHours?.uri}
                style={{
                  display: !addedFields?.includes(addressTypeOptionsFieldNames.OPENING_HOURS) && 'none',
                }}
                rules={[
                  {
                    type: 'url',
                    message: t('dashboard.events.addEditEvent.validations.url'),
                  },
                ]}>
                <StyledInput
                  addonBefore="https://"
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderWebsite')}
                />
              </Form.Item>
            </>
            <Form.Item label={t('dashboard.places.createNew.addPlace.addMoreDetails')} style={{ lineHeight: '2.5' }}>
              {addedFields?.includes(addressTypeOptionsFieldNames.OPENING_HOURS) ? (
                <NoContent label={t('dashboard.events.addEditEvent.allDone')} />
              ) : (
                addressTypeOptions.map((type) => {
                  return (
                    <ChangeType
                      key={type.type}
                      primaryIcon={<PlusOutlined />}
                      disabled={type.disabled}
                      label={type.label}
                      promptText={type.tooltip}
                      secondaryIcon={<InfoCircleOutlined />}
                      onClick={() => addFieldsHandler(type?.fieldNames)}
                    />
                  );
                })
              )}
            </Form.Item>
          </Card>
          <Card title={t('dashboard.places.createNew.addPlace.containedInPlace.containedInPlace')}>
            <>
              <Row>
                <Col>
                  <p className="add-event-date-heading">
                    {t('dashboard.places.createNew.addPlace.containedInPlace.subheading')}
                  </p>
                </Col>
              </Row>
              <Form.Item
                name={formFieldNames.CONTAINED_IN_PLACE}
                className="subheading-wrap"
                // initialValue={initialPlace && initialPlace[0]?.id}
                label={t('dashboard.places.createNew.addPlace.containedInPlace.addPlace')}>
                <Popover
                  open={isPopoverOpen.containedInPlace}
                  onOpenChange={(open) => setIsPopoverOpen({ ...isPopoverOpen, containedInPlace: open })}
                  overlayClassName="event-popover"
                  placement="bottom"
                  autoAdjustOverflow={false}
                  getPopupContainer={(trigger) => trigger.parentNode}
                  trigger={['click']}
                  content={
                    <div>
                      <div className="search-scrollable-content">
                        {allPlacesList?.length > 0 ? (
                          allPlacesList?.map((place, index) => (
                            <div
                              key={index}
                              className={`event-popover-options ${
                                containedInPlace?.value == place?.value ? 'event-popover-options-active' : null
                              }`}
                              onClick={() => {
                                setContainedInPlace(place);
                                form.setFieldValue(formFieldNames.CONTAINED_IN_PLACE, place?.value);
                                setIsPopoverOpen({
                                  ...isPopoverOpen,
                                  containedInPlace: false,
                                });
                              }}>
                              {place?.label}
                            </div>
                          ))
                        ) : (
                          <NoContent />
                        )}
                      </div>
                    </div>
                  }>
                  <EventsSearch
                    style={{ borderRadius: '4px', width: '423px' }}
                    placeholder={t('dashboard.places.createNew.addPlace.containedInPlace.placeholder')}
                    onChange={(e) => {
                      placesSearch(e.target.value);
                      setIsPopoverOpen({ ...isPopoverOpen, containedInPlace: true });
                    }}
                    onClick={() => {
                      setIsPopoverOpen({ ...isPopoverOpen, containedInPlace: true });
                    }}
                  />
                </Popover>
                {containedInPlace && (
                  <SelectionItem
                    icon={containedInPlace?.label?.props?.icon}
                    name={containedInPlace?.name}
                    description={containedInPlace?.description}
                    itemWidth="100%"
                    postalAddress={containedInPlace?.postalAddress}
                    accessibility={containedInPlace?.accessibility}
                    openingHours={containedInPlace?.openingHours}
                    calendarContentLanguage={calendarContentLanguage}
                    bordered
                    closable
                    onClose={() => {
                      setContainedInPlace();
                      form.setFieldValue(formFieldNames.CONTAINED_IN_PLACE, undefined);
                    }}
                  />
                )}
              </Form.Item>
            </>
            <></>
          </Card>
          <Card title={t('dashboard.places.createNew.addPlace.venueAccessibility.venueAccessibility')}>
            <>
              <Row>
                <Col>
                  <p className="add-event-date-heading">
                    {t('dashboard.places.createNew.addPlace.venueAccessibility.subheading')}
                  </p>
                </Col>
              </Row>
              <Form.Item
                name={formFieldNames.PLACE_ACCESSIBILITY}
                style={{ width: '423px' }}
                label={taxonomyDetails(
                  allTaxonomyData?.data,
                  user,
                  placeTaxonomyMappedFieldTypes.PLACE_ACCESSIBILITY,
                  'name',
                  false,
                )}
                initialValue={placeData?.accessibility?.map((type) => {
                  return type?.entityId;
                })}>
                <TreeSelectOption
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderEventType')}
                  allowClear
                  treeDefaultExpandAll
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={treeTaxonomyOptions(
                    allTaxonomyData,
                    user,
                    placeTaxonomyMappedFieldTypes.PLACE_ACCESSIBILITY,
                    false,
                    calendarContentLanguage,
                  )}
                  tagRender={(props) => {
                    const { label, closable, onClose } = props;
                    return (
                      <Tags
                        closable={closable}
                        onClose={onClose}
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
                />
              </Form.Item>
              <Form.Item
                label={t('dashboard.places.createNew.addPlace.venueAccessibility.placeAccessibilityNote.note')}
                name={placeAccessibilityTypeOptionsFieldNames.ACCESSIBILITY_NOTE_WRAP}
                className={formFieldNames.ACCESSIBILITY_NOTE_WRAP}
                style={{
                  display:
                    !addedFields?.includes(placeAccessibilityTypeOptionsFieldNames.ACCESSIBILITY_NOTE_WRAP) && 'none',
                }}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.accessibilityNote}>
                    <Form.Item
                      name={formFieldNames.ACCESSIBILITY_NOTE_FRENCH}
                      initialValue={placeData?.accessibilityNote?.fr}
                      key={contentLanguage.FRENCH}>
                      <TextArea
                        autoComplete="off"
                        placeholder={t(
                          'dashboard.events.addEditEvent.eventAccessibility.placeHolderEventAccessibilityFrenchNote',
                        )}
                        style={{
                          borderRadius: '4px',
                          border: '4px solid #E8E8E8',
                          width: '423px',
                          resize: 'vertical',
                        }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name={formFieldNames.ACCESSIBILITY_NOTE_ENGLISH}
                      initialValue={placeData?.accessibilityNote?.en}
                      key={contentLanguage.ENGLISH}>
                      <TextArea
                        autoComplete="off"
                        placeholder={t(
                          'dashboard.places.createNew.addPlace.venueAccessibility.placeAccessibilityNote.tooltip',
                        )}
                        style={{
                          borderRadius: '4px',
                          border: '4px solid #E8E8E8',
                          width: '423px',
                          resize: 'vertical',
                        }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>
            </>
            <Form.Item label={t('dashboard.places.createNew.addPlace.addMoreDetails')} style={{ lineHeight: '2.5' }}>
              {addedFields?.includes(placeAccessibilityTypeOptionsFieldNames.ACCESSIBILITY_NOTE_WRAP) ? (
                <NoContent label={t('dashboard.events.addEditEvent.allDone')} />
              ) : (
                placeAccessibilityTypeOptions.map((type) => {
                  return (
                    <ChangeType
                      key={type.type}
                      primaryIcon={<PlusOutlined />}
                      disabled={type.disabled}
                      label={type.label}
                      promptText={type.tooltip}
                      secondaryIcon={<InfoCircleOutlined />}
                      onClick={() => addFieldsHandler(type?.fieldNames)}
                    />
                  );
                })
              )}
            </Form.Item>
          </Card>
        </Form>
      </div>
    </FeatureFlag>
  ) : (
    <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingIndicator />
    </div>
  );
}

export default CreateNewPlace;
