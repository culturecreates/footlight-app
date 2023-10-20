import React, { useRef, useEffect, useState, useCallback } from 'react';
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
import { loadArtsDataPlaceEntity } from '../../../services/artsData';
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
import { useAddPostalAddressMutation, useUpdatePostalAddressMutation } from '../../../services/postalAddress';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { placeFormRequiredFieldNames } from '../../../constants/placeFormRequiredFieldNames';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { userRoles } from '../../../constants/userRoles';
import { getExternalSourceId } from '../../../utils/getExternalSourceId';
import { sourceOptions } from '../../../constants/sourceOptions';

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
    CONTAINS_PLACE: 'containsPlace',
  };
  const placeId = searchParams.get('id');
  const artsDataId = location?.state?.data?.id ?? null;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let requiredFields = currentCalendarData?.formSchema?.filter((form) => form?.formName === 'Place');
  requiredFields = requiredFields && requiredFields?.length > 0 && requiredFields[0];
  let requiredFieldNames = requiredFields ? requiredFields?.requiredfields?.map((field) => field?.fieldName) : [];
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
  const [updatePostalAddress] = useUpdatePostalAddressMutation();

  const reactQuillRefFr = useRef(null);
  const reactQuillRefEn = useRef(null);

  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState({
    containedInPlace: false,
    containsPlace: false,
  });
  const [containedInPlace, setContainedInPlace] = useState();
  const [selectedContainsPlaces, setSelectedContainsPlaces] = useState([]);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [allPlacesArtsdataList, setAllPlacesArtsdataList] = useState([]);
  const [descriptionMinimumWordCount] = useState(1);
  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [addedFields, setAddedFields] = useState([]);
  const [scrollToSelectedField, setScrollToSelectedField] = useState();
  const [showDialog, setShowDialog] = useState(false);
  const [address, setAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');

  usePrompt(t('common.unsavedChanges'), showDialog);

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });
  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };
  const addUpdatePlaceApiHandler = (placeObj, postalObj) => {
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
        addPostalAddress({ data: postalObj, calendarId })
          .unwrap()
          .then((response) => {
            if (response && response?.statusCode == 202) {
              placeObj = {
                ...placeObj,
                postalAddressId: {
                  entityId: response?.id,
                },
              };
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
            }
          })
          .catch((error) => console.log(error));
      } else {
        placeObj = {
          ...placeObj,
          sameAs: placeData?.sameAs,
        };
        if (!placeData?.address) {
          addPostalAddress({ data: postalObj, calendarId })
            .unwrap()
            .then((response) => {
              if (response && response?.statusCode == 202) {
                placeObj = {
                  ...placeObj,
                  postalAddressId: {
                    entityId: response?.id,
                  },
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
            })
            .catch((error) => console.log(error));
        } else {
          updatePostalAddress({ data: postalObj, calendarId, id: placeData?.address?.id })
            .unwrap()
            .then((response) => {
              if (response && response?.statusCode == 202) {
                placeObj = {
                  ...placeObj,
                  postalAddressId: {
                    entityId: placeData?.address?.id,
                  },
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
            })
            .catch((error) => console.log(error));
        }
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
            formFieldNames.POSTAL_CODE,
          ]),
        ])
        .then(() => {
          var values = form.getFieldsValue(true);
          let placeObj,
            languageKey,
            dynamicFields,
            containedInPlaceObj,
            containsPlace = [];

          if (calendarContentLanguage == contentLanguage.ENGLISH) languageKey = 'en';
          else if (calendarContentLanguage == contentLanguage.FRENCH) languageKey = 'fr';
          let postalObj = {
            ...(values?.addressCountry && { addressCountry: { [languageKey]: values?.addressCountry } }),
            ...(values?.addressLocality && { addressLocality: { [languageKey]: values?.addressLocality } }),
            ...(values?.addressRegion && { addressRegion: { [languageKey]: values?.addressRegion } }),
            postalCode: values?.postalCode,
            ...(values?.streetAddress && { streetAddress: { [languageKey]: values?.streetAddress } }),
          };

          if (calendarContentLanguage == contentLanguage.BILINGUAL) {
            postalObj.addressCountry = {
              ...(values?.addressCountry && { fr: values.addressCountry, en: values.addressCountryEn }),
            };
            postalObj.addressLocality = {
              ...(values?.addressLocality && { fr: values.addressLocality, en: values.addressLocalityEn }),
            };
            postalObj.addressRegion = {
              ...(values?.addressRegion && { fr: values.addressRegion, en: values.addressRegionEn }),
            };
            postalObj.streetAddress = {
              ...(values?.streetAddress && { fr: values.streetAddress, en: values.streetAddressEn }),
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
          if (values?.containedInPlace || values?.containedInPlace?.length > 0) {
            if (containedInPlace?.source === sourceOptions.CMS)
              containedInPlaceObj = {
                entityId: values?.containedInPlace,
              };
            else if (containedInPlace?.source === sourceOptions.ARTSDATA)
              containedInPlaceObj = {
                uri: values?.containedInPlace,
              };
          }

          if (values?.containsPlace) {
            containsPlace = values?.containsPlace?.map((place) => {
              if (place?.source === sourceOptions.CMS)
                return {
                  entityId: place?.value,
                };
              else if (place?.source === sourceOptions.ARTSDATA)
                return {
                  uri: place?.uri,
                };
            });
          }

          placeObj = {
            name: {
              ...(values?.english && { en: values?.english }),
              ...(values?.french && { fr: values?.french }),
            },
            ...((values?.frenchEditor || values?.englishEditor) && {
              description: {
                en: values?.englishEditor,
                fr: values?.frenchEditor,
              },
            }),
            ...(values?.openingHours && { openingHours: { uri: urlProtocolCheck(values?.openingHours) } }),
            ...(values?.containedInPlace && {
              containedInPlace: containedInPlaceObj,
            }),
            geo: {
              latitude: values?.latitude,
              longitude: values?.longitude,
            },

            ...((values?.frenchAccessibilityNote || values?.englishAccessibilityNote) && {
              accessibilityNote: {
                fr: values?.frenchAccessibilityNote,
                en: values?.englishAccessibilityNote,
              },
            }),
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

            ...((values.frenchDisambiguatingDescription || values.englishDisambiguatingDescription) && {
              disambiguatingDescription: {
                fr: values.frenchDisambiguatingDescription,
                en: values.englishDisambiguatingDescription,
              },
            }),
            ...(values?.dynamicFields && { dynamicFields }),
            ...(values?.containsPlace && { containsPlace }),
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
                  addUpdatePlaceApiHandler(placeObj, postalObj)
                    .then((id) => resolve(id))
                    .catch((error) => {
                      reject();
                      console.log(error);
                    });
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

            addUpdatePlaceApiHandler(placeObj, postalObj)
              .then((id) => resolve(id))
              .catch((error) => {
                reject();
                console.log(error);
              });
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
    getEntities({
      searchKey: inputValue,
      classes: decodeURIComponent(query.toString()),
      calendarId,
      includeArtsdata: true,
    })
      .unwrap()
      .then((response) => {
        let containedInPlaceFilter = [];
        if (placeId) containedInPlaceFilter = response?.cms?.filter((place) => place?.id != placeId);
        else containedInPlaceFilter = response?.cms;

        setAllPlacesList(placesOptions(containedInPlaceFilter, user, calendarContentLanguage, sourceOptions.CMS));
        setAllPlacesArtsdataList(
          placesOptions(response?.artsdata, user, calendarContentLanguage, sourceOptions.ARTSDATA),
        );
      })
      .catch((error) => console.log(error));
  };

  const debounceSearchPlace = useCallback(useDebounce(placesSearch, SEARCH_DELAY), []);

  const addFieldsHandler = (fieldNames) => {
    let array = addedFields?.concat(fieldNames);
    array = [...new Set(array)];
    setAddedFields(array);
    setScrollToSelectedField(array?.at(-1));
  };

  const onValuesChangeHandler = () => {
    setShowDialog(true);
  };

  const getArtsDataPlace = (id) => {
    setArtsDataLoading(true);
    loadArtsDataPlaceEntity({ entityId: id })
      .then((response) => {
        if (response?.data?.length > 0) {
          setArtsData(response?.data[0]);
          form.setFieldsValue({
            latitude: response?.data[0]?.geo?.latitude && '' + response?.data[0]?.geo?.latitude,
            longitude: response?.data[0]?.geo?.longitude && '' + response?.data[0]?.geo?.longitude,
          });
        }
        setArtsDataLoading(false);
      })
      .catch((error) => {
        setArtsDataLoading(false);
        console.log(error);
      });
  };
  useEffect(() => {
    if (addedFields?.length > 0) {
      const element = document.getElementsByClassName(scrollToSelectedField);
      element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [addedFields]);

  useEffect(() => {
    if (selectedContainsPlaces) form.setFieldValue(formFieldNames.CONTAINS_PLACE, selectedContainsPlaces);
  }, [selectedContainsPlaces]);

  useEffect(() => {
    if (calendarId && placeData && currentCalendarData) {
      let initialAddedFields = [],
        initialPlaceAccessibiltiy = [],
        initialPlace;
      if (routinghandler(user, calendarId, placeData?.createdByUserId, null, true)) {
        if (placeData?.derivedFrom?.uri) {
          let sourceId = getExternalSourceId(placeData?.derivedFrom?.uri);
          getArtsDataPlace(sourceId);
        }
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
        if (placeData?.containsPlace?.length > 0) {
          let initialContainsPlace = placeData?.containsPlace?.map((place) => {
            return {
              disambiguatingDescription: place?.disambiguatingDescription,
              id: place?.id,
              name: place?.name,
              image: place?.image,
              uri: place?.derivedFrom?.uri,
            };
          });
          setSelectedContainsPlaces(
            placesOptions(initialContainsPlace, user, calendarContentLanguage, sourceOptions.CMS),
          );
        }
        if (placeData?.openingHours) initialAddedFields = initialAddedFields?.concat(formFieldNames?.OPENING_HOURS);
        if (placeData?.accessibilityNote)
          initialAddedFields = initialAddedFields?.concat(formFieldNames?.ACCESSIBILITY_NOTE_WRAP);
        form.setFieldsValue({
          latitude: placeData.geoCoordinates && '' + placeData.geoCoordinates.latitude,
          longitude: placeData.geoCoordinates && '' + placeData.geoCoordinates.longitude,
        });
        setAddedFields(initialAddedFields);
      } else
        window.location.replace(
          `${window.location?.origin}${PathName.Dashboard}/${calendarId}${PathName.Places}/${placeId}`,
        );
    }
  }, [isPlaceLoading, currentCalendarData]);

  useEffect(() => {
    if (artsDataId) {
      getArtsDataPlace(artsDataId);
    } else if (location?.state?.name) {
      form.setFieldsValue({
        french: location?.state?.name,
        english: location?.state?.name,
      });
    }

    placesSearch('');
  }, []);

  return !isPlaceLoading && !artsDataLoading && !taxonomyLoading ? (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <div className="add-edit-wrapper add-organization-wrapper">
        <Form form={form} layout="vertical" name="place" onValuesChange={onValuesChangeHandler}>
          <Row gutter={[32, 24]} className="add-edit-wrapper">
            <Col span={24}>
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
            </Col>
            <Card>
              <>
                {(artsDataLinkChecker(placeData?.sameAs) || artsDataLinkChecker(artsData?.sameAs)) && (
                  <Row>
                    <Col span={24}>
                      <p className="add-entity-label">
                        {t('dashboard.organization.createNew.addOrganization.dataSource')}
                      </p>
                    </Col>
                    <Col span={24}>
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
                <Form.Item label={t('dashboard.places.createNew.addPlace.name.name')} required={true}>
                  <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                    <BilingualInput fieldData={placeData?.name ? placeData?.name : artsDataId && artsData?.name}>
                      <Form.Item
                        name={formFieldNames.FRENCH}
                        key={contentLanguage.FRENCH}
                        initialValue={placeData?.name?.fr ? placeData?.name?.fr : artsDataId && artsData?.name?.fr}
                        dependencies={[formFieldNames.ENGLISH]}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (value || getFieldValue(formFieldNames.ENGLISH)) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(t('dashboard.places.createNew.addPlace.validations.nameRequired')),
                                );
                            },
                          }),
                        ]}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t('dashboard.places.createNew.addPlace.name.placeholder.french')}
                          style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item
                        name={formFieldNames.ENGLISH}
                        key={contentLanguage.ENGLISH}
                        initialValue={placeData?.name?.en ? placeData?.name?.en : artsDataId && artsData?.name?.en}
                        dependencies={[formFieldNames.FRENCH]}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (value || getFieldValue(formFieldNames.FRENCH)) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(t('dashboard.places.createNew.addPlace.validations.nameRequired')),
                                );
                            },
                          }),
                        ]}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t('dashboard.places.createNew.addPlace.name.placeholder.english')}
                          style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                          size="large"
                        />
                      </Form.Item>
                    </BilingualInput>
                  </ContentLanguageInput>
                </Form.Item>

                <Form.Item
                  name={formFieldNames.TYPE}
                  label={taxonomyDetails(
                    allTaxonomyData?.data,
                    user,
                    placeTaxonomyMappedFieldTypes.TYPE,
                    'name',
                    false,
                  )}
                  initialValue={placeData?.additionalType?.map((type) => {
                    return type?.entityId;
                  })}
                  rules={[
                    {
                      required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.PLACE_TYPE),
                      message: t('dashboard.places.createNew.addPlace.validations.placeTypeRequired'),
                    },
                  ]}>
                  <TreeSelectOption
                    placeholder={t('dashboard.places.createNew.addPlace.placeType.placeholder')}
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
                    <BilingualInput
                      fieldData={
                        placeData?.disambiguatingDescription
                          ? placeData?.disambiguatingDescription
                          : artsDataId && artsData?.disambiguatingDescription
                      }>
                      <Form.Item
                        name={formFieldNames.DISAMBIGUATING_DESCRIPTION_FRENCH}
                        key={contentLanguage.FRENCH}
                        initialValue={
                          placeData?.disambiguatingDescription?.fr
                            ? placeData?.disambiguatingDescription?.fr
                            : artsDataId && artsData?.disambiguatingDescription?.fr
                        }
                        dependencies={[formFieldNames.DISAMBIGUATING_DESCRIPTION_ENGLISH]}>
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
                        initialValue={
                          placeData?.disambiguatingDescription?.en
                            ? placeData?.disambiguatingDescription?.en
                            : artsDataId && artsData?.disambiguatingDescription?.en
                        }
                        dependencies={[formFieldNames.DISAMBIGUATING_DESCRIPTION_FRENCH]}>
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
                    <BilingualInput
                      fieldData={
                        placeData?.description
                          ? placeData?.description
                          : artsData?.description && artsDataId && artsData?.description
                      }>
                      <TextEditor
                        formName={formFieldNames.EDITOR_FRENCH}
                        key={contentLanguage.FRENCH}
                        calendarContentLanguage={calendarContentLanguage}
                        initialValue={
                          placeData?.description?.fr
                            ? placeData?.description?.fr
                            : artsDataId && artsData?.description?.fr
                        }
                        dependencies={[formFieldNames.EDITOR_ENGLISH]}
                        currentReactQuillRef={reactQuillRefFr}
                        editorLanguage={'fr'}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.description.frenchPlaceholder')}
                        descriptionMinimumWordCount={descriptionMinimumWordCount}
                      />

                      <TextEditor
                        formName={formFieldNames.EDITOR_ENGLISH}
                        key={contentLanguage.ENGLISH}
                        initialValue={
                          placeData?.description?.en
                            ? placeData?.description?.en
                            : artsDataId && artsData?.description?.en
                        }
                        calendarContentLanguage={calendarContentLanguage}
                        dependencies={[formFieldNames.EDITOR_FRENCH]}
                        currentReactQuillRef={reactQuillRefEn}
                        editorLanguage={'en'}
                        placeholder={t('dashboard.events.addEditEvent.otherInformation.description.englishPlaceholder')}
                        descriptionMinimumWordCount={descriptionMinimumWordCount}
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
                        initialValue={initialValues}
                        hidden={taxonomy?.isAdminOnly ? (adminCheckHandler() ? false : true) : false}>
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
                    <BilingualInput
                      fieldData={
                        placeData?.address?.streetAddress
                          ? placeData?.address?.streetAddress
                          : artsDataId && artsData?.address?.streetAddress
                      }>
                      <Form.Item
                        name={formFieldNames.STREET_ADDRESS_FRENCH}
                        key={contentLanguage.FRENCH}
                        initialValue={
                          placeData?.address?.streetAddress?.fr
                            ? placeData?.address?.streetAddress?.fr
                            : artsDataId && artsData?.address?.streetAddress?.fr
                        }
                        dependencies={[formFieldNames.STREET_ADDRESS_ENGLISH]}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (value || getFieldValue(formFieldNames.STREET_ADDRESS_ENGLISH)) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(t('dashboard.places.createNew.addPlace.validations.streetAddressRequired')),
                                );
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
                        initialValue={
                          placeData?.address?.streetAddress?.en
                            ? placeData?.address?.streetAddress?.en
                            : artsDataId && artsData?.address?.streetAddress?.en
                        }
                        dependencies={[formFieldNames.STREET_ADDRESS_FRENCH]}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (value || getFieldValue(formFieldNames.STREET_ADDRESS_FRENCH)) {
                                return Promise.resolve();
                              } else
                                return Promise.reject(
                                  new Error(t('dashboard.places.createNew.addPlace.validations.streetAddressRequired')),
                                );
                            },
                          }),
                        ]}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          placeholder={t(
                            'dashboard.places.createNew.addPlace.address.streetAddressPlaceholder.english',
                          )}
                          style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                          size="large"
                        />
                      </Form.Item>
                    </BilingualInput>
                  </ContentLanguageInput>
                </Form.Item>
                <Form.Item label={t('dashboard.places.createNew.addPlace.address.city.city')}>
                  <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                    <BilingualInput
                      fieldData={
                        placeData?.address?.addressLocality
                          ? placeData?.address?.addressLocality
                          : artsDataId && artsData?.address?.addressLocality
                      }>
                      <Form.Item
                        name={formFieldNames.CITY_FRENCH}
                        key={contentLanguage.FRENCH}
                        initialValue={
                          placeData?.address?.addressLocality?.fr
                            ? placeData?.address?.addressLocality?.fr
                            : artsDataId && artsData?.address?.addressLocality?.fr
                        }
                        dependencies={[formFieldNames.CITY_ENGLISH]}>
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
                        initialValue={
                          placeData?.address?.addressLocality?.en
                            ? placeData?.address?.addressLocality?.en
                            : artsDataId && artsData?.address?.addressLocality?.en
                        }
                        dependencies={[formFieldNames.CITY_FRENCH]}>
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
                  initialValue={
                    placeData?.address?.postalCode
                      ? placeData?.address?.postalCode
                      : artsDataId && artsData?.address?.postalCode
                  }
                  label={t('dashboard.places.createNew.addPlace.address.postalCode.postalCode')}
                  rules={[
                    {
                      required: true,
                      message: t('dashboard.places.createNew.addPlace.validations.postalCodeRequired'),
                    },
                  ]}>
                  <StyledInput placeholder={t('dashboard.places.createNew.addPlace.address.postalCode.placeholder')} />
                </Form.Item>
                <Row gutter={[16, 0]}>
                  <Col span={12}>
                    <Form.Item label={t('dashboard.places.createNew.addPlace.address.province.province')}>
                      <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                        <BilingualInput
                          fieldData={
                            placeData?.address?.addressRegion
                              ? placeData?.address?.addressRegion
                              : artsDataId && artsData?.address?.addressRegion
                          }>
                          <Form.Item
                            name={formFieldNames.PROVINCE_FRENCH}
                            key={contentLanguage.FRENCH}
                            initialValue={
                              placeData?.address?.addressRegion?.fr
                                ? placeData?.address?.addressRegion?.fr
                                : artsDataId && artsData?.address?.addressRegion?.fr
                            }
                            dependencies={[formFieldNames.PROVINCE_ENGLISH]}>
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
                            initialValue={
                              placeData?.address?.addressRegion?.en
                                ? placeData?.address?.addressRegion?.en
                                : artsDataId && artsData?.address?.addressRegion?.en
                            }
                            dependencies={[formFieldNames.PROVINCE_FRENCH]}>
                            <TextArea
                              autoSize
                              autoComplete="off"
                              placeholder={t(
                                'dashboard.places.createNew.addPlace.address.province.placeholder.english',
                              )}
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
                        <BilingualInput
                          fieldData={
                            placeData?.address?.addressCountry
                              ? placeData?.address?.addressCountry
                              : artsDataId && artsData?.address?.addressCountry
                          }>
                          <Form.Item
                            name={formFieldNames.COUNTRY_FRENCH}
                            key={contentLanguage.FRENCH}
                            initialValue={
                              placeData?.address?.addressCountry?.fr
                                ? placeData?.address?.addressCountry?.fr
                                : artsDataId && artsData?.address?.addressCountry?.fr
                            }
                            dependencies={[formFieldNames.COUNTRY_ENGLISH]}>
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
                            initialValue={
                              placeData?.address?.addressCountry?.en
                                ? placeData?.address?.addressCountry?.en
                                : artsDataId && artsData?.address?.addressCountry?.en
                            }
                            dependencies={[formFieldNames.COUNTRY_FRENCH]}>
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
                  initialValue={
                    placeData?.geoCoordinates?.latitude || placeData?.geoCoordinates?.longitude
                      ? placeData?.geoCoordinates?.latitude + ',' + placeData?.geoCoordinates?.longitude
                      : artsDataId &&
                        (artsData?.geo?.latitude || artsData?.geo?.longitude) &&
                        artsData?.geo?.latitude + '' + artsData?.geo?.longitude
                  }
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
                  initialValue={
                    placeData?.regions
                      ? placeData?.regions?.map((type) => {
                          return type?.entityId;
                        })
                      : artsDataId &&
                        artsData?.regions &&
                        artsData?.regions?.map((region) => {
                          return region?.entityId;
                        })
                  }>
                  <TreeSelectOption
                    placeholder={t('dashboard.places.createNew.addPlace.address.region.placeholder')}
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
                    placeholder={t('dashboard.places.createNew.addPlace.address.openingHours.placeholder')}
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
            <Card title={t('dashboard.places.createNew.addPlace.containsPlace.containsPlace')}>
              <>
                <Row>
                  <Col>
                    <p className="add-event-date-heading">
                      {t('dashboard.places.createNew.addPlace.containsPlace.subheading')}
                    </p>
                  </Col>
                </Row>
                <Form.Item
                  name={formFieldNames.CONTAINS_PLACE}
                  className="subheading-wrap"
                  // initialValue={initialPlace && initialPlace[0]?.id}
                  label={t('dashboard.places.createNew.addPlace.containsPlace.addPlace')}>
                  <Popover
                    open={isPopoverOpen.containedsPlace}
                    onOpenChange={(open) => setIsPopoverOpen({ ...isPopoverOpen, containsPlace: open })}
                    overlayClassName="event-popover"
                    placement="bottom"
                    autoAdjustOverflow={false}
                    getPopupContainer={(trigger) => trigger.parentNode}
                    trigger={['click']}
                    content={
                      <div>
                        <div>
                          <>
                            <div className="popover-section-header">
                              {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                            </div>
                            <div className="search-scrollable-content">
                              {allPlacesList?.length > 0 ? (
                                allPlacesList?.map((place, index) => (
                                  <div
                                    key={index}
                                    className={`event-popover-options`}
                                    onClick={() => {
                                      setSelectedContainsPlaces([...selectedContainsPlaces, place]);
                                      setIsPopoverOpen({
                                        ...isPopoverOpen,
                                        containsPlace: false,
                                      });
                                    }}>
                                    {place?.label}
                                  </div>
                                ))
                              ) : (
                                <NoContent />
                              )}
                            </div>
                          </>
                          {quickCreateKeyword !== '' && (
                            <>
                              <div className="popover-section-header">
                                {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                              </div>
                              <div className="search-scrollable-content">
                                {allPlacesArtsdataList?.length > 0 ? (
                                  allPlacesArtsdataList?.map((place, index) => (
                                    <div
                                      key={index}
                                      className="event-popover-options"
                                      onClick={() => {
                                        setSelectedContainsPlaces([...selectedContainsPlaces, place]);
                                        setIsPopoverOpen({
                                          ...isPopoverOpen,
                                          containsPlace: false,
                                        });
                                      }}>
                                      {place?.label}
                                    </div>
                                  ))
                                ) : (
                                  <NoContent />
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    }>
                    <EventsSearch
                      style={{ borderRadius: '4px', width: '423px' }}
                      placeholder={t('dashboard.places.createNew.addPlace.containedInPlace.placeholder')}
                      onChange={(e) => {
                        setQuickCreateKeyword(e.target.value);
                        debounceSearchPlace(e.target.value);
                        setIsPopoverOpen({ ...isPopoverOpen, containsPlace: true });
                      }}
                      onClick={(e) => {
                        setQuickCreateKeyword(e.target.value);
                        setIsPopoverOpen({ ...isPopoverOpen, containsPlace: true });
                      }}
                    />
                  </Popover>
                  {selectedContainsPlaces?.map((containsPlace, index) => {
                    return (
                      <SelectionItem
                        key={index}
                        icon={containsPlace?.label?.props?.icon}
                        name={containsPlace?.name}
                        description={containsPlace?.description}
                        itemWidth="100%"
                        artsDataLink={containsPlace?.uri}
                        artsDataDetails={true}
                        calendarContentLanguage={calendarContentLanguage}
                        bordered
                        closable
                        onClose={() => {
                          setSelectedContainsPlaces(
                            selectedContainsPlaces?.filter((selectedContainPlace, indexValue) => indexValue != index),
                          );
                        }}
                      />
                    );
                  })}
                </Form.Item>
              </>
              <></>
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
                        <div>
                          <>
                            <div className="popover-section-header">
                              {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                            </div>
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
                          </>
                          {quickCreateKeyword !== '' && (
                            <>
                              <div className="popover-section-header">
                                {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                              </div>
                              <div className="search-scrollable-content">
                                {allPlacesArtsdataList?.length > 0 ? (
                                  allPlacesArtsdataList?.map((place, index) => (
                                    <div
                                      key={index}
                                      className="event-popover-options"
                                      onClick={() => {
                                        setContainedInPlace(place);
                                        form.setFieldValue(formFieldNames.CONTAINED_IN_PLACE, place?.uri);
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
                            </>
                          )}
                        </div>
                      </div>
                    }>
                    <EventsSearch
                      style={{ borderRadius: '4px', width: '423px' }}
                      placeholder={t('dashboard.places.createNew.addPlace.containedInPlace.placeholder')}
                      onChange={(e) => {
                        setQuickCreateKeyword(e.target.value);
                        debounceSearchPlace(e.target.value);
                        setIsPopoverOpen({ ...isPopoverOpen, containedInPlace: true });
                      }}
                      onClick={(e) => {
                        setQuickCreateKeyword(e.target.value);
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
                    placeholder={t('dashboard.places.createNew.addPlace.venueAccessibility.placeholder')}
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
                            'dashboard.places.createNew.addPlace.venueAccessibility.placeAccessibilityNote.placeholder.french',
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
                            'dashboard.places.createNew.addPlace.venueAccessibility.placeAccessibilityNote.placeholder.english',
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
          </Row>
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
