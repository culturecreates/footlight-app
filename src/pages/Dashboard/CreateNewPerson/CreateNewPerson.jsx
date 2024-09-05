import React, { useRef, useEffect, useState } from 'react';
import '../AddEvent/addEvent.css';
import { Form, Row, Col, Button, notification, message } from 'antd';
import Icon, {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import OutlinedButton from '../../..//components/Button/Outlined';
import PrimaryButton from '../../../components/Button/Primary';
import { ReactComponent as OrganizationLogo } from '../../../assets/icons/organization-light.svg';
import { featureFlags } from '../../../utils/featureFlags';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { entitiesClass } from '../../../constants/entitiesClass';
import Card from '../../../components/Card/Common/Event';
import { dataTypes, formCategory, formFieldValue, returnFormDataWithFields } from '../../../constants/formFields';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import TreeSelectOption from '../../../components/TreeSelectOption/TreeSelectOption';
import NoContent from '../../../components/NoContent/NoContent';
import { treeDynamicTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import Tags from '../../../components/Tags/Common/Tags';
import { formFieldsHandler } from '../../../utils/formFieldsHandler';
import { formPayloadHandler } from '../../../utils/formPayloadHandler';
import { useAddPersonMutation, useGetPersonQuery, useUpdatePersonMutation } from '../../../services/people';
import { useAddImageMutation } from '../../../services/image';
import { PathName } from '../../../constants/pathName';
import { loadArtsDataEntity } from '../../../services/artsData';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { RouteLeavingGuard } from '../../../hooks/usePrompt';
import { getExternalSourceId } from '../../../utils/getExternalSourceId';
import { useGetEntitiesByIdQuery, useLazyGetEntityDependencyDetailsQuery } from '../../../services/entities';
import { sameAsTypes } from '../../../constants/sameAsTypes';
import moment from 'moment';
import SelectionItem from '../../../components/List/SelectionItem';
import {
  clearActiveFallbackFieldsInfo,
  getActiveFallbackFieldsInfo,
  getLanguageLiteralBannerDisplayStatus,
  setLanguageLiteralBannerDisplayStatus,
} from '../../../redux/reducer/languageLiteralSlice';
import Alert from '../../../components/Alert';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import { isDataValid } from '../../../utils/MultiLingualFormItemSupportFunctions';

function CreateNewPerson() {
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
  const languageLiteralBannerDisplayStatus = useSelector(getLanguageLiteralBannerDisplayStatus);
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);
  const { user } = useSelector(getUserDetails);
  const { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const personId = searchParams.get('id');
  const externalCalendarEntityId = searchParams.get('entityId');

  const artsDataId = location?.state?.data?.id ?? null;
  const isRoutingToEventPage = location?.state?.data?.isRoutingToEventPage;

  const { data: personData, isLoading: personLoading } = useGetPersonQuery(
    { personId, calendarId, sessionId: timestampRef },
    { skip: personId ? false : true },
  );

  let personIdsQuery = new URLSearchParams();
  personIdsQuery.append('ids', externalCalendarEntityId);
  const { data: externalCalendarEntityData, isLoading: externalEntityLoading } = useGetEntitiesByIdQuery(
    { ids: personIdsQuery, calendarId, sessionId: timestampRef },
    { skip: externalCalendarEntityId ? false : true },
  );
  let taxonomyClassQuery = new URLSearchParams();
  taxonomyClassQuery.append('taxonomy-class', taxonomyClass.PERSON);
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: decodeURIComponent(taxonomyClassQuery.toString()),
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [addPerson, { isLoading: addPersonLoading }] = useAddPersonMutation();
  const [addImage, { isLoading: imageUploadLoading }] = useAddImageMutation();
  const [updatePerson, { isLoading: updatePersonLoading }] = useUpdatePersonMutation();
  const [getDerivedEntities, { isFetching: isEntityDetailsLoading }] = useLazyGetEntityDependencyDetailsQuery({
    sessionId: timestampRef,
  });

  const [derivedEntitiesData, setDerivedEntitiesData] = useState();
  const [derivedEntitiesDisplayStatus, setDerivedEntitiesDisplayStatus] = useState(false);
  const [artsData, setArtsData] = useState(null);
  const [newEntityData, setNewEntityData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.person);
  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.person);
  let formFieldProperties = formFields?.length > 0 && formFields[0]?.formFieldProperties;
  formFields = formFields?.length > 0 && formFields[0]?.formFields;
  let externalEntityData = externalCalendarEntityData?.length > 0 && externalCalendarEntityData[0];
  externalEntityData = {
    ...externalEntityData,
    occupation: [],
  };

  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  const addUpdatePersonApiHandler = (personObj) => {
    var promise = new Promise(function (resolve, reject) {
      if (!personId || personId === '') {
        if (artsDataId && artsData) {
          let artsDataSameAs = Array.isArray(artsData?.sameAs);
          if (artsDataSameAs)
            personObj = {
              ...personObj,
              sameAs: artsData?.sameAs,
            };
          else
            personObj = {
              ...personObj,
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
            personObj = {
              ...personObj,
              sameAs: externalEntityData?.sameAs?.concat(sameAs),
            };
          }
        }
        addPerson({
          data: personObj,
          calendarId,
        })
          .unwrap()
          .then((response) => {
            resolve(response?.id);
            notification.success({
              description: t('dashboard.people.createNew.addPerson.notification.addSuccess'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}`);
          })
          .catch((errorInfo) => {
            reject();
            console.log(errorInfo);
          });
      } else {
        personObj = {
          ...personObj,
          sameAs: personData?.sameAs,
        };
        updatePerson({
          data: personObj,
          calendarId,
          personId,
        })
          .unwrap()
          .then(() => {
            resolve(personId);
            if (isRoutingToEventPage) {
              navigate(isRoutingToEventPage);
            } else {
              notification.success({
                description: t('dashboard.people.createNew.addPerson.notification.editSuccess'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}`);
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

  const onSaveHandler = (event) => {
    event?.preventDefault();
    setShowDialog(false);
    let validateFieldList = [];
    let mandatoryFields = formFieldProperties?.mandatoryFields?.standardFields?.map((field) => field?.fieldName);
    validateFieldList = validateFieldList?.concat(
      formFields
        ?.filter((field) => mandatoryFields?.includes(field?.name))
        ?.map((field) => {
          if (field?.datatype === dataTypes.MULTI_LINGUAL) {
            return [
              [field?.mappedField, 'en'],
              [field?.mappedField, 'fr'],
            ];
          } else return field?.mappedField;
        })
        ?.flat(),
    );

    validateFieldList = validateFieldList?.concat(
      formFieldProperties?.mandatoryFields?.dynamicFields?.map((field) => ['dynamicFields', field]),
    );

    form
      .validateFields(validateFieldList)
      .then(async () => {
        var values = form.getFieldsValue(true);
        let personPayload = {};
        Object.keys(values)?.map((object) => {
          let payload = formPayloadHandler(values[object], object, formFields, calendarContentLanguage);
          if (payload) {
            let newKeys = Object.keys(payload);
            personPayload = {
              ...personPayload,
              ...(newKeys?.length > 0 && { [newKeys[0]]: payload[newKeys[0]] }),
            };
          }
        });
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
                personPayload['image'] = imageCrop;
                addUpdatePersonApiHandler(personPayload);
              })
              .catch((error) => {
                console.log(error);
                const element = document.getElementsByClassName('image');
                element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
              });
        } else {
          if (values.multipleImagesCrop?.length > 0) await uploadImageList();
          if (
            values?.image &&
            values?.image?.length === 0 &&
            (!values.multipleImagesCrop || values.multipleImagesCrop?.length === 0)
          ) {
            // Main image is removed and no new image is added
            // No gallery images are added
            personPayload['image'] = [];
          } else personPayload['image'] = imageCrop;
          addUpdatePersonApiHandler(personPayload);
        }
      })
      .catch((error) => {
        console.log(error);
        message.warning({
          duration: 10,
          maxCount: 1,
          key: 'person-save-as-warning',
          content: (
            <>
              {t('dashboard.people.createNew.addPerson.notification.saveError')} &nbsp;
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
  };

  const onValuesChangeHandler = () => {
    setShowDialog(true);
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
    if (calendarId && currentCalendarData) {
      if (personData) {
        if (routinghandler(user, calendarId, personData?.createdByUserId, null, true, personData?.id)) {
          if (personData?.image?.length > 0) {
            const mainImage = personData.image.find((image) => image?.isMain) || null;
            const imageGalleryImages = personData.image.filter((image) => !image?.isMain);

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
          if (personData?.sameAs?.length > 0) {
            let sourceId = artsDataLinkChecker(personData?.sameAs);
            sourceId = getExternalSourceId(sourceId);
            getArtsData(sourceId);
          }
        } else
          window.location.replace(
            `${window.location?.origin}${PathName.Dashboard}/${calendarId}${PathName.People}/${personId}`,
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
        if (externalCalendarEntityData[0]?.sameAs?.length > 0) {
          let sourceId = artsDataLinkChecker(externalCalendarEntityData[0]?.sameAs);
          sourceId = getExternalSourceId(sourceId);
          getArtsData(sourceId);
        }
      }
    }
  }, [personLoading, currentCalendarData, externalEntityLoading]);

  useEffect(() => {
    if (isReadOnly) {
      if (personId) navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}/${personId}`, { replace: true });
      else navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}`, { replace: true });
    }
  }, [isReadOnly]);

  useEffect(() => {
    if (personId) {
      getDerivedEntities({ id: personId, calendarId }).then((response) => {
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
  }, []);

  return fields && !personLoading && !taxonomyLoading && !artsDataLoading && !isEntityDetailsLoading ? (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <RouteLeavingGuard isBlocking={showDialog} />

      <div className="add-edit-wrapper add-organization-wrapper">
        <Form form={form} layout="vertical" name="person" onValuesChange={onValuesChangeHandler}>
          <Row gutter={[32, 24]} className="add-edit-wrapper">
            <Col span={24}>
              <Row gutter={[32, 2]}>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col>
                      <div className="button-container">
                        <Button
                          data-cy="button-person-back-to-previous"
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
                            data-cy="button-save-person"
                            label={t('dashboard.events.addEditEvent.saveOptions.save')}
                            onClick={(e) => onSaveHandler(e)}
                            disabled={addPersonLoading || imageUploadLoading || updatePersonLoading ? true : false}
                          />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col>
                  <div className="add-edit-event-heading">
                    <h4 data-cy="heading-add-edit-person-title">
                      {personId
                        ? t('dashboard.people.createNew.addPerson.editPerson')
                        : t('dashboard.people.createNew.addPerson.newPerson')}
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
            {fields?.map((section, index) => {
              if (section?.length > 0)
                return (
                  <Card
                    marginResponsive="0px"
                    title={section[0]?.category !== formCategory.PRIMARY && section[0]?.category}
                    key={index}>
                    <>
                      {(artsDataLinkChecker(personData?.sameAs) || artsDataLinkChecker(artsData?.sameAs)) &&
                        section[0]?.category === formCategory.PRIMARY && (
                          <Row>
                            <Col span={24}>
                              <p className="add-entity-label" data-cy="para-person-datasource-title">
                                {t('dashboard.people.createNew.addPerson.dataSource')}
                              </p>
                            </Col>
                            <Col span={24}>
                              <ArtsDataInfo
                                artsDataLink={
                                  artsDataLinkChecker(personData?.sameAs)
                                    ? artsDataLinkChecker(personData?.sameAs)
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
                                <span className="add-event-date-heading" data-cy="span-person-question-part-one">
                                  {t('dashboard.people.createNew.addPerson.question.firstPart')}
                                </span>
                                <span
                                  data-cy="span-person-question-part-two"
                                  className="add-event-date-heading"
                                  style={{
                                    color: '#1b3de6',
                                    textDecoration: 'underline',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => {
                                    navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.Search}`);
                                  }}>
                                  {t('dashboard.people.createNew.addPerson.question.secondPart')}
                                </span>
                                <span className="add-event-date-heading" data-cy="span-person-question-part-three">
                                  {t('dashboard.people.createNew.addPerson.question.thirdPart')}
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
                              allTaxonomyData,
                              user,
                              calendarContentLanguage,
                              entityData: personData
                                ? personData
                                : artsDataId
                                ? artsData
                                : externalCalendarEntityId && externalCalendarEntityData?.length > 0
                                ? externalEntityData
                                : newEntityData,
                              index,
                              t,
                              adminCheckHandler,
                              currentCalendarData,
                              imageCropOpen,
                              setImageCropOpen,
                              form,
                              mandatoryFields: formFieldProperties?.mandatoryFields?.standardFields ?? [],
                              adminOnlyFields: formFieldProperties?.adminOnlyFields?.standardFields ?? [],
                              setShowDialog,
                            });
                          }
                        });
                      })}
                      {section[0]?.category === formCategory.PRIMARY &&
                        allTaxonomyData?.data?.map((taxonomy, index) => {
                          if (taxonomy?.isDynamicField) {
                            let initialValues;
                            personData?.dynamicFields?.forEach((dynamicField) => {
                              if (taxonomy?.id === dynamicField?.taxonomyId) initialValues = dynamicField?.conceptIds;
                            });
                            return (
                              <Form.Item
                                key={index}
                                name={['dynamicFields', taxonomy?.id]}
                                label={bilingual({
                                  data: taxonomy?.name,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
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
                                <TreeSelectOption
                                  data-cy={`treeselect-person-dynamic-fields-${index}`}
                                  allowClear
                                  treeDefaultExpandAll
                                  notFoundContent={<NoContent />}
                                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                                  treeData={treeDynamicTaxonomyOptions(
                                    taxonomy?.concept,
                                    user,
                                    calendarContentLanguage,
                                  )}
                                  tagRender={(props) => {
                                    const { label, closable, onClose } = props;
                                    return (
                                      <Tags
                                        data-cy={`tag-person-dynamic-field-${label}`}
                                        closable={closable}
                                        onClose={onClose}
                                        closeIcon={
                                          <CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />
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
      <LoadingIndicator data-cy="loading-indicator-person" />
    </div>
  );
}

export default CreateNewPerson;
