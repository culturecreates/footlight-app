import React, { useRef, useEffect, useState, useCallback } from 'react';
import './createNewPlace.css';
import '../AddEvent/addEvent.css';
import { ReactComponent as OrganizationLogo } from '../../../assets/icons/organization-light.svg';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import { Button, Col, Form, Input, Popover, Row, message, notification, Dropdown } from 'antd';
import Icon, {
  LeftOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import OutlinedButton from '../../..//components/Button/Outlined';
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
import { useDispatch, useSelector } from 'react-redux';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import Card from '../../../components/Card/Common/Event';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
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
import {
  useGetEntitiesByIdQuery,
  useLazyGetEntitiesByIdQuery,
  useLazyGetEntitiesQuery,
  useLazyGetEntityDependencyDetailsQuery,
} from '../../../services/entities';
import { entitiesClass } from '../../../constants/entitiesClass';
import { placesOptions } from '../../../components/Select/selectOption.settings';
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
import { RouteLeavingGuard } from '../../../hooks/usePrompt';
import { useAddPostalAddressMutation, useUpdatePostalAddressMutation } from '../../../services/postalAddress';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { placeFormRequiredFieldNames } from '../../../constants/placeFormRequiredFieldNames';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { getExternalSourceId } from '../../../utils/getExternalSourceId';
import { externalSourceOptions, sourceOptions } from '../../../constants/sourceOptions';
import { useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import { sameAsTypes } from '../../../constants/sameAsTypes';
import ChangeTypeLayout from '../../../layout/ChangeTypeLayout/ChangeTypeLayout';
import moment from 'moment';
import {
  clearActiveFallbackFieldsInfo,
  getActiveFallbackFieldsInfo,
  getLanguageLiteralBannerDisplayStatus,
  setLanguageLiteralBannerDisplayStatus,
} from '../../../redux/reducer/languageLiteralSlice';
import Alert from '../../../components/Alert';
import MultipleImageUpload from '../../../components/MultipleImageUpload';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems/CreateMultiLingualFormItems';
import { isDataValid, placeHolderCollectionCreator } from '../../../utils/MultiLingualFormItemSupportFunctions';
import MultiLingualTextEditor from '../../../components/MultilingualTextEditor/MultiLingualTextEditor';
import MapComponent from '../../../components/MapComponent';

const { TextArea } = Input;

function CreateNewPlace() {
  const timestampRef = useRef(Date.now()).current;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  setContentBackgroundColor('#F9FAFF');
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);
  const languageLiteralBannerDisplayStatus = useSelector(getLanguageLiteralBannerDisplayStatus);
  const { user } = useSelector(getUserDetails);
  const { calendarId } = useParams();
  let [searchParams] = useSearchParams();

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
  };
  const placeId = searchParams.get('id');
  const externalCalendarEntityId = searchParams.get('entityId');

  const artsDataId = location?.state?.data?.id ?? null;
  const isRoutingToEventPage = location?.state?.data?.isRoutingToEventPage;
  const isRoutingToOrganization = location?.state?.data?.isRoutingToOrganization;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
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
  let imageConfig = currentCalendarData?.imageConfig?.length > 0 && currentCalendarData?.imageConfig[0];

  const { currentData: placeData, isLoading: isPlaceLoading } = useGetPlaceQuery(
    { placeId: placeId, calendarId, sessionId: timestampRef },
    { skip: placeId ? false : true },
  );

  let placeIdsQuery = new URLSearchParams();
  placeIdsQuery.append('ids', externalCalendarEntityId);
  const { data: externalCalendarEntityData, isLoading: externalEntityLoading } = useGetEntitiesByIdQuery(
    { ids: placeIdsQuery, calendarId, sessionId: timestampRef },
    { skip: externalCalendarEntityId ? false : true },
  );
  const [getDerivedEntities, { isFetching: isEntityDetailsLoading }] = useLazyGetEntityDependencyDetailsQuery({
    sessionId: timestampRef,
  });

  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PLACE);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery({
    sessionId: timestampRef,
  });
  const [addImage, { error: isAddImageError, isLoading: addImageLoading }] = useAddImageMutation();
  const [addPlace, { isLoading: addPlaceLoading }] = useAddPlaceMutation();
  const [updatePlace, { isLoading: updatePlaceLoading }] = useUpdatePlaceMutation();
  const [addPostalAddress] = useAddPostalAddressMutation();
  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery({ sessionId: timestampRef });
  const [updatePostalAddress] = useUpdatePostalAddressMutation();
  const [getEntitiesById] = useLazyGetEntitiesByIdQuery();

  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState({
    containedInPlace: false,
    containsPlace: false,
  });

  const [derivedEntitiesData, setDerivedEntitiesData] = useState();
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const [containedInPlace, setContainedInPlace] = useState();
  const [selectedContainsPlaces, setSelectedContainsPlaces] = useState([]);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [allPlacesArtsdataList, setAllPlacesArtsdataList] = useState([]);
  const [allPlacesImportsFootlight, setAllPlacesImportsFootlight] = useState([]);
  const [descriptionMinimumWordCount] = useState(1);
  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [addedFields, setAddedFields] = useState([]);
  const [scrollToSelectedField, setScrollToSelectedField] = useState();
  const [showDialog, setShowDialog] = useState(false);
  const [address, setAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickCreateKeyword, setQuickCreateKeyword] = useState('');
  const [publishValidateFields, setPublishValidateFields] = useState([]);

  let externalEntityData = externalCalendarEntityData?.length > 0 && externalCalendarEntityData[0];
  externalEntityData = {
    ...externalEntityData,
    regions: [],
    additionalType: [],
    accessibility: [],
  };
  let mainImageData = placeData?.image?.find((image) => image?.isMain) || null;

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

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

        if (externalCalendarEntityId) {
          let sameAs = [
            {
              uri: externalCalendarEntityId,
              type: sameAsTypes.FOOTLIGHT_IDENTIFIER,
            },
          ];
          if (externalEntityData?.sameAs) {
            placeObj = {
              ...placeObj,
              sameAs: externalEntityData?.sameAs?.concat(sameAs),
            };
          }
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
                    if (isRoutingToEventPage && isRoutingToOrganization) {
                      navigate(isRoutingToOrganization, {
                        state: {
                          data: {
                            isRoutingToEventPage: location.state?.data?.isRoutingToEventPage,
                          },
                        },
                      });
                    } else if (isRoutingToEventPage && !isRoutingToOrganization) {
                      navigate(isRoutingToEventPage);
                    } else if (!isRoutingToEventPage && isRoutingToOrganization) {
                      navigate(isRoutingToOrganization);
                    } else {
                      notification.success({
                        description: t('dashboard.places.createNew.addPlace.notification.editSuccess'),
                        placement: 'top',
                        closeIcon: <></>,
                        maxCount: 1,
                        duration: 3,
                      });
                      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}`);
                    }
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
                    if (isRoutingToEventPage && isRoutingToOrganization) {
                      navigate(isRoutingToOrganization, {
                        state: {
                          data: {
                            isRoutingToEventPage: location.state?.data?.isRoutingToEventPage,
                          },
                        },
                      });
                    } else if (isRoutingToEventPage && !isRoutingToOrganization) {
                      navigate(isRoutingToEventPage);
                    } else if (!isRoutingToEventPage && isRoutingToOrganization) {
                      navigate(isRoutingToOrganization);
                    } else {
                      notification.success({
                        description: t('dashboard.places.createNew.addPlace.notification.editSuccess'),
                        placement: 'top',
                        closeIcon: <></>,
                        maxCount: 1,
                        duration: 3,
                      });
                      navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}`);
                    }
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
        .validateFields(publishValidateFields ?? [])
        .then(async () => {
          var values = form.getFieldsValue(true);

          let placeObj,
            dynamicFields,
            containedInPlaceObj,
            latitude,
            longitude,
            containsPlace = [];

          let postalObj = calendarContentLanguage.reduce(
            (acc, language) => {
              const languageKey = contentLanguageKeyMap[language];

              const addIfValidString = (field, fieldName) => {
                if (values?.[fieldName]?.[languageKey] && typeof values[fieldName]?.[languageKey] === 'string') {
                  acc[field] = {
                    ...(acc[field] || {}),
                    [languageKey]: values[fieldName]?.[languageKey]?.trim(),
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

          if (values?.dynamicFields) {
            dynamicFields = Object.keys(values?.dynamicFields)?.map((dynamicField) => {
              return {
                taxonomyId: dynamicField,
                conceptIds: values?.dynamicFields[dynamicField],
              };
            });
          }
          let imageCrop = form.getFieldValue('imageCrop') ? [form.getFieldValue('imageCrop')] : [];
          if (imageCrop.length > 0) {
            imageCrop = [
              {
                large: {
                  xCoordinate: imageCrop[0]?.large?.x,
                  yCoordinate: imageCrop[0]?.large?.y,
                  height: imageCrop[0]?.large?.height,
                  width: imageCrop[0]?.large?.width,
                },
                thumbnail: {
                  xCoordinate: imageCrop[0]?.thumbnail?.x,
                  yCoordinate: imageCrop[0]?.thumbnail?.y,
                  height: imageCrop[0]?.thumbnail?.height,
                  width: imageCrop[0]?.thumbnail?.width,
                },
                original: {
                  entityId: imageCrop[0]?.original?.entityId,
                  height: imageCrop[0]?.original?.height,
                  width: imageCrop[0]?.original?.width,
                },
                isMain: true,
              },
            ];
          }
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
          if (values?.coordinates) {
            const coordinates = values.coordinates.split(/[, ]+/);
            latitude = coordinates[0] || undefined;
            longitude = coordinates[1] || undefined;
          }

          const getFilteredFieldValue = (values) => {
            let filteredValues = {};
            Object.keys(values).map((key) => {
              const value = values[key]?.trim();
              if (value) filteredValues[key] = value;
            });
            return filteredValues;
          };

          placeObj = {
            name: getFilteredFieldValue(values.name),
            ...(isDataValid(values?.description) && {
              description: getFilteredFieldValue(values.description),
            }),
            ...(values?.openingHours && { openingHours: { uri: urlProtocolCheck(values?.openingHours) } }),
            ...(values?.containedInPlace && {
              containedInPlace: containedInPlaceObj,
            }),
            geo: {
              latitude,
              longitude,
            },

            ...(isDataValid(values?.accessibilityNote) && {
              accessibilityNote: getFilteredFieldValue(values?.accessibilityNote),
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

            ...(isDataValid(values?.disambiguatingDescription) && {
              disambiguatingDescription: getFilteredFieldValue(values?.disambiguatingDescription),
            }),
            ...(values?.dynamicFields && { dynamicFields }),
            ...(values?.containsPlace && { containsPlace }),
          };

          const uploadImageList = async () => {
            for (let i = 0; i < values.multipleImagesCrop.length; i++) {
              const file = values.multipleImagesCrop[i]?.originFileObj;
              if (!file) {
                if (values.multipleImagesCrop[i]?.cropValues) imageCrop.push(values.multipleImagesCrop[i]?.cropValues);
                else imageCrop.push(values.multipleImagesCrop[i]);
                continue;
              }

              const formdata = new FormData();
              formdata.append('file', file);

              try {
                const response = await addImage({ data: formdata, calendarId }).unwrap();

                // Process each image in the list
                const { large, thumbnail } = values.multipleImagesCrop[i]?.cropValues || {};
                const { original, height, width } = response?.data || {};

                const galleryImage = {
                  large: {
                    xCoordinate: large?.x,
                    yCoordinate: large?.y,
                    height: large?.height,
                    width: large?.width,
                  },
                  original: {
                    entityId: original?.entityId ?? null,
                    height,
                    width,
                  },
                  thumbnail: {
                    xCoordinate: thumbnail?.x,
                    yCoordinate: thumbnail?.y,
                    height: thumbnail?.height,
                    width: thumbnail?.width,
                  },
                };

                // Add the processed image to imageCrop
                imageCrop.push(galleryImage);
              } catch (error) {
                console.log(error);
                throw error; // rethrow to stop further execution
              }
            }
          };
          if (values?.dragger?.length > 0 && values?.dragger[0]?.originFileObj) {
            const formdata = new FormData();
            formdata.append('file', values?.dragger[0].originFileObj);
            formdata &&
              addImage({ data: formdata, calendarId })
                .unwrap()
                .then(async (response) => {
                  if (featureFlags.imageCropFeature) {
                    let entityId = response?.data?.original?.entityId;
                    imageCrop = [
                      {
                        large: imageCrop[0]?.large,
                        thumbnail: imageCrop[0]?.thumbnail,
                        isMain: true,
                        original: {
                          entityId,
                          height: response?.data?.height,
                          width: response?.data?.width,
                        },
                      },
                    ];
                  } else
                    imageCrop = [
                      {
                        large: imageCrop[0]?.large,
                        thumbnail: imageCrop[0]?.thumbnail,
                        isMain: true,
                        original: {
                          entityId: response?.data?.original?.entityId,
                          height: response?.data?.height,
                          width: response?.data?.width,
                        },
                      },
                    ];

                  if (values.multipleImagesCrop?.length > 0) await uploadImageList();
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
            if (values.multipleImagesCrop?.length > 0) await uploadImageList();
            if (
              values?.draggerWrap &&
              values?.dragger?.length === 0 &&
              (!values.multipleImagesCrop || values.multipleImagesCrop?.length === 0)
            ) {
              // Main image is removed and no new image is added
              // No gallery images are added
              placeObj['image'] = [];
            } else placeObj['image'] = imageCrop;

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
                  data-cy="button-place-save-as-warning"
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
        if (placeId) containedInPlaceFilter = response?.filter((place) => place?.id != placeId);
        else containedInPlaceFilter = response;

        setAllPlacesList(placesOptions(containedInPlaceFilter, user, calendarContentLanguage, sourceOptions.CMS));
      })
      .catch((error) => console.log(error));
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
  }, []);

  useEffect(() => {
    dispatch(clearActiveFallbackFieldsInfo());
  }, []);

  useEffect(() => {
    let shouldDisplay = true;

    const fallbackFieldNames = Object.keys(activeFallbackFieldsInfo) || [];
    let individualFallbackFieldsCollection = [];
    fallbackFieldNames.forEach((name) => {
      individualFallbackFieldsCollection.push(...Object.values(activeFallbackFieldsInfo[name] || []));
    });

    individualFallbackFieldsCollection.forEach((element) => {
      if (element?.tagDisplayStatus) {
        shouldDisplay = false;
      }
    });

    if (!shouldDisplay) {
      dispatch(setLanguageLiteralBannerDisplayStatus(true));
    } else {
      dispatch(setLanguageLiteralBannerDisplayStatus(false));
    }
  }, [activeFallbackFieldsInfo]);

  useEffect(() => {
    if (selectedContainsPlaces) form.setFieldValue(formFieldNames.CONTAINS_PLACE, selectedContainsPlaces);
  }, [selectedContainsPlaces]);

  useEffect(() => {
    if (calendarId && currentCalendarData) {
      let initialAddedFields = [...addedFields],
        initialPlaceAccessibiltiy = [],
        initialPlace;
      if (placeData) {
        if (routinghandler(user, calendarId, placeData?.createdByUserId, null, true)) {
          if (placeData?.sameAs?.length > 0) {
            let sourceId = artsDataLinkChecker(placeData?.sameAs);
            sourceId = getExternalSourceId(sourceId);
            getArtsDataPlace(sourceId);
          }
          if (placeData?.containedInPlace?.entityId) {
            getPlace({ placeId: placeData?.containedInPlace?.entityId, calendarId })
              .unwrap()
              .then((response) => {
                if (response?.accessibility?.length > 0) {
                  let taxonomyClassQuery = new URLSearchParams();
                  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PLACE);
                  getAllTaxonomy({
                    calendarId,
                    search: '',
                    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
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
          if (placeData?.image?.length > 0) {
            const mainImage = placeData.image.find((image) => image?.isMain) || null;
            const imageGalleryImages = placeData.image.filter((image) => !image?.isMain);

            if (mainImage) {
              form.setFieldsValue({
                imageCrop: {
                  large: {
                    x: mainImage?.large?.xCoordinate,
                    y: mainImage?.large?.yCoordinate,
                    height: mainImage?.large?.height,
                    width: mainImage?.large?.width,
                  },
                  original: {
                    entityId: mainImage?.original?.entityId ?? null,
                    height: mainImage?.original?.height,
                    width: mainImage?.original?.width,
                  },
                  thumbnail: {
                    x: mainImage?.thumbnail?.xCoordinate,
                    y: mainImage?.thumbnail?.yCoordinate,
                    height: mainImage?.thumbnail?.height,
                    width: mainImage?.thumbnail?.width,
                  },
                },
              });
            }

            if (imageGalleryImages.length > 0) {
              const galleryImages = imageGalleryImages.map((image) => ({
                large: {
                  x: image?.large?.xCoordinate,
                  y: image?.large?.yCoordinate,
                  height: image?.large?.height,
                  width: image?.large?.width,
                },
                original: {
                  entityId: image?.original?.entityId ?? null,
                  height: image?.original?.height,
                  width: image?.original?.width,
                },
                thumbnail: {
                  x: image?.thumbnail?.xCoordinate,
                  y: image?.thumbnail?.yCoordinate,
                  height: image?.thumbnail?.height,
                  width: image?.thumbnail?.width,
                },
              }));

              form.setFieldsValue({
                multipleImagesCrop: galleryImages,
              });
            }
          }
          if (placeData?.containsPlace?.length > 0) {
            let initialContainsPlace = placeData?.containsPlace?.map((place) => {
              return {
                disambiguatingDescription: place?.disambiguatingDescription,
                id: place?.id,
                name: place?.name,
                image: place?.image,
                uri: artsDataLinkChecker(place?.sameAs),
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

      if (externalCalendarEntityData?.length > 0 && externalCalendarEntityId) {
        if (externalCalendarEntityData[0]?.sameAs?.length > 0) {
          let sourceId = artsDataLinkChecker(externalCalendarEntityData[0]?.sameAs);
          sourceId = getExternalSourceId(sourceId);
          getArtsDataPlace(sourceId);
        }

        if (externalCalendarEntityData[0]?.image?.length > 0) {
          const mainImage = externalCalendarEntityData[0].image.find((image) => image?.isMain) || null;
          const imageGalleryImages = externalCalendarEntityData[0].image.filter((image) => !image?.isMain);

          if (mainImage) {
            form.setFieldsValue({
              imageCrop: {
                large: {
                  x: mainImage?.large?.xCoordinate,
                  y: mainImage?.large?.yCoordinate,
                  height: mainImage?.large?.height,
                  width: mainImage?.large?.width,
                },
                original: {
                  entityId: mainImage?.original?.entityId ?? null,
                  height: mainImage?.original?.height,
                  width: mainImage?.original?.width,
                },
                thumbnail: {
                  x: mainImage?.thumbnail?.xCoordinate,
                  y: mainImage?.thumbnail?.yCoordinate,
                  height: mainImage?.thumbnail?.height,
                  width: mainImage?.thumbnail?.width,
                },
              },
            });
          }

          if (imageGalleryImages.length > 0) {
            const galleryImages = imageGalleryImages.map((image) => ({
              large: {
                x: image?.large?.xCoordinate,
                y: image?.large?.yCoordinate,
                height: image?.large?.height,
                width: image?.large?.width,
              },
              original: {
                entityId: image?.original?.entityId ?? null,
                height: image?.original?.height,
                width: image?.original?.width,
              },
              thumbnail: {
                x: image?.thumbnail?.xCoordinate,
                y: image?.thumbnail?.yCoordinate,
                height: image?.thumbnail?.height,
                width: image?.thumbnail?.width,
              },
            }));

            form.setFieldsValue({
              multipleImagesCrop: galleryImages,
            });
          }
        }

        if (externalCalendarEntityData[0]?.place?.entityId) {
          let placeIdsQuery = new URLSearchParams();
          placeIdsQuery.append('ids', externalCalendarEntityData[0]?.place?.entityId);
          getEntitiesById({ ids: placeIdsQuery, calendarId })
            .unwrap()
            .then((response) => {
              if (response?.length > 0) {
                initialPlace = {
                  ...response[0],
                  ['accessibility']: [],
                  ['type']: entitiesClass?.place,
                };
                setContainedInPlace(
                  placesOptions([initialPlace], user, calendarContentLanguage)[0],
                  externalSourceOptions.FOOTLIGHT,
                );
              }
            })
            .catch((error) => console.log(error));
          form.setFieldValue(
            formFieldNames.CONTAINED_IN_PLACE,
            externalCalendarEntityData[0]?.containedInPlace?.entityId,
          );
        }

        if (externalCalendarEntityData[0]?.containsPlace?.length > 0) {
          let initialContainsPlace = externalCalendarEntityData[0]?.containsPlace?.map((place) => {
            return {
              disambiguatingDescription: place?.disambiguatingDescription,
              id: place?.id,
              name: place?.name,
              image: place?.image,
              uri: artsDataLinkChecker(place?.sameAs),
            };
          });
          setSelectedContainsPlaces(
            placesOptions(initialContainsPlace, user, calendarContentLanguage, externalSourceOptions.FOOTLIGHT),
          );
        }
        if (externalCalendarEntityData[0]?.openingHours)
          initialAddedFields = initialAddedFields?.concat(formFieldNames?.OPENING_HOURS);
        if (externalCalendarEntityData[0]?.accessibilityNote)
          initialAddedFields = initialAddedFields?.concat(formFieldNames?.ACCESSIBILITY_NOTE_WRAP);
        form.setFieldsValue({
          latitude: externalCalendarEntityData[0].geo && '' + externalCalendarEntityData[0].geo.latitude,
          longitude: externalCalendarEntityData[0].geo && '' + externalCalendarEntityData[0].geo.longitude,
        });
        setAddedFields(initialAddedFields);
      }
    }
  }, [isPlaceLoading, currentCalendarData, externalEntityLoading]);

  useEffect(() => {
    if (isReadOnly) {
      if (placeId) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}/${placeId}`, { replace: true });
      else navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}`, { replace: true });
    }
  }, [isReadOnly]);

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
            // setDescriptionMinimumWordCount(Number(requiredField?.rule?.minimumWordCount));
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
            // publishValidateFields.push('location-form-wrapper');
            break;
          case placeFormRequiredFieldNames.POSTAL_CODE:
            publishValidateFields.push(formFieldNames.POSTAL_CODE);
            break;
          case placeFormRequiredFieldNames.PROVINCE:
            publishValidateFields.push(formFieldNames.PROVINCE);
            break;
          case placeFormRequiredFieldNames.COUNTRY:
            publishValidateFields.push(formFieldNames.COUNTRY);
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
      setAddedFields(initialAddedFields);
    }
  }, [currentCalendarData]);

  useEffect(() => {
    const newEntityName = location?.state?.name;
    if (artsDataId) {
      getArtsDataPlace(artsDataId);
    } else if (newEntityName) {
      calendarContentLanguage.forEach((language) => {
        const langKey = contentLanguageKeyMap[language];
        form.setFieldValue([formFieldNames.NAME, `${langKey}`], newEntityName);
      });
    }
  }, []);

  return !isPlaceLoading && !artsDataLoading && !taxonomyLoading && !isEntityDetailsLoading ? (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <RouteLeavingGuard isBlocking={showDialog} />

      <div className="add-edit-wrapper create-new-place-wrapper">
        <Form form={form} layout="vertical" name="place" onValuesChange={onValuesChangeHandler}>
          <Row gutter={[32, 24]} className="add-edit-wrapper">
            <Col span={24}>
              <Row gutter={[32, 2]}>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col>
                      <div className="button-container">
                        <Button
                          data-cy="button-place-back-to-previous"
                          type="link"
                          onClick={() => {
                            if (isRoutingToEventPage && isRoutingToOrganization) {
                              navigate(isRoutingToOrganization, {
                                state: {
                                  data: {
                                    isRoutingToEventPage: location.state?.data?.isRoutingToEventPage,
                                  },
                                },
                              });
                            } else if (isRoutingToEventPage && !isRoutingToOrganization) {
                              navigate(isRoutingToEventPage);
                            } else if (!isRoutingToEventPage && isRoutingToOrganization) {
                              navigate(isRoutingToOrganization);
                            } else {
                              navigate(-1);
                            }
                          }}
                          icon={<LeftOutlined style={{ marginRight: '17px' }} />}>
                          {t('dashboard.places.createNew.search.breadcrumb')}
                        </Button>
                      </div>
                    </Col>
                    <Col>
                      <div className="add-event-button-wrap">
                        <Form.Item>
                          <PrimaryButton
                            data-cy="button-place-save"
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
                    <h4 data-cy="heading-place-add-edit">
                      {placeId
                        ? t('dashboard.places.createNew.addPlace.editPlace')
                        : t('dashboard.places.createNew.addPlace.newPlace')}
                    </h4>
                  </div>
                </Col>
                {languageLiteralBannerDisplayStatus && (
                  <Col span={24} className="language-literal-banner">
                    <Row>
                      <Col flex={'780px'}>
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                          <Col span={24}>
                            <Alert
                              message={t('common.forms.languageLiterals.bannerTitle')}
                              type="info"
                              showIcon={false}
                              action={
                                <OutlinedButton
                                  data-cy="button-change-interface-language"
                                  size="large"
                                  label={t('common.dismiss')}
                                  onClick={() => {
                                    dispatch(setLanguageLiteralBannerDisplayStatus(false));
                                    dispatch(clearActiveFallbackFieldsInfo({}));
                                  }}
                                />
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                )}
              </Row>
            </Col>
            <Card marginResponsive="0px">
              <>
                {(artsDataLinkChecker(placeData?.sameAs) || artsDataLinkChecker(artsData?.sameAs)) && (
                  <Row>
                    <Col span={24}>
                      <p className="add-entity-label" data-cy="para-place-data-source">
                        {t('dashboard.organization.createNew.addOrganization.dataSource')}
                      </p>
                    </Col>
                    <Col span={24}>
                      <ArtsDataInfo
                        artsDataLink={
                          artsDataLinkChecker(placeData?.sameAs)
                            ? artsDataLinkChecker(placeData?.sameAs)
                            : artsDataLinkChecker(artsData?.sameAs)
                        }
                        name={contentLanguageBilingual({
                          data: artsData?.name,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
                        disambiguatingDescription={contentLanguageBilingual({
                          data: artsData?.disambiguatingDescription,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                          calendarContentLanguage: calendarContentLanguage,
                        })}
                      />
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'inline' }}>
                        <span className="add-event-date-heading" data-cy="span-place-question-part-one">
                          {t('dashboard.places.createNew.addPlace.question.firstPart')}
                        </span>
                        <span
                          data-cy="span-place-question-part-two"
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
                        <span className="add-event-date-heading" data-cy="span-place-question-part-three">
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
                  <CreateMultiLingualFormItems
                    entityId={placeId}
                    calendarContentLanguage={calendarContentLanguage}
                    form={form}
                    name={formFieldNames.NAME}
                    data={
                      placeData?.name
                        ? placeData?.name
                        : artsDataId
                        ? artsData?.name
                        : externalCalendarEntityId &&
                          externalCalendarEntityData?.length > 0 &&
                          externalCalendarEntityData[0]?.name
                    }
                    required={true}
                    validations={t('dashboard.places.createNew.addPlace.validations.nameRequired')}
                    dataCy="form-item-place-name-"
                    placeholder={placeHolderCollectionCreator({
                      calendarContentLanguage,
                      placeholderBase: 'dashboard.places.createNew.addPlace.name.placeholder',
                      t,
                      hasCommonPlaceHolder: true,
                    })}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      style={{
                        borderRadius: '4px',
                        border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                        width: '423px',
                      }}
                      size="large"
                    />
                  </CreateMultiLingualFormItems>
                </Form.Item>

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
                  initialValue={placeData?.additionalType?.map((type) => {
                    return type?.entityId;
                  })}
                  rules={[
                    {
                      required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.PLACE_TYPE),
                      message: t('dashboard.places.createNew.addPlace.validations.placeTypeRequired'),
                    },
                  ]}
                  hidden={
                    standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.PLACE_TYPE)
                      ? adminCheckHandler({ calendar, user })
                        ? false
                        : true
                      : false
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
                  <TreeSelectOption
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
                    tagRender={(props) => {
                      const { label, closable, onClose } = props;
                      return (
                        <Tags
                          data-cy={`tag-place-type-${label}`}
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
                  data-cy="form-item-place-disambiguating-description-title"
                  label={t('dashboard.places.createNew.addPlace.disambiguatingDescription.disambiguatingDescription')}
                  required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.DISAMBIGUATING_DESCRIPTION)}>
                  <CreateMultiLingualFormItems
                    entityId={placeId}
                    calendarContentLanguage={calendarContentLanguage}
                    form={form}
                    name={formFieldNames.DISAMBIGUATING_DESCRIPTION}
                    data={
                      placeData?.disambiguatingDescription
                        ? placeData?.disambiguatingDescription
                        : artsDataId
                        ? artsData?.disambiguatingDescription
                        : externalCalendarEntityId &&
                          externalCalendarEntityData?.length > 0 &&
                          externalCalendarEntityData[0].disambiguatingDescription
                    }
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
                        width: '423px',
                      }}
                      size="large"
                    />
                  </CreateMultiLingualFormItems>
                </Form.Item>
                <Form.Item
                  label={t('dashboard.places.createNew.addPlace.description.description')}
                  data-cy="form-item-place-description-title"
                  required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.DESCRIPTION)}>
                  <MultiLingualTextEditor
                    data={
                      placeData?.description
                        ? placeData?.description
                        : artsData?.description && artsDataId
                        ? artsData?.description
                        : externalCalendarEntityId &&
                          externalCalendarEntityData?.length > 0 &&
                          externalCalendarEntityData[0].description
                    }
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
                  className="draggerWrap"
                  initialValue={
                    placeData?.image
                      ? mainImageData?.original?.uri
                      : externalCalendarEntityId &&
                        externalCalendarEntityData?.length > 0 &&
                        externalCalendarEntityData[0].image &&
                        externalCalendarEntityData[0].image?.original?.uri
                  }
                  {...(isAddImageError && {
                    help: t('dashboard.events.addEditEvent.validations.errorImage'),
                    validateStatus: 'error',
                  })}
                  required={requiredFieldNames?.includes(placeFormRequiredFieldNames?.IMAGE)}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator() {
                        if (requiredFieldNames?.includes(placeFormRequiredFieldNames?.IMAGE)) {
                          if (
                            (getFieldValue(formFieldNames.DRAGGER) != undefined &&
                              getFieldValue(formFieldNames.DRAGGER)?.length > 0) ||
                            (mainImageData?.original?.uri && !getFieldValue(formFieldNames.DRAGGER)) ||
                            (mainImageData?.original?.uri && getFieldValue(formFieldNames.DRAGGER)?.length > 0)
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
                    imageUrl={
                      placeId
                        ? mainImageData?.large?.uri
                        : externalCalendarEntityId &&
                          externalCalendarEntityData?.length > 0 &&
                          externalCalendarEntityData[0]?.image?.large?.uri
                    }
                    originalImageUrl={
                      placeId
                        ? mainImageData?.original?.uri
                        : externalCalendarEntityId &&
                          externalCalendarEntityData?.length > 0 &&
                          externalCalendarEntityData[0]?.image?.original?.uri
                    }
                    imageReadOnly={false}
                    preview={true}
                    setImageCropOpen={setImageCropOpen}
                    imageCropOpen={imageCropOpen}
                    form={form}
                    eventImageData={
                      placeId
                        ? mainImageData
                        : externalCalendarEntityId &&
                          externalCalendarEntityData?.length > 0 &&
                          externalCalendarEntityData[0]?.image
                    }
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
                    eventImageData={placeData?.image?.filter((image) => !image?.isMain)}
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
                        data-cy={`form-item-place-dynamic-field-title-${index}`}
                        key={index}
                        name={[formFieldNames.DYNAMIC_FIELS, taxonomy?.id]}
                        label={bilingual({
                          data: taxonomy?.name,
                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                        })}
                        initialValue={initialValues}
                        rules={[
                          {
                            required: requiredFieldNames?.includes(taxonomy?.id),
                            message: t('common.validations.informationRequired'),
                          },
                        ]}
                        hidden={taxonomy?.isAdminOnly ? (adminCheckHandler({ calendar, user }) ? false : true) : false}>
                        <TreeSelectOption
                          data-cy={`treeselect-place-dynamic-field-${index}`}
                          allowClear
                          treeDefaultExpandAll
                          notFoundContent={<NoContent />}
                          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                          treeData={treeDynamicTaxonomyOptions(taxonomy?.concept, user, calendarContentLanguage)}
                          tagRender={(props) => {
                            const { label, closable, onClose } = props;
                            return (
                              <Tags
                                data-cy={`tag-place-dynamic-field-${label}`}
                                closable={closable}
                                onClose={onClose}
                                closeIcon={
                                  <CloseCircleOutlined
                                    style={{ color: '#1b3de6', fontSize: '12px' }}
                                    data-cy={`icon-place-dynamic-taxonomy-close-${label}`}
                                  />
                                }>
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
            <Card marginResponsive="0px" title={t('dashboard.places.createNew.addPlace.address.address')}>
              <>
                <Row>
                  <Col>
                    <p className="add-event-date-heading" data-cy="para-place-address-subheading">
                      {t('dashboard.places.createNew.addPlace.address.subheading')}
                    </p>
                  </Col>
                </Row>
                <Form.Item name="addressSearch">
                  <PlacesAutocomplete
                    googleCallbackName="initTwo"
                    searchOptions={{ componentRestrictions: { country: 'CA' } }}
                    value={address}
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
                <Form.Item
                  label={t('dashboard.places.createNew.addPlace.address.streetAddress')}
                  required={true}
                  data-cy="form-item-street-address-title">
                  <CreateMultiLingualFormItems
                    entityId={placeId}
                    calendarContentLanguage={calendarContentLanguage}
                    form={form}
                    name={formFieldNames.STREET_ADDRESS}
                    data={
                      placeData?.address?.streetAddress
                        ? placeData?.address?.streetAddress
                        : artsDataId
                        ? artsData?.address?.streetAddress
                        : externalCalendarEntityId &&
                          externalCalendarEntityData?.length > 0 &&
                          externalCalendarEntityData[0]?.address?.streetAddress
                    }
                    required={true}
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
                        width: '423px',
                      }}
                      size="large"
                    />
                  </CreateMultiLingualFormItems>
                </Form.Item>
                <Form.Item
                  label={t('dashboard.places.createNew.addPlace.address.city.city')}
                  data-cy="form-item-place-city-title"
                  required={requiredFieldNames?.includes(placeFormRequiredFieldNames.CITY)}>
                  <CreateMultiLingualFormItems
                    entityId={placeId}
                    calendarContentLanguage={calendarContentLanguage}
                    form={form}
                    name={formFieldNames.CITY}
                    data={
                      placeData?.address?.addressLocality
                        ? placeData?.address?.addressLocality
                        : artsDataId
                        ? artsData?.address?.addressLocality
                        : externalCalendarEntityId &&
                          externalCalendarEntityData?.length > 0 &&
                          externalCalendarEntityData[0]?.address?.addressLocality
                    }
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
                        width: '423px',
                      }}
                      size="large"
                    />
                  </CreateMultiLingualFormItems>
                </Form.Item>
                <Form.Item
                  data-cy="form-item-postal-code-title"
                  name={formFieldNames.POSTAL_CODE}
                  initialValue={
                    placeData?.address?.postalCode
                      ? placeData?.address?.postalCode
                      : artsDataId
                      ? artsData?.address?.postalCode
                      : externalCalendarEntityId &&
                        externalCalendarEntityData?.length > 0 &&
                        externalCalendarEntityData[0]?.address?.postalCode
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
                      required={requiredFieldNames?.includes(placeFormRequiredFieldNames.PROVINCE)}>
                      <CreateMultiLingualFormItems
                        entityId={placeId}
                        calendarContentLanguage={calendarContentLanguage}
                        form={form}
                        name={formFieldNames.PROVINCE}
                        data={
                          placeData?.address?.addressRegion
                            ? placeData?.address?.addressRegion
                            : artsDataId
                            ? artsData?.address?.addressRegion
                            : externalCalendarEntityId &&
                              externalCalendarEntityData?.length > 0 &&
                              externalCalendarEntityData[0]?.address?.addressRegion
                        }
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
                            border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                            width: '423px',
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
                      required={requiredFieldNames?.includes(placeFormRequiredFieldNames.COUNTRY)}>
                      <CreateMultiLingualFormItems
                        entityId={placeId}
                        calendarContentLanguage={calendarContentLanguage}
                        form={form}
                        name={formFieldNames.COUNTRY}
                        data={
                          placeData?.address?.addressCountry
                            ? placeData?.address?.addressCountry
                            : artsDataId
                            ? artsData?.address?.addressCountry
                            : externalCalendarEntityId &&
                              externalCalendarEntityData?.length > 0 &&
                              externalCalendarEntityData[0]?.address?.addressCountry
                        }
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
                            border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                            width: '423px',
                          }}
                          size="large"
                        />
                      </CreateMultiLingualFormItems>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name={formFieldNames.COORDINATES}
                  initialValue={
                    placeData?.geoCoordinates?.latitude || placeData?.geoCoordinates?.longitude
                      ? placeData?.geoCoordinates?.latitude + ',' + placeData?.geoCoordinates?.longitude
                      : artsDataId && (artsData?.geo?.latitude || artsData?.geo?.longitude)
                      ? artsData?.geo?.latitude + '' + artsData?.geo?.longitude
                      : externalCalendarEntityId &&
                        externalCalendarEntityData?.length > 0 &&
                        (externalCalendarEntityData[0]?.geo?.latitude ||
                          externalCalendarEntityData[0]?.geo?.longitude) &&
                        externalCalendarEntityData[0]?.geo?.latitude +
                          ',' +
                          externalCalendarEntityData[0]?.geo?.longitude
                  }
                  data-cy="form--item-place-coordinates-title"
                  label={t('dashboard.places.createNew.addPlace.address.coordinates.coordinates')}
                  rules={[
                    {
                      required: requiredFieldNames?.includes(placeFormRequiredFieldNames?.COORDINATES),
                      message: t('common.validations.informationRequired'),
                    },
                  ]}>
                  <StyledInput data-cy="input-place-coordinates" />
                </Form.Item>
                <MapComponent />
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
                      ? adminCheckHandler({ calendar, user })
                        ? false
                        : true
                      : false
                  }
                  initialValue={
                    placeData?.regions
                      ? placeData?.regions?.map((type) => {
                          return type?.entityId;
                        })
                      : artsDataId
                      ? artsData?.regions &&
                        artsData?.regions?.map((region) => {
                          return region?.entityId;
                        })
                      : []
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
                  <TreeSelectOption
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
                    tagRender={(props) => {
                      const { label, closable, onClose } = props;
                      return (
                        <Tags
                          data-cy={`tag-place-${label}`}
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
                  data-cy="form-item-opening-hours-title"
                  name={formFieldNames.OPENING_HOURS}
                  className={`${formFieldNames.OPENING_HOURS} subheading-wrap`}
                  label={t('dashboard.places.createNew.addPlace.address.openingHours.openingHoursLink')}
                  initialValue={
                    placeId
                      ? placeData?.openingHours?.uri
                      : externalCalendarEntityId &&
                        externalCalendarEntityData?.length > 0 &&
                        externalCalendarEntityData[0]?.openingHours?.uri
                  }
                  style={{
                    display: !addedFields?.includes(addressTypeOptionsFieldNames.OPENING_HOURS) && 'none',
                  }}
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
              </>
              <ChangeTypeLayout>
                <Form.Item
                  label={t('dashboard.places.createNew.addPlace.addMoreDetails')}
                  style={{ lineHeight: '2.5' }}
                  data-cy="form-item-add-more-details-title">
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
              </ChangeTypeLayout>
            </Card>
            <Card marginResponsive="0px" title={t('dashboard.places.createNew.addPlace.containsPlace.containsPlace')}>
              <>
                <Row>
                  <Col>
                    <p className="add-event-date-heading" data-cy="para-place-contains-place-subheading">
                      {t('dashboard.places.createNew.addPlace.containsPlace.subheading')}
                    </p>
                  </Col>
                </Row>
                <Form.Item
                  data-cy="form-item-contains-place-title"
                  name={formFieldNames.CONTAINS_PLACE}
                  className="subheading-wrap"
                  // initialValue={initialPlace && initialPlace[0]?.id}
                  label={t('dashboard.places.createNew.addPlace.containsPlace.addPlace')}
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
                  ]}>
                  <Popover
                    open={isPopoverOpen.containsPlace}
                    onOpenChange={(open) => {
                      debounceSearchPlace(quickCreateKeyword);
                      setIsPopoverOpen({ ...isPopoverOpen, containsPlace: open });
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
              </>
              <></>
            </Card>
            <Card
              marginResponsive="0px"
              title={t('dashboard.places.createNew.addPlace.containedInPlace.containedInPlace')}>
              <>
                <Row>
                  <Col>
                    <p className="add-event-date-heading" data-cy="para-contained-in-place-subheading">
                      {t('dashboard.places.createNew.addPlace.containedInPlace.subheading')}
                    </p>
                  </Col>
                </Row>
                <Form.Item
                  name={formFieldNames.CONTAINED_IN_PLACE}
                  className="subheading-wrap"
                  data-cy="form-item-contains-place"
                  label={t('dashboard.places.createNew.addPlace.containedInPlace.addPlace')}
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
                  ]}>
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
            {taxonomyDetails(
              allTaxonomyData?.data,
              user,
              placeTaxonomyMappedFieldTypes.PLACE_ACCESSIBILITY,
              'name',
              false,
            ) && (
              <Card
                marginResponsive="0px"
                title={t('dashboard.places.createNew.addPlace.venueAccessibility.venueAccessibility')}
                hidden={
                  standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.PLACE_ACCESSIBILITY)
                    ? adminCheckHandler({ calendar, user })
                      ? false
                      : true
                    : false
                }>
                <>
                  <Row>
                    <Col>
                      <p className="add-event-date-heading" data-cy="para-venue-accessibility-title">
                        {t('dashboard.places.createNew.addPlace.venueAccessibility.subheading')}
                      </p>
                    </Col>
                  </Row>
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
                    initialValue={placeData?.accessibility?.map((type) => {
                      return type?.entityId;
                    })}
                    hidden={
                      standardAdminOnlyFields?.includes(placeFormRequiredFieldNames?.PLACE_ACCESSIBILITY)
                        ? adminCheckHandler({ calendar, user })
                          ? false
                          : true
                        : false
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
                    <TreeSelectOption
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
                      tagRender={(props) => {
                        const { label, closable, onClose } = props;
                        return (
                          <Tags
                            data-cy={`tag-venue-accessibility-${label}`}
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
                    data-cy="form-item-venue-accessibility-note-title"
                    label={t('dashboard.places.createNew.addPlace.venueAccessibility.placeAccessibilityNote.note')}
                    name={placeAccessibilityTypeOptionsFieldNames.ACCESSIBILITY_NOTE_WRAP}
                    className={formFieldNames.ACCESSIBILITY_NOTE_WRAP}
                    style={{
                      display:
                        !addedFields?.includes(placeAccessibilityTypeOptionsFieldNames.ACCESSIBILITY_NOTE_WRAP) &&
                        'none',
                    }}>
                    <CreateMultiLingualFormItems
                      entityId={placeId}
                      calendarContentLanguage={calendarContentLanguage}
                      form={form}
                      name={formFieldNames.ACCESSIBILITY_NOTE}
                      data={placeData?.accessibilityNote}
                      required={false}
                      validations={t('common.validations.informationRequired')}
                      dataCy="input-text-area-venue-accessibility-"
                      placeholder={placeHolderCollectionCreator({
                        calendarContentLanguage,
                        placeholderBase:
                          'dashboard.places.createNew.addPlace.venueAccessibility.placeAccessibilityNote.placeholder',
                        t,
                      })}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        style={{
                          borderRadius: '4px',
                          border: `${calendarContentLanguage.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                          width: '423px',
                        }}
                        size="large"
                      />
                    </CreateMultiLingualFormItems>
                  </Form.Item>
                </>
                <ChangeTypeLayout>
                  <Form.Item
                    data-cy="form-item-add-more-details-label"
                    label={t('dashboard.places.createNew.addPlace.addMoreDetails')}
                    style={{ lineHeight: '2.5' }}>
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
                </ChangeTypeLayout>
              </Card>
            )}

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
                                isDataValid(place?.name)
                                  ? contentLanguageBilingual({
                                      data: place?.name,
                                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                      calendarContentLanguage: calendarContentLanguage,
                                    })
                                  : typeof place?.name === 'string' && place?.name
                              }
                              icon={<EnvironmentOutlined style={{ color: '#607EFC' }} />}
                              bordered
                              calendarContentLanguage={calendarContentLanguage}
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
                                  isDataValid(org?.name)
                                    ? contentLanguageBilingual({
                                        data: org?.name,
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
                                isDataValid(person?.name)
                                  ? contentLanguageBilingual({
                                      data: person?.name,
                                      interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                      calendarContentLanguage: calendarContentLanguage,
                                    })
                                  : typeof person?.name === 'string' && person?.name
                              }
                              icon={<CalendarOutlined style={{ color: '#607EFC' }} />}
                              calendarContentLanguage={calendarContentLanguage}
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
                                  isDataValid(event?.name)
                                    ? contentLanguageBilingual({
                                        data: event?.name,
                                        interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                        calendarContentLanguage: calendarContentLanguage,
                                      })
                                    : typeof event?.name === 'string' && event?.name
                                }
                                icon={<CalendarOutlined style={{ color: '#607EFC' }} />}
                                description={moment(event.startDateTime).format('YYYY-MM-DD')}
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
                </div>
                <></>
              </Card>
            )}
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
