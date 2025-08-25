import React, { useCallback, useEffect, useRef, useState } from 'react';
import './quickCreatePlace.css';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input, notification, Dropdown, message, Button, Popover } from 'antd';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { CloseCircleOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import { treeDynamicTaxonomyOptions, treeTaxonomyOptions } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import NoContent from '../../NoContent/NoContent';
import StyledInput from '../../Input/Common';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import { useAddPostalAddressMutation } from '../../../services/postalAddress';
import { useAddPlaceMutation, useLazyGetPlaceQuery } from '../../../services/places';
import { placesOptions } from '../../Select/selectOption.settings';
import { placeTaxonomyMappedFieldTypes } from '../../../constants/placeMappedFieldTypes';
import Outlined from '../../Button/Outlined';
import { useNavigate, useParams } from 'react-router-dom';
import { PathName } from '../../../constants/pathName';
import QuickCreateSaving from '../QuickCreateSaving/QuickCreateSaving';
import { externalSourceOptions, sourceOptions } from '../../../constants/sourceOptions';
import { entitiesClass } from '../../../constants/entitiesClass';
import { eventPublishState } from '../../../constants/eventPublishState';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems';
import {
  createInitialNamesObjectFromKeyword,
  isDataValid,
  placeHolderCollectionCreator,
} from '../../../utils/MultiLingualFormItemSupportFunctions';
import { placeFormRequiredFieldNames } from '../../../constants/placeFormRequiredFieldNames';
import SortableTreeSelect from '../../TreeSelectOption/SortableTreeSelect';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import MultiLingualTextEditor from '../../MultilingualTextEditor/MultiLingualTextEditor';
import { featureFlags } from '../../../utils/featureFlags';
import { useAddImageMutation } from '../../../services/image';
import ImageUpload from '../../ImageUpload';
import MultipleImageUpload from '../../MultipleImageUpload';
import { bilingual } from '../../../utils/bilingual';
import { useLazyGetEntitiesQuery } from '../../../services/entities';
import { useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import MapComponent from '../../MapComponent';
import LoadingIndicator from '../../LoadingIndicator';
import EventsSearch from '../../Search/Events/EventsSearch';
import SelectionItem from '../../List/SelectionItem';
import { uploadImageListHelper } from '../../../utils/uploadImageListHelper';
import { urlProtocolCheck } from '../../Input/Common/input.settings';
import { filterUneditedFallbackValues } from '../../../utils/removeUneditedFallbackValues';
import { getActiveFallbackFieldsInfo } from '../../../redux/reducer/languageLiteralSlice';

const { TextArea } = Input;

function QuickCreatePlace(props) {
  const {
    open,
    setOpen,
    calendarContentLanguage,
    calendarId,
    keyword,
    setKeyword,
    setLocationPlace,
    locationPlace,
    eventForm,
    saveAsDraftHandler,
    setLoaderModalOpen,
    loaderModalOpen,
    setShowDialog,
    currentCalendarData,
  } = props;

  const formFieldNames = {
    NAME: 'name',
    TYPE: 'type',
    STREET_ADDRESS: 'streetAddress',
    CITY: 'addressLocality',
    PROVINCE: 'addressRegion',
    COUNTRY: 'addressCountry',
    ACCESSIBILITY_NOTE: 'accessibilityNote',
    POSTAL_CODE: 'postalCode',
    COORDINATES: 'coordinates',
    CONTAINED_IN_PLACE: 'containedInPlace',
    PLACE_ACCESSIBILITY: 'placeAccessibility',
    DISAMBIGUATING_DESCRIPTION: 'disambiguatingDescription',
    DESCRIPTION: 'description',
    EDITOR: 'editor',
    DRAGGER: 'dragger',
    DRAGGER_WRAP: 'draggerWrap',
    DYNAMIC_FIELS: 'dynamicFields',
    OPENING_HOURS: 'openingHours',
    ACCESSIBILITY_NOTE_WRAP: 'accessibilityNotewrap',
    REGION: 'region',
    CONTAINS_PLACE: 'containsPlace',
    MAP: 'map',
  };

  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const { user } = useSelector(getUserDetails);
  const { eventId } = useParams();
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);

  const [addImage, { error: isAddImageError }] = useAddImageMutation();
  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery({
    sessionId: timestampRef,
  });

  let requiredFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.place);
  let requiredFieldNames = requiredFields
    ? requiredFields[0]?.formFieldProperties?.mandatoryFields?.standardFields
        ?.map((field) => field?.fieldName)
        ?.concat(requiredFields[0]?.formFieldProperties?.mandatoryFields?.dynamicFields?.map((field) => field))
    : [];
  let standardAdminOnlyFields =
    requiredFields && requiredFields?.length > 0
      ? requiredFields[0]?.formFieldProperties?.adminOnlyFields?.standardFields?.map((field) => field?.fieldName)
      : [];
  requiredFields =
    requiredFields &&
    requiredFields?.length > 0 &&
    requiredFields[0]?.formFieldProperties?.mandatoryFields?.standardFields?.concat(
      requiredFields[0]?.formFieldProperties?.mandatoryFields?.dynamicFields?.map((field) => {
        return { fieldName: field };
      }),
    );

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);
  let imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];

  const [event, setEvent] = useState([]);
  const [descriptionMinimumWordCount] = useState(1);
  const [imageCropOpen, setImageCropOpen] = useState(false);

  useEffect(() => {
    if (event.length > 0) {
      saveAsDraftHandler(event[0], true, eventPublishState.DRAFT)
        .then((res) => {
          setLoaderModalOpen(false);
          if (res) {
            notification.success({
              description: t('dashboard.events.addEditEvent.notification.updateEvent'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.AddPlace}?id=${event[1]?.id}`, {
              state: {
                data: { isRoutingToEventPage: eventId ? location.pathname : `${location.pathname}/${res}` },
              },
            });
          }
        })
        .catch((error) => {
          if (error) {
            setLoaderModalOpen(false);
          }
        });
    }
  }, [locationPlace]);

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
  const [addPostalAddress] = useAddPostalAddressMutation();
  const [addPlace] = useAddPlaceMutation();

  const [address, setAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [containedInPlace, setContainedInPlace] = useState();
  const [selectedContainsPlaces, setSelectedContainsPlaces] = useState([]);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [allPlacesArtsdataList, setAllPlacesArtsdataList] = useState([]);
  const [allPlacesImportsFootlight, setAllPlacesImportsFootlight] = useState([]);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState({
    containedInPlace: false,
    containsPlace: false,
  });
  const [geocoder, setGeocoder] = useState(null);
  const [publishValidateFields, setPublishValidateFields] = useState([]);

  useEffect(() => {
    if (window.google) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, []);

  const handleChange = (value) => {
    if (value === '') setDropdownOpen(false);
    else setDropdownOpen(true);
    setAddress(address);
  };

  const handleGeocode = (coordinates) => {
    if (!geocoder) return; // Ensure geocoder is initialized

    const latlng = {
      lat: parseFloat(coordinates[0]),
      lng: parseFloat(coordinates[1]),
    };

    geocoder
      .geocode({ location: latlng })
      .then((response) => {
        if (response.results[0]) {
          const addressComponents = response.results[0].address_components;

          const streetNumber =
            addressComponents.find((item) => item.types.includes('street_number'))?.long_name || null;
          const streetName = addressComponents.find((item) => item.types.includes('route'))?.long_name || null;
          const streetAddress = [streetNumber, streetName].filter(Boolean).join(' ') || null;

          calendarContentLanguage.forEach((language) => {
            const langKey = contentLanguageKeyMap[language];

            form.setFieldValue([formFieldNames.STREET_ADDRESS, langKey], streetAddress);
            form.setFieldValue(
              [formFieldNames.COUNTRY, langKey],
              addressComponents.find((item) => item.types.includes('country'))?.long_name,
            );
            form.setFieldValue(
              [formFieldNames.CITY, langKey],
              addressComponents.find((item) => item.types.includes('locality'))?.long_name,
            );
            form.setFieldValue(
              [formFieldNames.PROVINCE, langKey],
              addressComponents.find((item) => item.types.includes('administrative_area_level_1'))?.short_name,
            );
          });

          form.setFieldValue(
            formFieldNames.POSTAL_CODE,
            addressComponents.find((item) => item.types.includes('postal_code'))?.long_name,
          );
        }
      })
      .catch((e) => console.log(e));
  };

  const handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => {
        let streetNumber =
          results[0].address_components.find((item) => item.types.includes('street_number'))?.long_name ?? null;
        let streetName = results[0].address_components.find((item) => item.types.includes('route'))?.long_name ?? null;
        let streetAddress = streetNumber + ' ' + streetName;
        if (streetNumber && streetName) streetAddress = streetNumber + ' ' + streetName;
        else if (streetNumber && !streetName) streetAddress = streetNumber;
        else if (!streetNumber && streetName) streetAddress = streetName;
        else if (!streetNumber && !streetName) streetAddress = null;

        calendarContentLanguage.forEach((language) => {
          const langKey = contentLanguageKeyMap[language];
          form.setFieldValue([formFieldNames.STREET_ADDRESS, langKey], streetAddress);
          form.setFieldValue(
            [formFieldNames.COUNTRY, langKey],
            results[0].address_components.find((item) => item.types.includes('country'))?.long_name,
          );

          form.setFieldValue(
            [formFieldNames.CITY, langKey],
            results[0].address_components.find((item) => item.types.includes('locality'))?.long_name,
          );
          form.setFieldValue(
            [formFieldNames.PROVINCE, langKey],
            results[0].address_components.find((item) => item.types.includes('administrative_area_level_1'))
              ?.short_name,
          );
        });

        form.setFieldValue(
          formFieldNames.POSTAL_CODE,
          results[0].address_components.find((item) => item.types.includes('postal_code'))?.long_name,
        );

        return getLatLng(results[0]);
      })
      .then((latLng) => {
        form.setFieldsValue({
          latitude: '' + latLng.lat,
          longitude: '' + latLng.lng,
          coordinates: latLng.lat + ',' + latLng.lng,
        });
        setCoordinates({
          latitude: latLng.lat,
          longitude: latLng.lng,
        });
      })
      .catch((error) => console.error(error));
    setDropdownOpen(false);
  };

  const placesSearch = (inputValue = '') => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.ARTSDATA);
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities(
      {
        searchKey: inputValue,
        classes: decodeURIComponent(query.toString()),
        calendarId,
      },
      true,
    )
      .unwrap()
      .then((response) => {
        let containedInPlaceFilter = [];
        containedInPlaceFilter = response;
        setAllPlacesList(placesOptions(containedInPlaceFilter, user, calendarContentLanguage, sourceOptions.CMS));
      })
      .catch((error) => console.log(error));
    if (inputValue && inputValue != '') {
      getExternalSource(
        {
          searchKey: inputValue,
          classes: decodeURIComponent(query.toString()),
          sources: decodeURIComponent(sourceQuery.toString()),
          calendarId,
          excludeExistingCMS: true,
        },
        true,
      )
        .unwrap()
        .then((response) => {
          setAllPlacesArtsdataList(
            placesOptions(response?.artsdata, user, calendarContentLanguage, sourceOptions.ARTSDATA),
          );
          setAllPlacesImportsFootlight(
            placesOptions(response?.footlight, user, calendarContentLanguage, externalSourceOptions.FOOTLIGHT),
          );
        })
        .catch((error) => console.log(error));
    }
  };

  const debounceSearchPlace = useCallback(useDebounce(placesSearch, SEARCH_DELAY), []);

  const getSelectedPlace = (id) => {
    getPlace({ placeId: id, calendarId })
      .unwrap()
      .then((response) => {
        let placeObj = response;
        placeObj = {
          ...placeObj,
          type: entitiesClass.place,
        };
        setLocationPlace(placesOptions([placeObj], user, calendarContentLanguage)[0], sourceOptions.CMS);
        eventForm.setFieldValue('locationPlace', id);
      })
      .catch((error) => console.log(error));
  };
  const createPlaceHandler = (toggle = true) => {
    return new Promise((resolve, reject) => {
      form
        .validateFields(publishValidateFields ?? [])
        .then(async () => {
          let fallbackStatus = activeFallbackFieldsInfo;
          var values = form.getFieldsValue();
          var persistValues = form.getFieldsValue(true); // if toggle is false form is unmounted, hence the need to use both default and true values

          let postalObj = calendarContentLanguage.reduce(
            (acc, language) => {
              const languageKey = contentLanguageKeyMap[language];

              const addIfValidString = (field, fieldName) => {
                const fallbackFilteredFieldvalue = filterUneditedFallbackValues({
                  values: values?.[fieldName],
                  activeFallbackFieldsInfo: fallbackStatus,
                  fieldName: fieldName,
                });

                if (
                  fallbackFilteredFieldvalue?.[languageKey] &&
                  typeof fallbackFilteredFieldvalue?.[languageKey] === 'string'
                ) {
                  acc[field] = {
                    ...(acc[field] || {}),
                    [languageKey]: fallbackFilteredFieldvalue?.[languageKey]?.trim(),
                  };
                }
              };

              addIfValidString('addressCountry', 'addressCountry');
              addIfValidString('addressLocality', 'addressLocality');
              addIfValidString('addressRegion', 'addressRegion');
              addIfValidString('streetAddress', 'streetAddress');

              return acc;
            },
            { postalCode: typeof values?.postalCode === 'string' ? values.postalCode.trim() : values?.postalCode },
          );

          if (!toggle) {
            setOpen(false);
            setLoaderModalOpen(true);
          }
          try {
            const postalAddressResponse = await addPostalAddress({ data: postalObj, calendarId }).unwrap();
            if (postalAddressResponse && postalAddressResponse?.statusCode == 202) {
              let dynamicFields,
                containedInPlaceObj,
                containsPlace = [],
                description = {},
                accessibilityNote = {},
                disambiguatingDescription = {},
                name = values?.name,
                placeObj = {},
                additionalType = [],
                postalAddressId = {
                  entityId: postalAddressResponse?.id,
                };

              description = filterUneditedFallbackValues({
                values: values?.description,
                activeFallbackFieldsInfo: fallbackStatus,
                fieldName: 'description',
              });

              accessibilityNote = filterUneditedFallbackValues({
                values: values?.accessibilityNote,
                activeFallbackFieldsInfo: fallbackStatus,
                fieldName: 'accessibilityNote',
              });
              disambiguatingDescription = filterUneditedFallbackValues({ values: values?.disambiguatingDescription });

              if (values?.type) {
                additionalType = values?.type?.map((placeTypeId) => {
                  return {
                    entityId: placeTypeId,
                  };
                });
              }
              let latitude = persistValues?.latitude;
              let longitude = persistValues?.longitude;
              if (values?.containedInPlace || values?.containedInPlace?.length > 0) {
                if (
                  containedInPlace?.source === sourceOptions.CMS ||
                  containedInPlace?.source === externalSourceOptions.FOOTLIGHT
                )
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
                  if (place?.source === sourceOptions.CMS || place?.source === externalSourceOptions.FOOTLIGHT)
                    return {
                      entityId: place?.value,
                    };
                  else if (place?.source === sourceOptions.ARTSDATA)
                    return {
                      uri: place?.uri,
                    };
                });
              }
              if (values?.coordinates) {
                const coordinates = values.coordinates.split(/[, ]+/);
                latitude = coordinates[0] || undefined;
                longitude = coordinates[1] || undefined;
              }
              if (values?.dynamicFields) {
                dynamicFields = Object.keys(values?.dynamicFields)?.map((dynamicField) => {
                  return {
                    taxonomyId: dynamicField,
                    conceptIds: values?.dynamicFields[dynamicField],
                  };
                });
              }
              placeObj = {
                ...(isDataValid(name) && { name }),
                ...(isDataValid(description) ? { description } : { description: {} }),
                ...(isDataValid(accessibilityNote) && { accessibilityNote }),
                ...(isDataValid(disambiguatingDescription) && { disambiguatingDescription }),
                ...(values?.openingHours && { openingHours: { uri: urlProtocolCheck(values?.openingHours) } }),
                ...(values?.containedInPlace && {
                  containedInPlace: containedInPlaceObj,
                }),
                geo: latitude && longitude && latitude !== '' && longitude !== '' ? { latitude, longitude } : undefined,

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
                additionalType,

                ...(values?.dynamicFields && { dynamicFields }),
                ...(values?.containsPlace && { containsPlace }),
                postalAddressId,
              };
              const formImageCrop = form.getFieldValue('imageCrop');
              const mainImageOptions = form.getFieldValue('mainImageOptions');
              const getImageCrop = (crop, entityId = null, responseData = null) => ({
                large: {
                  xCoordinate: crop?.large?.x,
                  yCoordinate: crop?.large?.y,
                  height: crop?.large?.height,
                  width: crop?.large?.width,
                },
                thumbnail: {
                  xCoordinate: crop?.thumbnail?.x,
                  yCoordinate: crop?.thumbnail?.y,
                  height: crop?.thumbnail?.height,
                  width: crop?.thumbnail?.width,
                },
                original: {
                  entityId: entityId || crop?.original?.entityId,
                  height: responseData?.height ?? crop?.original?.height,
                  width: responseData?.width ?? crop?.original?.width,
                },
                isMain: true,
                description: mainImageOptions?.altText,
                creditText: mainImageOptions?.credit,
                caption: mainImageOptions?.caption,
              });
              let imageCrop = formImageCrop ? [getImageCrop(formImageCrop)] : [];

              if (!toggle) {
                setOpen(false);
                setLoaderModalOpen(true);
              }

              const hasMultipleImages = values.multipleImagesCrop?.length > 0;
              const hasNewMainImage = values?.dragger?.length > 0 && values?.dragger[0]?.originFileObj;

              if (hasNewMainImage) {
                const formData = new FormData();
                formData.append('file', hasNewMainImage);

                const response = await addImage({ data: formData, calendarId }).unwrap();
                const entityId = response?.data?.original?.entityId;

                imageCrop = [getImageCrop(formImageCrop, entityId, response?.data)];
              }

              if (hasMultipleImages) {
                await uploadImageListHelper(values, addImage, calendarId, imageCrop);
              }

              if (!hasNewMainImage && values?.dragger?.length === 0 && !hasMultipleImages) {
                placeObj['image'] = [];
              } else {
                placeObj['image'] = imageCrop ?? [];
              }

              const response = await addPlace({ data: placeObj, calendarId }).unwrap();

              if (toggle) {
                notification.success({
                  description: t('dashboard.events.addEditEvent.location.quickCreatePlace.success'),
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
              }

              setKeyword('');
              setOpen(false);
              getSelectedPlace(response?.id);
              setShowDialog(true);
              resolve(response);
            }
          } catch (error) {
            console.log(error);
            reject(error);
            if (!toggle)
              message.warning({
                duration: 5,
                maxCount: 1,
                key: 'place-save-as-warning',
                content: (
                  <>
                    {t('dashboard.events.addEditEvent.validations.errorDraft')} &nbsp;
                    <Button
                      type="text"
                      icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                      onClick={() => message.destroy('place-save-as-warning')}
                    />
                  </>
                ),
                icon: <ExclamationCircleOutlined />,
              });
          }
        })
        .catch((error) => reject(error));
    });
  };

  const goToAddFullDetailsPageHandler = async (e) => {
    eventForm
      .validateFields([
        ...new Set([
          ...(calendarContentLanguage.map((language) => ['name', `${contentLanguageKeyMap[language]}`]) ?? []),
          'datePicker',
          'dateRangePicker',
          'datePickerWrapper',
          'startDateRecur',
        ]),
      ])
      .then(async () => {
        const response = await createPlaceHandler(false);
        if (response) {
          setEvent([e, response]);
        }
      })
      .catch((error) => {
        console.error(error);
        message.warning({
          duration: 10,
          maxCount: 1,
          key: 'event-save-as-warning',
          content: (
            <>
              {t('dashboard.events.addEditEvent.validations.errorDraft')} &nbsp;
              <Button
                type="text"
                icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                onClick={() => message.destroy('event-save-as-warning')}
              />
            </>
          ),
          icon: <ExclamationCircleOutlined />,
        });
      });
  };

  useEffect(() => {
    let publishValidateFields = [],
      initialAddedFields = [];
    if (currentCalendarData) {
      requiredFields?.forEach((requiredField) => {
        switch (requiredField?.fieldName) {
          case placeFormRequiredFieldNames.NAME:
            calendarContentLanguage.forEach((language) => {
              publishValidateFields.push([formFieldNames.NAME, contentLanguageKeyMap[language]]);
            });
            break;
          case placeFormRequiredFieldNames.DESCRIPTION:
            calendarContentLanguage.forEach((language) => {
              publishValidateFields.push([formFieldNames.DESCRIPTION, contentLanguageKeyMap[language]]);
            });
            break;
          case placeFormRequiredFieldNames.PLACE_TYPE:
            publishValidateFields.push(formFieldNames.TYPE);
            break;
          case placeFormRequiredFieldNames.STREET_ADDRESS:
            calendarContentLanguage.forEach((language) => {
              publishValidateFields.push([formFieldNames.STREET_ADDRESS, contentLanguageKeyMap[language]]);
            });
            break;
          case placeFormRequiredFieldNames.DISAMBIGUATING_DESCRIPTION:
            calendarContentLanguage.forEach((language) => {
              publishValidateFields.push([formFieldNames.DISAMBIGUATING_DESCRIPTION, contentLanguageKeyMap[language]]);
            });
            break;
          case placeFormRequiredFieldNames.IMAGE:
            publishValidateFields.push(formFieldNames.DRAGGER_WRAP);
            break;
          case placeFormRequiredFieldNames.CITY:
            calendarContentLanguage.forEach((language) => {
              publishValidateFields.push([formFieldNames.CITY, contentLanguageKeyMap[language]]);
            });
            break;
          case placeFormRequiredFieldNames.POSTAL_CODE:
            publishValidateFields.push(formFieldNames.POSTAL_CODE);
            break;
          case placeFormRequiredFieldNames.PROVINCE:
            calendarContentLanguage.forEach((language) => {
              publishValidateFields.push([formFieldNames.PROVINCE, contentLanguageKeyMap[language]]);
            });
            break;
          case placeFormRequiredFieldNames.COUNTRY:
            calendarContentLanguage.forEach((language) => {
              publishValidateFields.push([formFieldNames.COUNTRY, contentLanguageKeyMap[language]]);
            });
            break;
          case placeFormRequiredFieldNames.COORDINATES:
            publishValidateFields.push(formFieldNames.COORDINATES);
            break;
          case placeFormRequiredFieldNames.OPENING_HOURS:
            publishValidateFields.push(formFieldNames.OPENING_HOURS);
            initialAddedFields = initialAddedFields?.concat(formFieldNames?.OPENING_HOURS);
            break;
          case placeFormRequiredFieldNames.CONTAINS_PLACE:
            publishValidateFields.push(formFieldNames.CONTAINS_PLACE);
            break;
          case placeFormRequiredFieldNames.CONTAINED_IN_PLACE:
            publishValidateFields.push(formFieldNames.CONTAINED_IN_PLACE);
            break;
          case placeFormRequiredFieldNames.PLACE_ACCESSIBILITY:
            publishValidateFields.push(formFieldNames.PLACE_ACCESSIBILITY);
            initialAddedFields = initialAddedFields?.concat(formFieldNames?.ACCESSIBILITY_NOTE_WRAP);
            break;
          case placeFormRequiredFieldNames.REGION:
            publishValidateFields.push(formFieldNames.REGION);
            break;
          default:
            publishValidateFields.push([formFieldNames.DYNAMIC_FIELS, requiredField?.fieldName]);
            break;
        }
      });
      publishValidateFields = [...new Set(publishValidateFields)];
      setPublishValidateFields(publishValidateFields);
    }
  }, [currentCalendarData]);

  return (
    !taxonomyLoading && (
      <>
        {!loaderModalOpen ? (
          <CustomModal
            open={open}
            bodyStyle={{
              maxHeight: '60vh',
              minHeight: '10vh',
              overflowY: 'auto',
            }}
            centered
            title={
              <span className="quick-create-place-modal-title" data-cy="span-quick-create-modal-heading">
                {t('dashboard.events.addEditEvent.location.quickCreatePlace.title')}
              </span>
            }
            onCancel={() => setOpen(false)}
            footer={
              <div
                style={{ display: 'flex', justifyContent: 'space-between' }}
                className="quick-create-organization-modal-footer">
                <div className="add-full-details-btn-wrapper" key="add-full-details">
                  <Outlined
                    size="large"
                    label={t('dashboard.events.addEditEvent.quickCreate.addFullDetails')}
                    data-cy="button-quick-create-organization-add-full-details"
                    onClick={(e) => {
                      goToAddFullDetailsPageHandler(e);
                    }}
                  />
                </div>
                <div>
                  <TextButton
                    key="cancel"
                    size="large"
                    label={t('dashboard.events.addEditEvent.quickCreate.cancel')}
                    onClick={() => setOpen(false)}
                    data-cy="button-cancel-quick-create-place"
                  />
                  <PrimaryButton
                    key="add-dates"
                    label={t('dashboard.events.addEditEvent.quickCreate.create')}
                    onClick={createPlaceHandler}
                    data-cy="button-save-quick-create-place"
                  />
                </div>
              </div>
            }>
            <Row gutter={[0, 10]} className="quick-create-place-modal-wrapper">
              <Col span={24}>
                <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
                  <Row>
                    <Col>
                      <p className="quick-create-place-modal-sub-heading" data-cy="para-quick-create-modal-subheading">
                        {t('dashboard.events.addEditEvent.location.quickCreatePlace.subHeading')}
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <span className="quick-create-place-modal-label" data-cy="para-quick-create-place-name-label">
                        {t('dashboard.events.addEditEvent.location.quickCreatePlace.name')}
                      </span>
                    </Col>
                  </Row>
                  <CreateMultiLingualFormItems
                    calendarContentLanguage={calendarContentLanguage}
                    form={form}
                    name={formFieldNames.NAME}
                    data={createInitialNamesObjectFromKeyword(keyword, calendarContentLanguage)}
                    validations={t('dashboard.events.addEditEvent.validations.title')}
                    dataCy={`text-area-quick-create-place-name-`}
                    placeholder={placeHolderCollectionCreator({
                      t,
                      calendarContentLanguage,
                      placeholderBase: 'dashboard.events.addEditEvent.location.quickCreatePlace.namePlaceholder',
                      hasCommonPlaceHolder: true,
                    })}
                    required={true}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      style={{
                        borderRadius: '4px',
                        border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                      }}
                      size="large"
                    />
                  </CreateMultiLingualFormItems>

                  <Form.Item
                    data-cy="form-item-place-type"
                    name={formFieldNames.TYPE}
                    label={taxonomyDetails(
                      allTaxonomyData?.data,
                      user,
                      placeTaxonomyMappedFieldTypes.TYPE,
                      'name',
                      false,
                    )}
                    rules={[
                      {
                        required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.PLACE_TYPE),
                        message: t('dashboard.places.createNew.addPlace.validations.placeTypeRequired'),
                      },
                    ]}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.PLACE_TYPE)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.PLACE_TYPE)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.PLACE_TYPE)
                    }
                    style={{
                      display:
                        !taxonomyDetails(
                          allTaxonomyData?.data,
                          user,
                          placeTaxonomyMappedFieldTypes.TYPE,
                          'name',
                          false,
                        ) && 'none',
                    }}>
                    <SortableTreeSelect
                      setShowDialog={setShowDialog}
                      dataCy={`tag-place-type`}
                      form={form}
                      draggable
                      fieldName={formFieldNames.TYPE}
                      data-cy="treeselect-place-type"
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
                    />
                  </Form.Item>
                  <Form.Item
                    data-cy="form-item-place-disambiguating-description-title"
                    label={t('dashboard.places.createNew.addPlace.disambiguatingDescription.disambiguatingDescription')}
                    required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.DISAMBIGUATING_DESCRIPTION)}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.DISAMBIGUATING_DESCRIPTION)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.DISAMBIGUATING_DESCRIPTION)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.DISAMBIGUATING_DESCRIPTION)
                    }>
                    <CreateMultiLingualFormItems
                      calendarContentLanguage={calendarContentLanguage}
                      form={form}
                      name={formFieldNames.DISAMBIGUATING_DESCRIPTION}
                      required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.DISAMBIGUATING_DESCRIPTION)}
                      validations={t('common.validations.informationRequired')}
                      dataCy="input-place-disambiguating-description-"
                      placeholder={placeHolderCollectionCreator({
                        calendarContentLanguage,
                        placeholderBase: 'dashboard.places.createNew.addPlace.disambiguatingDescription.placeholder',
                        t,
                        hasCommonPlaceHolder: true,
                      })}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        style={{
                          borderRadius: '4px',
                          border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                          width: '100%',
                        }}
                        size="large"
                      />
                    </CreateMultiLingualFormItems>
                  </Form.Item>
                  <Form.Item
                    label={t('dashboard.places.createNew.addPlace.description.description')}
                    data-cy="form-item-place-description-title"
                    required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.DESCRIPTION)}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.DESCRIPTION)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.DESCRIPTION)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.DESCRIPTION)
                    }>
                    <MultiLingualTextEditor
                      form={form}
                      calendarContentLanguage={calendarContentLanguage}
                      name={formFieldNames.DESCRIPTION}
                      placeholder={placeHolderCollectionCreator({
                        calendarContentLanguage,
                        t,
                        placeholderBase: 'dashboard.events.addEditEvent.otherInformation.description.placeholder',
                      })}
                      descriptionMinimumWordCount={descriptionMinimumWordCount}
                      required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.DESCRIPTION)}
                    />
                  </Form.Item>
                  <Form.Item
                    data-cy="form-item-place-image-title"
                    label={t('dashboard.places.createNew.addPlace.image.mainImage')}
                    name={formFieldNames.DRAGGER_WRAP}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.IMAGE)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.IMAGE)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.IMAGE)
                    }
                    className="draggerWrap"
                    {...(isAddImageError && {
                      help: t('dashboard.events.addEditEvent.validations.errorImage'),
                      validateStatus: 'error',
                    })}
                    required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.IMAGE)}
                    rules={[
                      () => ({
                        validator() {
                          if (requiredFieldNames?.includes(placeFormRequiredFieldNames?.IMAGE)) {
                            if (
                              (form.getFieldValue(formFieldNames.DRAGGER) != undefined &&
                                form.getFieldValue(formFieldNames.DRAGGER)?.length > 0) ||
                              form.getFieldValue(formFieldNames.DRAGGER) ||
                              form.getFieldValue(formFieldNames.DRAGGER)?.length > 0
                            ) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(
                                new Error(t('dashboard.events.addEditEvent.validations.otherInformation.emptyImage')),
                              );
                          }
                        },
                      }),
                    ]}>
                    <Row>
                      <Col>
                        <p className="add-event-date-heading" data-cy="para-place-image-helper-text">
                          {t('dashboard.places.createNew.addPlace.image.subheading')}
                        </p>
                      </Col>
                    </Row>
                    <ImageUpload
                      data-cy="image-upload-place"
                      imageReadOnly={false}
                      preview={true}
                      setImageCropOpen={setImageCropOpen}
                      imageCropOpen={imageCropOpen}
                      form={form}
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
                  <Form.Item
                    label={t('dashboard.places.createNew.addPlace.image.additionalImages')}
                    data-cy="form-item-event-multiple-image"
                    hidden={!imageConfig?.enableGallery}>
                    <Row>
                      <Col>
                        <p className="add-event-date-heading" data-cy="para-place-image-helper-text">
                          {t('dashboard.places.createNew.addPlace.image.subheading')}
                        </p>
                      </Col>
                    </Row>
                    <MultipleImageUpload
                      setShowDialog={setShowDialog}
                      form={form}
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
                    />
                  </Form.Item>
                  {allTaxonomyData?.data?.map((taxonomy, index) => {
                    if (taxonomy?.isDynamicField) {
                      return (
                        <Form.Item
                          data-cy={`form-item-place-dynamic-field-title-${index}`}
                          key={index}
                          name={[formFieldNames.DYNAMIC_FIELS, taxonomy?.id]}
                          label={bilingual({
                            data: taxonomy?.name,
                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          })}
                          rules={[
                            {
                              required: requiredFieldNames?.includes(taxonomy?.id),
                              message: t('common.validations.informationRequired'),
                            },
                          ]}
                          hidden={
                            taxonomy?.isAdminOnly
                              ? !(adminCheckHandler({ calendar, user }) && requiredFieldNames?.includes(taxonomy?.id))
                              : !requiredFieldNames?.includes(taxonomy?.id)
                          }>
                          <SortableTreeSelect
                            setShowDialog={setShowDialog}
                            dataCy={`tag-place-dynamic-field`}
                            form={form}
                            draggable
                            fieldName={[formFieldNames.DYNAMIC_FIELS, taxonomy?.id]}
                            data-cy={`treeselect-place-dynamic-field-${index}`}
                            allowClear
                            treeDefaultExpandAll
                            notFoundContent={<NoContent />}
                            clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                            treeData={treeDynamicTaxonomyOptions(taxonomy?.concept, user, calendarContentLanguage)}
                          />
                        </Form.Item>
                      );
                    }
                  })}
                  <Form.Item name="addressSearch" label={t('dashboard.places.createNew.addPlace.address.address')}>
                    <PlacesAutocomplete
                      googleCallbackName="initOne"
                      searchOptions={{ componentRestrictions: { country: ['CA', 'JP'] } }}
                      value={address ?? ''}
                      onChange={handleChange}
                      onSelect={handleSelect}
                      data-cy="google-places-autocomplete">
                      {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                        <Dropdown
                          data-cy="dropdown-place-google-place"
                          open={dropdownOpen}
                          overlayClassName="filter-sort-dropdown-wrapper"
                          getPopupContainer={(trigger) => trigger.parentNode}
                          menu={{
                            items: suggestions?.map((suggestion, index) => {
                              return {
                                key: index,
                                label: (
                                  <div
                                    {...getSuggestionItemProps(suggestion)}
                                    key={index}
                                    data-cy={`div-place-google-place-${index}`}>
                                    <span data-cy="div-place-suggestion">{suggestion.description}</span>
                                  </div>
                                ),
                              };
                            }),
                            selectable: true,
                          }}
                          trigger={['click']}>
                          <StyledInput
                            data-cy="input-place-google-place"
                            autoComplete="off"
                            {...getInputProps({
                              placeholder: t(
                                'dashboard.events.addEditEvent.location.quickCreatePlace.searchPlaceholder',
                              ),
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
                  <Form.Item
                    label={t('dashboard.places.createNew.addPlace.address.streetAddress')}
                    required={requiredFieldNames?.includes(placeFormRequiredFieldNames.STREET_ADDRESS)}
                    data-cy="form-item-street-address-title"
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.STREET_ADDRESS)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.STREET_ADDRESS)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.STREET_ADDRESS)
                    }>
                    <CreateMultiLingualFormItems
                      calendarContentLanguage={calendarContentLanguage}
                      form={form}
                      name={formFieldNames.STREET_ADDRESS}
                      required={requiredFieldNames?.includes(placeFormRequiredFieldNames.STREET_ADDRESS)}
                      validations={t('common.validations.informationRequired')}
                      dataCy="input-text-area-place-street-address-"
                      placeholder={placeHolderCollectionCreator({
                        calendarContentLanguage,
                        placeholderBase: 'dashboard.places.createNew.addPlace.address.streetAddressPlaceholder',
                        t,
                      })}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        style={{
                          borderRadius: '4px',
                          border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                          width: '100%',
                        }}
                        size="large"
                      />
                    </CreateMultiLingualFormItems>
                  </Form.Item>
                  <Form.Item
                    label={t('dashboard.places.createNew.addPlace.address.city.city')}
                    data-cy="form-item-place-city-title"
                    required={requiredFieldNames?.includes(placeFormRequiredFieldNames.CITY)}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.CITY)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.CITY)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.CITY)
                    }>
                    <CreateMultiLingualFormItems
                      calendarContentLanguage={calendarContentLanguage}
                      form={form}
                      name={formFieldNames.CITY}
                      required={requiredFieldNames?.includes(placeFormRequiredFieldNames.CITY)}
                      validations={t('common.validations.informationRequired')}
                      dataCy="input-text-area-place-city-"
                      placeholder={placeHolderCollectionCreator({
                        calendarContentLanguage,
                        placeholderBase: 'dashboard.places.createNew.addPlace.address.city.placeholder',
                        t,
                      })}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        style={{
                          borderRadius: '4px',
                          border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                          width: '100%',
                        }}
                        size="large"
                      />
                    </CreateMultiLingualFormItems>
                  </Form.Item>
                  <Form.Item
                    data-cy="form-item-postal-code-title"
                    name={formFieldNames.POSTAL_CODE}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.POSTAL_CODE)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.POSTAL_CODE)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.POSTAL_CODE)
                    }
                    label={t('dashboard.places.createNew.addPlace.address.postalCode.postalCode')}
                    rules={[
                      {
                        required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.POSTAL_CODE),
                        message: t('dashboard.places.createNew.addPlace.validations.postalCodeRequired'),
                      },
                      {
                        whitespace: true,
                        message: t('dashboard.places.createNew.addPlace.validations.postalCodeRequired'),
                      },
                    ]}>
                    <StyledInput
                      placeholder={t('dashboard.places.createNew.addPlace.address.postalCode.placeholder')}
                      data-cy="input-postal-code"
                    />
                  </Form.Item>
                  <Row gutter={[16, 0]}>
                    <Col span={12}>
                      <Form.Item
                        label={t('dashboard.places.createNew.addPlace.address.province.province')}
                        data-cy="form-item-province-title"
                        required={requiredFieldNames?.includes(placeFormRequiredFieldNames.PROVINCE)}
                        hidden={
                          standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.PROVINCE)
                            ? !(
                                adminCheckHandler({ calendar, user }) &&
                                requiredFieldNames?.includes(placeFormRequiredFieldNames?.PROVINCE)
                              )
                            : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.PROVINCE)
                        }>
                        <CreateMultiLingualFormItems
                          calendarContentLanguage={calendarContentLanguage}
                          form={form}
                          name={formFieldNames.PROVINCE}
                          required={requiredFieldNames?.includes(placeFormRequiredFieldNames.PROVINCE)}
                          validations={t('common.validations.informationRequired')}
                          dataCy="input-text-area-province-"
                          placeholder={placeHolderCollectionCreator({
                            calendarContentLanguage,
                            placeholderBase: 'dashboard.places.createNew.addPlace.address.province.placeholder',
                            t,
                          })}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            style={{
                              borderRadius: '4px',
                              border: `${
                                calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'
                              }`,
                              width: '100',
                            }}
                            size="large"
                          />
                        </CreateMultiLingualFormItems>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={t('dashboard.places.createNew.addPlace.address.country.country')}
                        data-cy="form-item-country-title"
                        required={requiredFieldNames?.includes(placeFormRequiredFieldNames.COUNTRY)}
                        hidden={
                          standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.COUNTRY)
                            ? !(
                                adminCheckHandler({ calendar, user }) &&
                                requiredFieldNames?.includes(placeFormRequiredFieldNames?.COUNTRY)
                              )
                            : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.COUNTRY)
                        }>
                        <CreateMultiLingualFormItems
                          calendarContentLanguage={calendarContentLanguage}
                          form={form}
                          name={formFieldNames.COUNTRY}
                          required={requiredFieldNames?.includes(placeFormRequiredFieldNames.COUNTRY)}
                          validations={t('common.validations.informationRequired')}
                          dataCy="input-text-area-country-"
                          placeholder={placeHolderCollectionCreator({
                            calendarContentLanguage,
                            placeholderBase: 'dashboard.places.createNew.addPlace.address.country.placeholder',
                            t,
                          })}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            style={{
                              borderRadius: '4px',
                              border: `${
                                calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'
                              }`,
                              width: '100',
                            }}
                            size="large"
                          />
                        </CreateMultiLingualFormItems>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name={formFieldNames.COORDINATES}
                    data-cy="form--item-place-coordinates-title"
                    label={t('dashboard.places.createNew.addPlace.address.coordinates.coordinates')}
                    rules={[
                      {
                        required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.COORDINATES),
                        message: t('common.validations.informationRequired'),
                      },
                    ]}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.COORDINATES)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.COORDINATES)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.COORDINATES)
                    }>
                    <StyledInput data-cy="input-place-coordinates" />
                  </Form.Item>
                  <Form.Item name={formFieldNames.MAP} hidden={!coordinates.latitude || !coordinates.longitude}>
                    {coordinates.latitude && coordinates.longitude && (
                      <MapComponent
                        longitude={coordinates.longitude}
                        latitude={coordinates.latitude}
                        setCoordinates={setCoordinates}
                        form={form}
                        fieldName={formFieldNames.COORDINATES}
                        handleGeocode={handleGeocode}
                      />
                    )}
                  </Form.Item>
                  <Form.Item
                    data-cy="form-item-place-region"
                    name={formFieldNames.REGION}
                    label={taxonomyDetails(
                      allTaxonomyData?.data,
                      user,
                      placeTaxonomyMappedFieldTypes.REGION,
                      'name',
                      false,
                    )}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.REGION)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.REGION)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.REGION)
                    }
                    style={{
                      display:
                        !taxonomyDetails(
                          allTaxonomyData?.data,
                          user,
                          placeTaxonomyMappedFieldTypes.REGION,
                          'name',
                          false,
                        ) && 'none',
                    }}
                    rules={[
                      {
                        required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.REGION),
                        message: t('common.validations.informationRequired'),
                      },
                    ]}>
                    <SortableTreeSelect
                      setShowDialog={setShowDialog}
                      dataCy={`tag-place`}
                      form={form}
                      draggable
                      fieldName={formFieldNames.REGION}
                      data-cy="treeselect-place-region"
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
                    />
                  </Form.Item>
                  <Form.Item
                    data-cy="form-item-opening-hours-title"
                    name={formFieldNames.OPENING_HOURS}
                    className={`${formFieldNames.OPENING_HOURS} subheading-wrap`}
                    label={t('dashboard.places.createNew.addPlace.address.openingHours.openingHoursLink')}
                    style={{
                      display: !requiredFieldNames?.includes(placeFormRequiredFieldNames.OPENING_HOURS) && 'none',
                    }}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.OPENING_HOURS)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.OPENING_HOURS)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.OPENING_HOURS)
                    }
                    rules={[
                      {
                        type: 'url',
                        message: t('dashboard.events.addEditEvent.validations.url'),
                      },
                      {
                        required: requiredFieldNames?.includes(placeFormRequiredFieldNames.OPENING_HOURS),
                        message: t('common.validations.informationRequired'),
                      },
                    ]}>
                    <StyledInput
                      data-cy="input-place-opening-hours"
                      addonBefore="URL"
                      autoComplete="off"
                      placeholder={t('dashboard.places.createNew.addPlace.address.openingHours.placeholder')}
                    />
                  </Form.Item>
                  <Form.Item
                    data-cy="form-item-contains-place-title"
                    name={formFieldNames.CONTAINS_PLACE}
                    className="subheading-wrap"
                    label={t('dashboard.places.createNew.addPlace.containsPlace.containsPlace')}
                    required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.CONTAINS_PLACE)}
                    rules={[
                      () => ({
                        validator() {
                          if (requiredFieldNames?.includes(placeFormRequiredFieldNames?.CONTAINS_PLACE)) {
                            if (selectedContainsPlaces?.length > 0) {
                              return Promise.resolve();
                            } else return Promise.reject(new Error(t('common.validations.informationRequired')));
                          }
                        },
                      }),
                    ]}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.CONTAINS_PLACE)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.CONTAINS_PLACE)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.CONTAINS_PLACE)
                    }>
                    <Popover
                      open={isPopoverOpen.containsPlace}
                      onOpenChange={(open) => {
                        debounceSearchPlace(quickCreateKeyword);
                        setIsPopoverOpen({ ...isPopoverOpen, containsPlace: open });
                      }}
                      overlayClassName="event-popover"
                      placement="bottom "
                      autoAdjustOverflow={false}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      trigger={['click']}
                      content={
                        <div>
                          <div>
                            <>
                              <div className="popover-section-header" data-cy="div-place-footlight-title">
                                {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                              </div>
                              <div className="search-scrollable-content">
                                {isEntitiesFetching && (
                                  <div
                                    style={{
                                      height: '200px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <LoadingIndicator />
                                  </div>
                                )}
                                {!isEntitiesFetching &&
                                  (allPlacesList?.length > 0 ? (
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
                                        }}
                                        data-cy="div-place-footlight">
                                        {place?.label}
                                      </div>
                                    ))
                                  ) : (
                                    <NoContent />
                                  ))}
                              </div>
                            </>
                            {quickCreateKeyword !== '' && (
                              <>
                                <div className="popover-section-header" data-cy="div-place-artsdata-title">
                                  {t('dashboard.organization.createNew.search.importsFromFootlight')}
                                </div>
                                <div className="search-scrollable-content">
                                  {isExternalSourceFetching && (
                                    <div
                                      style={{
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <LoadingIndicator />
                                    </div>
                                  )}
                                  {!isExternalSourceFetching &&
                                    (allPlacesImportsFootlight?.length > 0 ? (
                                      allPlacesImportsFootlight?.map((place, index) => (
                                        <div
                                          key={index}
                                          className="event-popover-options"
                                          onClick={() => {
                                            setSelectedContainsPlaces([...selectedContainsPlaces, place]);
                                            setIsPopoverOpen({
                                              ...isPopoverOpen,
                                              containsPlace: false,
                                            });
                                          }}
                                          data-cy="div-place-footlight-import">
                                          {place?.label}
                                        </div>
                                      ))
                                    ) : (
                                      <NoContent />
                                    ))}
                                </div>
                              </>
                            )}
                            {quickCreateKeyword !== '' && (
                              <>
                                <div className="popover-section-header" data-cy="div-place-artsdata-title">
                                  {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                                </div>
                                <div className="search-scrollable-content">
                                  {isExternalSourceFetching && (
                                    <div
                                      style={{
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <LoadingIndicator />
                                    </div>
                                  )}
                                  {!isExternalSourceFetching &&
                                    (allPlacesArtsdataList?.length > 0 ? (
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
                                          }}
                                          data-cy="div-place-artsdata">
                                          {place?.label}
                                        </div>
                                      ))
                                    ) : (
                                      <NoContent />
                                    ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      }>
                      <EventsSearch
                        data-cy="input-contains-place"
                        style={{ borderRadius: '4px', width: '100%' }}
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
                          data-cy={`selected-contains-place-${index}`}
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
                  <Form.Item
                    name={formFieldNames.CONTAINED_IN_PLACE}
                    className="subheading-wrap"
                    data-cy="form-item-contains-place"
                    label={t('dashboard.places.createNew.addPlace.containedInPlace.containedInPlace')}
                    required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.CONTAINED_IN_PLACE)}
                    rules={[
                      () => ({
                        validator() {
                          if (requiredFieldNames?.includes(placeFormRequiredFieldNames?.CONTAINED_IN_PLACE)) {
                            if (containedInPlace) {
                              return Promise.resolve();
                            } else return Promise.reject(new Error(t('common.validations.informationRequired')));
                          }
                        },
                      }),
                    ]}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.CONTAINED_IN_PLACE)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.CONTAINED_IN_PLACE)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.CONTAINED_IN_PLACE)
                    }>
                    <Popover
                      data-cy="popover-place-contained-in-place"
                      open={isPopoverOpen.containedInPlace}
                      onOpenChange={(open) => {
                        debounceSearchPlace(quickCreateKeyword);
                        setIsPopoverOpen({ ...isPopoverOpen, containedInPlace: open });
                      }}
                      overlayClassName="event-popover"
                      placement="bottom"
                      autoAdjustOverflow={false}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      trigger={['click']}
                      content={
                        <div>
                          <div>
                            <>
                              <div className="popover-section-header" data-cy="div-contained-in-place-footlight-title">
                                {t('dashboard.organization.createNew.search.footlightSectionHeading')}
                              </div>
                              <div className="search-scrollable-content">
                                {isEntitiesFetching && (
                                  <div
                                    style={{
                                      height: '200px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <LoadingIndicator />
                                  </div>
                                )}
                                {!isEntitiesFetching &&
                                  (allPlacesList?.length > 0 ? (
                                    allPlacesList?.map((place, index) => (
                                      <div
                                        data-cy={`div-contained-in-place-footlight-${index}`}
                                        key={index}
                                        className={`event-popover-options ${
                                          containedInPlace?.value == place?.value
                                            ? 'event-popover-options-active'
                                            : null
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
                                  ))}
                              </div>
                            </>
                            {quickCreateKeyword !== '' && (
                              <>
                                <div className="popover-section-header" data-cy="div-contained-in-place-artsdata-title">
                                  {t('dashboard.organization.createNew.search.importsFromFootlight')}
                                </div>
                                <div className="search-scrollable-content">
                                  {isExternalSourceFetching && (
                                    <div
                                      style={{
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <LoadingIndicator />
                                    </div>
                                  )}
                                  {!isExternalSourceFetching &&
                                    (allPlacesImportsFootlight?.length > 0 ? (
                                      allPlacesImportsFootlight?.map((place, index) => (
                                        <div
                                          data-cy={`div-contained-in-place-artsdata-${index}`}
                                          key={index}
                                          className="event-popover-options"
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
                                    ))}
                                </div>
                              </>
                            )}
                            {quickCreateKeyword !== '' && (
                              <>
                                <div className="popover-section-header" data-cy="div-contained-in-place-artsdata-title">
                                  {t('dashboard.organization.createNew.search.artsDataSectionHeading')}
                                </div>
                                <div className="search-scrollable-content">
                                  {isExternalSourceFetching && (
                                    <div
                                      style={{
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <LoadingIndicator />
                                    </div>
                                  )}
                                  {!isExternalSourceFetching &&
                                    (allPlacesArtsdataList?.length > 0 ? (
                                      allPlacesArtsdataList?.map((place, index) => (
                                        <div
                                          data-cy={`div-contained-in-place-artsdata-${index}`}
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
                                    ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      }>
                      <EventsSearch
                        data-cy="input-contained-in-place-search"
                        style={{ borderRadius: '4px', width: '100%' }}
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
                  <Form.Item
                    data-cy="form-item-accessibility-title"
                    name={formFieldNames.PLACE_ACCESSIBILITY}
                    label={taxonomyDetails(
                      allTaxonomyData?.data,
                      user,
                      placeTaxonomyMappedFieldTypes.PLACE_ACCESSIBILITY,
                      'name',
                      false,
                    )}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.PLACE_ACCESSIBILITY)
                        ? !(
                            adminCheckHandler({ calendar, user }) &&
                            requiredFieldNames?.includes(placeFormRequiredFieldNames?.PLACE_ACCESSIBILITY)
                          )
                        : !requiredFieldNames?.includes(placeFormRequiredFieldNames?.PLACE_ACCESSIBILITY)
                    }
                    style={{
                      width: '100%',
                      display:
                        !taxonomyDetails(
                          allTaxonomyData?.data,
                          user,
                          placeTaxonomyMappedFieldTypes.PLACE_ACCESSIBILITY,
                          'name',
                          false,
                        ) && 'none',
                    }}
                    rules={[
                      {
                        required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.PLACE_ACCESSIBILITY),
                        message: t('common.validations.informationRequired'),
                      },
                    ]}>
                    <SortableTreeSelect
                      setShowDialog={setShowDialog}
                      dataCy={`tag-venue-accessibility`}
                      form={form}
                      draggable
                      fieldName={formFieldNames.PLACE_ACCESSIBILITY}
                      data-cy="treeselect-venue-accessibility"
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
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </CustomModal>
        ) : (
          <>
            <QuickCreateSaving
              title={t('dashboard.events.addEditEvent.quickCreate.loaderModal.title')}
              text={t('dashboard.events.addEditEvent.quickCreate.loaderModal.text')}
              open={!loaderModalOpen}
              onCancel={() => setLoaderModalOpen(false)}
            />
          </>
        )}
      </>
    )
  );
}

export default QuickCreatePlace;
