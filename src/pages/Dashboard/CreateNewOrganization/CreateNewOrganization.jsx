import React, { useRef, useState, useEffect, useCallback } from 'react';
import './createNewOrganization.css';
import '../AddEvent/addEvent.css';
import { Form, Row, Col, Button, message, notification } from 'antd';
import {
  CloseCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import PrimaryButton from '../../../components/Button/Primary';
import { featureFlags } from '../../../utils/featureFlags';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { entitiesClass } from '../../../constants/entitiesClass';
import OutlinedButton from '../../..//components/Button/Outlined';
import Card from '../../../components/Card/Common/Event';
import { dataTypes, formCategory, formFieldValue, returnFormDataWithFields } from '../../../constants/formFields';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import {
  useAddOrganizationMutation,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} from '../../../services/organization';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery, useLazyGetAllTaxonomyQuery } from '../../../services/taxonomy';
import NoContent from '../../../components/NoContent/NoContent';
import { treeDynamicTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import { formFieldsHandler } from '../../../utils/formFieldsHandler';
import { formPayloadHandler } from '../../../utils/formPayloadHandler';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import { loadArtsDataEntity } from '../../../services/artsData';
import {
  useGetEntitiesByIdQuery,
  useLazyGetEntitiesByIdQuery,
  useLazyGetEntitiesQuery,
  useLazyGetEntityDependencyDetailsQuery,
} from '../../../services/entities';
import { placesOptions } from '../../../components/Select/selectOption.settings';
import ChangeType from '../../../components/ChangeType';
import { PathName } from '../../../constants/pathName';
import { useAddImageMutation } from '../../../services/image';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import { useLazyGetPlaceQuery } from '../../../services/places';
import { RouteLeavingGuard } from '../../../hooks/usePrompt';
import { useDebounce } from '../../../hooks/debounce';
import { SEARCH_DELAY } from '../../../constants/search';
import { externalSourceOptions, sourceOptions } from '../../../constants/sourceOptions';
import { useLazyGetExternalSourceQuery } from '../../../services/externalSource';
import { sameAsTypes } from '../../../constants/sameAsTypes';
import ChangeTypeLayout from '../../../layout/ChangeTypeLayout/ChangeTypeLayout';
import SelectionItem from '../../../components/List/SelectionItem';
import moment from 'moment';
import {
  clearActiveFallbackFieldsInfo,
  getActiveFallbackFieldsInfo,
  getLanguageLiteralBannerDisplayStatus,
  setLanguageLiteralBannerDisplayStatus,
  setBannerDismissed,
  getIsBannerDismissed,
} from '../../../redux/reducer/languageLiteralSlice';
import Alert from '../../../components/Alert';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import { isDataValid } from '../../../utils/MultiLingualFormItemSupportFunctions';
import SortableTreeSelect from '../../../components/TreeSelectOption/SortableTreeSelect';
import { uploadImageListHelper } from '../../../utils/uploadImageListHelper';
import i18next from 'i18next';
import { getExternalSourceId } from '../../../utils/getExternalSourceId';

function CreateNewOrganization() {
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
  const { user } = useSelector(getUserDetails);
  const isBannerDismissed = useSelector(getIsBannerDismissed);
  const languageLiteralBannerDisplayStatus = useSelector(getLanguageLiteralBannerDisplayStatus);
  const { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const organizationId = searchParams.get('id');
  const externalCalendarEntityId = searchParams.get('entityId');

  const artsDataId = location?.state?.data?.id ?? null;
  const isRoutingToEventPage = location?.state?.data?.isRoutingToEventPage;

  const { data: organizationData, isLoading: organizationLoading } = useGetOrganizationQuery(
    { id: organizationId, calendarId, sessionId: timestampRef },
    { skip: organizationId ? false : true },
  );

  let organizationIdsQuery = new URLSearchParams();
  organizationIdsQuery.append('ids', externalCalendarEntityId);
  const { data: externalCalendarEntityData, isLoading: externalEntityLoading } = useGetEntitiesByIdQuery(
    { ids: organizationIdsQuery, calendarId, sessionId: timestampRef },
    { skip: externalCalendarEntityId ? false : true },
  );
  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.ORGANIZATION);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });

  const [getDerivedEntities, { isFetching: isEntityDetailsLoading }] = useLazyGetEntityDependencyDetailsQuery({
    sessionId: timestampRef,
  });
  const [getPlace] = useLazyGetPlaceQuery();
  const [getAllTaxonomy] = useLazyGetAllTaxonomyQuery({ sessionId: timestampRef });
  const [getEntities, { isFetching: isEntitiesFetching }] = useLazyGetEntitiesQuery();
  const [getExternalSource, { isFetching: isExternalSourceFetching }] = useLazyGetExternalSourceQuery();
  const [addOrganization, { isLoading: addOrganizationLoading }] = useAddOrganizationMutation();
  const [updateOrganization, { isLoading: updateOrganizationLoading }] = useUpdateOrganizationMutation();
  const [addImage, { isLoading: imageUploadLoading }] = useAddImageMutation();
  const [getEntitiesById] = useLazyGetEntitiesByIdQuery();

  const [derivedEntitiesData, setDerivedEntitiesData] = useState();
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const [artsData, setArtsData] = useState(null);
  const [newEntityData, setNewEntityData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [allPlacesArtsdataList, setAllPlacesArtsdataList] = useState([]);
  const [allPlacesImportsFootlight, setAllPlacesImportsFootlight] = useState([]);
  const [locationPlace, setLocationPlace] = useState();
  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [addedFields, setAddedFields] = useState([]);
  const [scrollToSelectedField, setScrollToSelectedField] = useState();
  const [showDialog, setShowDialog] = useState(false);
  const [dynamicFields, setDynamicFields] = useState([]);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.organization);
  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.organization);
  let formFieldProperties = formFields?.length > 0 && formFields[0]?.formFieldProperties;
  formFields = formFields?.length > 0 && formFields[0]?.formFields;
  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  const standardMandatoryFieldNames = formFieldProperties?.mandatoryFields?.standardFields?.map(
    (field) => field?.fieldName,
  );

  let externalEntityData = externalCalendarEntityData?.length > 0 && externalCalendarEntityData[0];

  const addUpdateOrganizationApiHandler = (organizationObj, toggle) => {
    var promise = new Promise(function (resolve, reject) {
      if (!organizationId || organizationId === '') {
        if (artsDataId && artsData) {
          let sameAsArray = Array.isArray(artsData.sameAs)
            ? artsData.sameAs
            : artsData.sameAs && typeof artsData.sameAs === 'object'
            ? [artsData.sameAs]
            : [];

          const existingIndex = sameAsArray.findIndex((item) => item.uri === artsData.uri);

          const artsDataIdentifier = {
            uri: artsData.uri,
            type: sameAsTypes.ARTSDATA_IDENTIFIER,
          };

          if (existingIndex !== -1) {
            sameAsArray[existingIndex] = artsDataIdentifier;
          } else {
            sameAsArray.push(artsDataIdentifier);
          }

          organizationObj = {
            ...organizationObj,
            sameAs: sameAsArray,
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
            organizationObj = {
              ...organizationObj,
              sameAs: externalEntityData?.sameAs?.concat(sameAs),
            };
          }
        }
        addOrganization({
          data: organizationObj,
          calendarId,
        })
          .unwrap()
          .then((response) => {
            resolve(response?.id);
            notification.success({
              description: t('dashboard.organization.createNew.notification.addSuccess'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            if (!toggle) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}`);
          })
          .catch((errorInfo) => {
            reject();
            console.log(errorInfo);
          });
      } else {
        organizationObj = {
          ...organizationObj,
          sameAs: organizationData?.sameAs,
        };
        updateOrganization({
          data: organizationObj,
          calendarId,
          organizationId,
        })
          .unwrap()
          .then(() => {
            resolve(organizationId);
            if (isRoutingToEventPage && !toggle) {
              navigate(isRoutingToEventPage);
            } else {
              notification.success({
                description: t('dashboard.organization.createNew.notification.editSuccess'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              if (!toggle) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}`);
            }
          })
          .catch((error) => {
            reject();
            console.log(error);
          });
      }
    });
    return promise;
  };

  const onSaveHandler = (event, toggle = false) => {
    event?.preventDefault();
    let validateFieldList = [];
    let fallbackStatus = activeFallbackFieldsInfo;

    validateFieldList = validateFieldList?.concat(
      formFields
        ?.map((field) => {
          let collection = [];
          if (field?.datatype === dataTypes.MULTI_LINGUAL) {
            calendarContentLanguage.forEach((language) => {
              collection.push([field?.mappedField, contentLanguageKeyMap[language]]);
            });
            return collection;
          } else return field?.mappedField ?? field?.name?.toLowerCase();
        })
        ?.flat(),
    );
    validateFieldList = validateFieldList?.concat(
      formFieldProperties?.mandatoryFields?.dynamicFields?.map((field) => ['dynamicFields', field]),
    );

    var promise = new Promise(function (resolve, reject) {
      form
        .validateFields(validateFieldList)
        .then(async () => {
          setShowDialog(false);
          var values = form.getFieldsValue(true);
          let organizationPayload = {};
          Object.keys(values)?.map((object) => {
            let payload = formPayloadHandler(
              values[object],
              object,
              formFields,
              calendarContentLanguage,
              fallbackStatus,
            );
            if (payload) {
              let newKeys = Object.keys(payload);
              let childKeys = object?.split('.');
              organizationPayload = {
                ...organizationPayload,
                ...(newKeys?.length > 0 && { [newKeys[0]]: payload[newKeys[0]] }),
                ...(childKeys?.length == 2 && {
                  [childKeys[0]]: {
                    ...organizationPayload[childKeys[0]],
                    [childKeys[1]]: payload[childKeys[0]][childKeys[1]],
                  },
                }),
              };
            }
          });

          if (locationPlace?.source === sourceOptions.ARTSDATA) {
            organizationPayload = {
              ...organizationPayload,
              place: {
                uri: locationPlace?.uri,
              },
            };
          } else {
            organizationPayload = {
              ...organizationPayload,
              place: {
                entityId: locationPlace?.value,
              },
            };
          }
          let imageCrop = form.getFieldValue('imageCrop') ? [form.getFieldValue('imageCrop')] : [];
          let mainImageOptions = form.getFieldValue('mainImageOptions');
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
                description: mainImageOptions?.altText,
                creditText: mainImageOptions?.credit,
                caption: mainImageOptions?.caption,
              },
            ];
          }

          if (
            (values?.image || (values?.image && values?.image?.length > 0)) &&
            (!values?.logo || (Array.isArray(values?.logo) && values?.logo?.length === 0))
          ) {
            organizationPayload['logo'] = [];
            if (values?.image?.length > 0 && values?.image[0]?.originFileObj) {
              const formdata = new FormData();
              formdata.append('file', values?.image[0].originFileObj);
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
                          description: mainImageOptions?.altText,
                          creditText: mainImageOptions?.credit,
                          caption: mainImageOptions?.caption,
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
                          description: mainImageOptions?.altText,
                          creditText: mainImageOptions?.credit,
                          caption: mainImageOptions?.caption,
                        },
                      ];

                    if (values.multipleImagesCrop?.length > 0)
                      await uploadImageListHelper(values, addImage, calendarId, imageCrop);
                    organizationPayload['image'] = imageCrop;
                    addUpdateOrganizationApiHandler(organizationPayload, toggle)
                      .then((id) => resolve(id))
                      .catch((error) => {
                        reject();
                        console.log(error);
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    const element = document.getElementsByClassName('image');
                    element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                  });
            } else {
              if (values.multipleImagesCrop?.length > 0)
                await uploadImageListHelper(values, addImage, calendarId, imageCrop);
              if (
                values?.image &&
                values?.image?.length === 0 &&
                (!values.multipleImagesCrop || values.multipleImagesCrop?.length === 0)
              ) {
                // Main image is removed and no new image is added
                // No gallery images are added
                organizationPayload['image'] = [];
              } else organizationPayload['image'] = organizationData?.image;
              addUpdateOrganizationApiHandler(organizationPayload, toggle)
                .then((id) => resolve(id))
                .catch((error) => {
                  reject();
                  console.log(error);
                });
            }
          } else if ((values?.logo || (values?.logo && values?.logo?.length > 0)) && !values?.image) {
            if (values?.logo?.length > 0 && values?.logo[0]?.originFileObj) {
              const formdata = new FormData();
              formdata.append('file', values?.logo[0].originFileObj);
              formdata &&
                addImage({ data: formdata, calendarId })
                  .unwrap()
                  .then(async (response) => {
                    organizationPayload['logo'] = {
                      original: {
                        entityId: response?.data?.original?.entityId,
                        height: response?.data?.height,
                        width: response?.data?.width,
                      },
                      large: {},
                      thumbnail: {},
                    };
                    if (values.multipleImagesCrop?.length > 0)
                      await uploadImageListHelper(values, addImage, calendarId, imageCrop);
                    organizationPayload['image'] = imageCrop;
                    addUpdateOrganizationApiHandler(organizationPayload, toggle);
                  })
                  .catch((error) => {
                    console.log(error);
                    const element = document.getElementsByClassName('logo');
                    element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                  });
            } else {
              if (values.multipleImagesCrop?.length > 0) {
                await uploadImageListHelper(values, addImage, calendarId, imageCrop);
                organizationPayload['image'] = imageCrop;
              }
              if (values?.logo) {
                if (values?.logo && values?.logo?.length == 0) organizationPayload['logo'] = null;
                else organizationPayload['logo'] = organizationData?.logo;
              }
              addUpdateOrganizationApiHandler(organizationPayload, toggle)
                .then((id) => resolve(id))
                .catch((error) => {
                  reject();
                  console.log(error);
                });
            }
          } else if (
            (values?.image || (values?.image && values?.image?.length > 0)) &&
            (values?.logo || (values?.logo && values?.logo?.length > 0))
          ) {
            if (values?.image?.length > 0 && values?.image[0]?.originFileObj) {
              const formdata = new FormData();
              formdata.append('file', values?.image[0].originFileObj);
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
                          description: mainImageOptions?.altText,
                          creditText: mainImageOptions?.credit,
                          caption: mainImageOptions?.caption,
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
                          description: mainImageOptions?.altText,
                          creditText: mainImageOptions?.credit,
                          caption: mainImageOptions?.caption,
                        },
                      ];

                    if (values.multipleImagesCrop?.length > 0)
                      await uploadImageListHelper(values, addImage, calendarId, imageCrop);
                    organizationPayload['image'] = imageCrop;
                    if (values?.logo?.length > 0 && values?.logo[0]?.originFileObj) {
                      const formdata = new FormData();
                      formdata.append('file', values?.logo[0].originFileObj);
                      formdata &&
                        addImage({ data: formdata, calendarId })
                          .unwrap()
                          .then((response) => {
                            organizationPayload['logo'] = {
                              original: {
                                entityId: response?.data?.original?.entityId,
                                height: response?.data?.height,
                                width: response?.data?.width,
                              },
                              large: {},
                              thumbnail: {},
                            };
                            addUpdateOrganizationApiHandler(organizationPayload, toggle)
                              .then((id) => resolve(id))
                              .catch((error) => {
                                reject();
                                console.log(error);
                              });
                          })
                          .catch((error) => {
                            console.log(error);
                            const element = document.getElementsByClassName('logo');
                            element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                          });
                    } else {
                      if (values?.logo) {
                        if (values?.logo && values?.logo?.length == 0) organizationPayload['logo'] = null;
                        else organizationPayload['logo'] = organizationData?.logo;
                      }
                      addUpdateOrganizationApiHandler(organizationPayload, toggle)
                        .then((id) => resolve(id))
                        .catch((error) => {
                          reject();
                          console.log(error);
                        });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    const element = document.getElementsByClassName('image');
                    element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                  });
            } else {
              if (values.multipleImagesCrop?.length > 0) {
                await uploadImageListHelper(values, addImage, calendarId, imageCrop);
                organizationPayload['image'] = imageCrop;
              }
              if (
                values?.image &&
                values?.image?.length === 0 &&
                (!values.multipleImagesCrop || values.multipleImagesCrop?.length === 0)
              ) {
                // Main image is removed and no new image is added
                // No gallery images are added
                organizationPayload['image'] = [];
              } else organizationPayload['image'] = imageCrop;
              if (values?.logo?.length > 0 && values?.logo[0]?.originFileObj) {
                const formdata = new FormData();
                formdata.append('file', values?.logo[0].originFileObj);
                formdata &&
                  addImage({ data: formdata, calendarId })
                    .unwrap()
                    .then((response) => {
                      organizationPayload['logo'] = {
                        original: {
                          entityId: response?.data?.original?.entityId,
                          height: response?.data?.height,
                          width: response?.data?.width,
                        },
                        large: {},
                        thumbnail: {},
                      };
                      addUpdateOrganizationApiHandler(organizationPayload, toggle)
                        .then((id) => resolve(id))
                        .catch((error) => {
                          reject();
                          console.log(error);
                        });
                    })
                    .catch((error) => {
                      console.log(error);
                      const element = document.getElementsByClassName('logo');
                      element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    });
              } else {
                if (values?.logo) {
                  if (values?.logo && values?.logo?.length == 0) organizationPayload['logo'] = null;
                  else organizationPayload['logo'] = organizationData?.logo;
                }
                addUpdateOrganizationApiHandler(organizationPayload, toggle)
                  .then((id) => resolve(id))
                  .catch((error) => {
                    reject();
                    console.log(error);
                  });
              }
            }
          } else {
            if (values?.logo) {
              if (values?.logo && values?.logo?.length == 0) organizationPayload['logo'] = null;
              else organizationPayload['logo'] = organizationData?.logo;
            }
            if (values.multipleImagesCrop?.length > 0) {
              await uploadImageListHelper(values, addImage, calendarId, imageCrop);
              organizationPayload['image'] = imageCrop;
            }
            if (
              values?.image &&
              values?.image?.length === 0 &&
              (!values.multipleImagesCrop || values.multipleImagesCrop?.length === 0)
            ) {
              // Main image is removed and no new image is added
              // No gallery images are added
              organizationPayload['image'] = [];
            } else organizationPayload['image'] = imageCrop;
            addUpdateOrganizationApiHandler(organizationPayload, toggle)
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
            key: 'organization-save-as-warning',
            content: (
              <>
                {t('dashboard.organization.createNew.notification.saveError')} &nbsp;
                <Button
                  type="text"
                  icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                  onClick={() => message.destroy('person-save-as-warning')}
                />
              </>
            ),
            icon: <ExclamationCircleOutlined />,
          });
        });
    });

    return promise;
  };

  const placesSearch = (inputValue = '') => {
    let query = new URLSearchParams();
    query.append('classes', entitiesClass.place);
    let sourceQuery = new URLSearchParams();
    sourceQuery.append('sources', externalSourceOptions.ARTSDATA);
    sourceQuery.append('sources', externalSourceOptions.FOOTLIGHT);
    getEntities({
      searchKey: inputValue,
      classes: decodeURIComponent(query.toString()),
      calendarId,
    })
      .unwrap()
      .then((response) => {
        setAllPlacesList(placesOptions(response, user, calendarContentLanguage, sourceOptions.CMS));
      })
      .catch((error) => console.log(error));
    if (inputValue && inputValue !== '') {
      getExternalSource({
        searchKey: inputValue,
        classes: decodeURIComponent(query.toString()),
        sources: decodeURIComponent(sourceQuery.toString()),
        calendarId,
        excludeExistingCMS: true,
      })
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

  const addFieldsHandler = (fieldNames) => {
    let array = addedFields?.concat(fieldNames);
    array = [...new Set(array)];
    setAddedFields(array);
    setScrollToSelectedField(array?.at(-1));
  };

  const onFieldsChange = (changedValue) => {
    if (changedValue?.length > 0 && !showDialog) {
      if (changedValue?.filter((field) => field?.touched).length > 0) {
        setShowDialog(true);
      }
    }
  };

  const placeNavigationHandler = (id, type, event) => {
    onSaveHandler(event, true)
      .then((savedOrganizationId) => {
        if (type?.toUpperCase() == taxonomyClass.PLACE)
          navigate(`${PathName.Dashboard}/${calendarId}${PathName.Places}${PathName.AddPlace}?id=${id}`, {
            state: {
              data: {
                isRoutingToOrganization: organizationId
                  ? `${location.pathname}?id=${organizationId}`
                  : `${location.pathname}?id=${savedOrganizationId}`,
                isRoutingToEventPage: location.state?.data?.isRoutingToEventPage,
              },
            },
          });
      })
      .catch((error) => console.log(error));
  };

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
    if (addedFields?.length > 0) {
      const element = document.getElementsByClassName(scrollToSelectedField);
      element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [addedFields]);

  useEffect(() => {
    if (taxonomyLoading && !allTaxonomyData && !currentCalendarData) return;
    const requiredFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.organization);
    const requiredTaxonomies = requiredFields[0]?.formFieldProperties?.mandatoryFields?.dynamicFields?.map(
      (field) => field,
    );

    allTaxonomyData?.data?.map((taxonomy) => {
      if (taxonomy?.isDynamicField) {
        const tooltip = contentLanguageBilingual({
          data: taxonomy?.disambiguatingDescription,
          requiredLanguageKey: i18next.language,
          calendarContentLanguage,
        });
        const fieldObject = {
          type: taxonomy?.id,
          id: taxonomy?.id,
          fieldNames: taxonomy?.id,
          mappedField: taxonomy?.id,
          taxonomy: false,
          disabled: false,
          isPreset: requiredTaxonomies?.includes(taxonomy?.id),
          label: contentLanguageBilingual({
            data: taxonomy?.name,
            requiredLanguageKey: i18next.language,
            calendarContentLanguage,
          }),
          ...(tooltip && { infoPopup: tooltip }),
        };
        setDynamicFields((prev) => [...prev, fieldObject]);
      }
    });
  }, [taxonomyLoading, allTaxonomyData, currentCalendarData]);

  useEffect(() => {
    dispatch(clearActiveFallbackFieldsInfo());
    dispatch(setBannerDismissed(false));
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

    if (!shouldDisplay && !isBannerDismissed) {
      dispatch(setLanguageLiteralBannerDisplayStatus(true));
    } else {
      dispatch(setLanguageLiteralBannerDisplayStatus(false));
    }
  }, [activeFallbackFieldsInfo]);

  useEffect(() => {
    if (calendarId && currentCalendarData) {
      let initialPlaceAccessibiltiy = [],
        initialPlace;
      if (organizationData) {
        if (routinghandler(user, calendarId, organizationData?.createdByUserId, null, true, organizationData?.id)) {
          if (organizationData?.image?.length > 0) {
            const mainImage = organizationData.image.find((image) => image?.isMain) || null;
            const imageGalleryImages = organizationData.image.filter((image) => !image?.isMain);

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
                  mainImageOptions: {
                    credit: mainImage?.creditText,
                    altText: mainImage?.description,
                    caption: mainImage?.caption,
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
                imageOptions: {
                  credit: image?.creditText,
                  altText: image?.description,
                  caption: image?.caption,
                },
              }));

              form.setFieldsValue({
                multipleImagesCrop: galleryImages,
              });
            }
          }
          if (organizationData?.sameAs?.length > 0) {
            let sourceId = artsDataLinkChecker(organizationData?.sameAs);
            sourceId = getExternalSourceId(sourceId);
            getArtsData(sourceId);
          }
          if (organizationData?.place?.entityId) {
            getPlace({ placeId: organizationData?.place?.entityId, calendarId })
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
                        ['type']: entitiesClass?.place,
                      };
                      setLocationPlace(
                        placesOptions([initialPlace], user, calendarContentLanguage)[0],
                        sourceOptions.CMS,
                      );
                    })
                    .catch((error) => console.log(error));
                } else {
                  initialPlace = {
                    ...response,
                    ['accessibility']: [],
                    ['type']: entitiesClass?.place,
                  };
                  setLocationPlace(placesOptions([initialPlace], user, calendarContentLanguage)[0], sourceOptions.CMS);
                }
              })
              .catch((error) => console.log(error));
            form.setFieldValue('place', organizationData?.place?.entityId);
          }
          const organizationKeys = Object.keys(organizationData).filter((key) => {
            const value = organizationData[key];

            if (typeof value === 'string') {
              return value.trim() !== '';
            }

            if (Array.isArray(value)) {
              return value.length > 0;
            }

            if (typeof value === 'object' && value !== null) {
              return Object.keys(value).length > 0;
            }

            return false;
          });

          if (organizationKeys.length > 0) setAddedFields(organizationKeys);
        } else
          window.location.replace(
            `${window.location?.origin}${PathName.Dashboard}/${calendarId}${PathName.Organizations}/${organizationId}`,
          );
      }
      if (externalCalendarEntityData?.length > 0 && externalCalendarEntityId) {
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
                mainImageOptions: {
                  credit: mainImage?.creditText,
                  altText: mainImage?.description,
                  caption: mainImage?.caption,
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
              imageOptions: {
                credit: image?.creditText,
                altText: image?.description,
                caption: image?.caption,
              },
            }));

            form.setFieldsValue({
              multipleImagesCrop: galleryImages,
            });
          }
        }
        if (externalCalendarEntityData[0]?.derivedFrom?.uri) {
          let sourceId = getExternalSourceId(externalCalendarEntityData[0]?.derivedFrom?.uri);
          getArtsData(sourceId);
        }
        if (externalCalendarEntityData[0]?.place?.entityId) {
          let organizationIdsQuery = new URLSearchParams();
          organizationIdsQuery.append('ids', externalCalendarEntityData[0]?.place?.entityId);
          getEntitiesById({ ids: organizationIdsQuery, calendarId })
            .unwrap()
            .then((response) => {
              if (response?.length > 0) {
                initialPlace = {
                  ...response[0],
                  ['accessibility']: [],
                  ['type']: entitiesClass?.place,
                };
                setLocationPlace(
                  placesOptions([initialPlace], user, calendarContentLanguage)[0],
                  externalSourceOptions.FOOTLIGHT,
                );
              }
            })
            .catch((error) => console.log(error));
          form.setFieldValue('place', externalCalendarEntityData[0]?.place?.entityId);
        }

        const organizationKeys = Object.keys(externalCalendarEntityData[0])?.filter((key) => {
          const value = externalCalendarEntityData[0][key];

          if (typeof value === 'string') {
            return value.trim() !== '';
          }

          if (Array.isArray(value)) {
            return value.length > 0;
          }

          if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length > 0;
          }

          return false;
        });

        if (organizationKeys?.length > 0) setAddedFields(organizationKeys);
      }
      standardMandatoryFieldNames?.forEach((field) => {
        switch (field) {
          case 'IMAGE':
            setAddedFields((addedFields) => [...addedFields, 'image']);
            break;
          case 'VIDEO_URL':
            setAddedFields((addedFields) => [...addedFields, 'videoUrl']);
            break;
          case 'ADDITIONAL_LINKS':
            setAddedFields((addedFields) => [...addedFields, 'additionalLinks']);
            break;

          default:
            break;
        }
      });
    }
  }, [organizationLoading, currentCalendarData, externalEntityLoading]);

  useEffect(() => {
    if (isReadOnly) {
      if (organizationId)
        navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}/${organizationId}`, { replace: true });
      else navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}`, { replace: true });
    }
  }, [isReadOnly]);

  useEffect(() => {
    const newEntityName = location?.state?.name;
    if (artsDataId) {
      getArtsData(artsDataId);
    } else if (newEntityName) {
      const name = {};
      calendarContentLanguage.forEach((language) => {
        const langKey = contentLanguageKeyMap[language];
        name[langKey] = newEntityName;
      });

      setNewEntityData({ name });
    }

    placesSearch('');
  }, []);

  useEffect(() => {
    if (organizationId) {
      getDerivedEntities({ id: organizationId, calendarId }).then((response) => {
        if (
          response?.data?.events?.length > 0 ||
          response?.data?.people?.length > 0 ||
          response?.data?.places?.length > 0
        ) {
          setDerivedEntitiesData(response?.data);
          setDerivedEntitiesDisplayStatus(true);
        }
      });
    }
  }, [organizationId]);

  return fields && !organizationLoading && !taxonomyLoading && !artsDataLoading && !isEntityDetailsLoading ? (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <RouteLeavingGuard isBlocking={showDialog} />

      <div className="add-edit-wrapper add-organization-wrapper">
        <Form form={form} layout="vertical" name="organization" onFieldsChange={onFieldsChange}>
          <Row gutter={[32, 24]}>
            <Col span={24}>
              <Row gutter={[32, 2]}>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col>
                      <div className="button-container">
                        <Button
                          data-cy="button-back-to-previous-screen"
                          type="link"
                          onClick={() => {
                            if (isRoutingToEventPage) {
                              navigate(isRoutingToEventPage);
                            } else {
                              navigate(-1);
                            }
                          }}
                          icon={<LeftOutlined style={{ marginRight: '17px' }} />}>
                          {t('dashboard.organization.createNew.search.breadcrumb')}
                        </Button>
                      </div>
                    </Col>
                    <Col>
                      <div className="add-event-button-wrap">
                        <Form.Item>
                          <PrimaryButton
                            data-cy="button-save-organization"
                            label={t('dashboard.events.addEditEvent.saveOptions.save')}
                            onClick={() => onSaveHandler()}
                            disabled={
                              addOrganizationLoading || imageUploadLoading || updateOrganizationLoading ? true : false
                            }
                          />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col>
                  <div className="add-edit-event-heading">
                    <h4 data-cy="heading-add-edit-organization">
                      {organizationId
                        ? t('dashboard.organization.createNew.addOrganization.editOrganization')
                        : t('dashboard.organization.createNew.addOrganization.newOrganization')}
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
                                    dispatch(setBannerDismissed(true));
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
            {fields?.map((section, index) => {
              if (section?.length > 0)
                return (
                  <Card
                    marginResponsive="0px"
                    title={section[0]?.category !== formCategory.PRIMARY && section[0]?.category}
                    key={index}>
                    <>
                      {(artsDataLinkChecker(organizationData?.sameAs) || artsDataLinkChecker(artsData?.sameAs)) &&
                        section[0]?.category === formCategory.PRIMARY && (
                          <Row>
                            <Col span={24}>
                              <p className="add-entity-label" data-cy="para-organization-data-source">
                                {t('dashboard.organization.createNew.addOrganization.dataSource')}
                              </p>
                            </Col>
                            <Col span={24}>
                              <ArtsDataInfo
                                artsDataLink={
                                  artsDataLinkChecker(organizationData?.sameAs)
                                    ? artsDataLinkChecker(organizationData?.sameAs)
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
                                <span className="add-event-date-heading" data-cy="span-data-source-help-text-part-one">
                                  {t('dashboard.organization.createNew.addOrganization.question.firstPart')}
                                </span>
                                <span
                                  data-cy="span-data-source-help-text-part-two"
                                  className="add-event-date-heading"
                                  style={{
                                    color: '#1b3de6',
                                    textDecoration: 'underline',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => {
                                    navigate(
                                      `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.Search}`,
                                    );
                                  }}>
                                  {t('dashboard.organization.createNew.addOrganization.question.secondPart')}
                                </span>
                                <span
                                  className="add-event-date-heading"
                                  data-cy="span-data-source-help-text-part-three">
                                  {t('dashboard.organization.createNew.addOrganization.question.thirdPart')}
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
                      {section?.map((field) => {
                        return formFieldValue?.map((formField, index) => {
                          if (formField?.type === field.type) {
                            return returnFormDataWithFields({
                              field,
                              formField,
                              entityId: organizationId,
                              allTaxonomyData,
                              user,
                              calendarContentLanguage,
                              entityData: organizationData
                                ? organizationData
                                : artsDataId
                                ? artsData
                                : externalCalendarEntityId && externalCalendarEntityData?.length > 0
                                ? externalEntityData
                                : newEntityData,
                              index,
                              t,
                              adminCheck: adminCheckHandler({ calendar, user }),
                              currentCalendarData,
                              imageCropOpen,
                              setImageCropOpen,
                              placesSearch: debounceSearchPlace,
                              allPlacesList,
                              allPlacesArtsdataList,
                              allPlacesImportsFootlight,
                              locationPlace,
                              setLocationPlace,
                              setIsPopoverOpen,
                              isPopoverOpen,
                              form,
                              style: {
                                display: !field?.isPreset
                                  ? !addedFields?.includes(field?.mappedField)
                                    ? 'none'
                                    : ''
                                  : '',
                              },
                              placeNavigationHandler,
                              isEntitiesFetching,
                              isExternalSourceFetching,
                              mandatoryFields: formFieldProperties?.mandatoryFields?.standardFields ?? [],
                              adminOnlyFields: formFieldProperties?.adminOnlyFields?.standardFields ?? [],
                              setShowDialog,
                              isImportedEntity: artsDataId || externalCalendarEntityId,
                            });
                          }
                        });
                      })}
                      {section[0]?.category === formCategory.PRIMARY &&
                        allTaxonomyData?.data?.map((taxonomy, index) => {
                          if (taxonomy?.isDynamicField) {
                            let initialValues = [];
                            organizationData?.dynamicFields?.forEach((dynamicField) => {
                              if (taxonomy?.id === dynamicField?.taxonomyId) initialValues = dynamicField?.conceptIds;
                            });

                            const requiredFlag = dynamicFields.find(
                              (field) => field?.fieldNames === taxonomy?.id,
                            )?.isPreset;

                            if (artsDataId || externalCalendarEntityId || !organizationId) {
                              taxonomy?.concept?.forEach((concept) => {
                                if (concept?.isDefault) {
                                  initialValues = Array.isArray(initialValues)
                                    ? [...initialValues, concept?.id]
                                    : [concept?.id];
                                }
                              });
                            }

                            const shouldShowField =
                              requiredFlag ||
                              addedFields?.includes(taxonomy?.id) ||
                              (initialValues && initialValues?.length > 0);
                            const displayFlag = !shouldShowField;

                            return (
                              <Form.Item
                                key={index}
                                name={['dynamicFields', taxonomy?.id]}
                                className={taxonomy?.id}
                                data-cy={`form-item-organization-dynamic-fields-${index}`}
                                label={bilingual({
                                  data: taxonomy?.name,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                                style={{ display: displayFlag && 'none' }}
                                initialValue={initialValues}
                                rules={[
                                  {
                                    required: formFieldProperties?.mandatoryFields?.dynamicFields?.includes(
                                      taxonomy?.id,
                                    ),
                                    message: t('common.validations.informationRequired'),
                                  },
                                ]}
                                hidden={
                                  taxonomy?.isAdminOnly ? (adminCheckHandler({ calendar, user }) ? false : true) : false
                                }>
                                <SortableTreeSelect
                                  setShowDialog={setShowDialog}
                                  form={form}
                                  draggable
                                  dataCy={`tag-organization-dynamic-field`}
                                  fieldName={['dynamicFields', taxonomy?.id]}
                                  data-cy={`treeselect-organization-dynamic-fields-${index}`}
                                  allowClear
                                  treeDefaultExpandAll
                                  notFoundContent={<NoContent />}
                                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                                  treeData={treeDynamicTaxonomyOptions(
                                    taxonomy?.concept,
                                    user,
                                    calendarContentLanguage,
                                  )}
                                />
                              </Form.Item>
                            );
                          }
                        })}
                    </>
                    <>
                      {index == 0 && (
                        <ChangeTypeLayout>
                          {(() => {
                            const nonPresetFields = section?.filter((field) => !field?.isPreset) || [];
                            const nonPresetDynamicFields = dynamicFields?.filter((field) => !field?.isPreset);
                            const hasNonPresetFields = nonPresetFields.length > 0;

                            const hasUnaddedFields = nonPresetFields.some(
                              (field) => !addedFields?.includes(field?.mappedField),
                            );

                            const hasInitialValueInAllNonRequiredDynamicField = nonPresetDynamicFields?.every((field) =>
                              organizationData?.dynamicFields?.some(
                                (dynamicField) =>
                                  field?.id === dynamicField?.taxonomyId && dynamicField?.conceptIds?.length > 0,
                              ),
                            );

                            const allDynamicFieldsAdded = dynamicFields
                              .map((field) => field.mappedField)
                              .every((fieldName) => addedFields?.includes(fieldName));

                            return hasNonPresetFields || nonPresetDynamicFields?.length ? (
                              <Form.Item
                                label={t('dashboard.organization.createNew.addOrganization.addMoreDetails')}
                                style={{ lineHeight: '2.5' }}>
                                {hasUnaddedFields ||
                                !(allDynamicFieldsAdded || hasInitialValueInAllNonRequiredDynamicField) ? (
                                  [...section, ...dynamicFields]?.map((field) => {
                                    let initialValues;

                                    organizationData?.dynamicFields?.forEach((dynamicField) => {
                                      if (field?.id === dynamicField?.taxonomyId)
                                        initialValues = dynamicField?.conceptIds;
                                    });

                                    if (artsDataId || externalCalendarEntityId || !organizationId) {
                                      allTaxonomyData?.data?.forEach((taxonomy) => {
                                        if (field?.id === taxonomy?.id) {
                                          taxonomy?.concept?.forEach((concept) => {
                                            if (concept?.isDefault) {
                                              initialValues = Array.isArray(initialValues)
                                                ? [...initialValues, concept?.id]
                                                : [concept?.id];
                                            }
                                          });
                                        }
                                      });
                                    }

                                    if (
                                      !addedFields?.includes(field?.mappedField) &&
                                      !field?.isPreset &&
                                      !(initialValues && initialValues?.length > 0)
                                    )
                                      return (
                                        <ChangeType
                                          key={field?.mappedField}
                                          primaryIcon={<PlusOutlined />}
                                          disabled={false}
                                          label={contentLanguageBilingual({
                                            data: field?.label,
                                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                            calendarContentLanguage: calendarContentLanguage,
                                          })}
                                          promptText={contentLanguageBilingual({
                                            data: field?.infoPopup,
                                            interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                            calendarContentLanguage: calendarContentLanguage,
                                          })}
                                          secondaryIcon={<InfoCircleOutlined />}
                                          onClick={() => addFieldsHandler(field?.mappedField)}
                                        />
                                      );
                                  })
                                ) : (
                                  <NoContent label={t('dashboard.events.addEditEvent.allDone')} />
                                )}
                              </Form.Item>
                            ) : null;
                          })()}
                        </ChangeTypeLayout>
                      )}
                    </>
                  </Card>
                );
            })}

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
                              // description={moment(event.startDateTime).format('YYYY-MM-DD')}
                              calendarContentLanguage={calendarContentLanguage}
                              bordered
                              itemWidth="100%"
                            />;
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
                              icon={<UserOutlined style={{ color: '#607EFC' }} />}
                              // description={moment(event.startDateTime).format('YYYY-MM-DD')}
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

export default CreateNewOrganization;
