import React, { useRef, useState, useEffect } from 'react';
import './createNewOrganization.css';
import '../AddEvent/addEvent.css';
import { Form, Row, Col, Button, message, notification } from 'antd';
import { CloseCircleOutlined, PlusOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import PrimaryButton from '../../../components/Button/Primary';
import { featureFlags } from '../../../utils/featureFlags';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { entitiesClass } from '../../../constants/entitiesClass';
import Card from '../../../components/Card/Common/Event';
import { formCategory, formFieldValue, returnFormDataWithFields } from '../../../constants/formFields';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import {
  useAddOrganizationMutation,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} from '../../../services/organization';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import TreeSelectOption from '../../../components/TreeSelectOption/TreeSelectOption';
import NoContent from '../../../components/NoContent/NoContent';
import { treeDynamicTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import Tags from '../../../components/Tags/Common/Tags';
import { formFieldsHandler } from '../../../utils/formFieldsHandler';
import { formPayloadHandler } from '../../../utils/formPayloadHandler';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import { loadArtsDataEntity } from '../../../services/artsData';
import { userRoles } from '../../../constants/userRoles';
import { useLazyGetEntitiesQuery } from '../../../services/entities';
import { placesOptions } from '../../../components/Select/selectOption.settings';
import ChangeType from '../../../components/ChangeType';
import { PathName } from '../../../constants/pathName';
import { useAddImageMutation } from '../../../services/image';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';

function CreateNewOrganization() {
  const timestampRef = useRef(Date.now()).current;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentCalendarData] = useOutletContext();
  const { user } = useSelector(getUserDetails);
  const { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const organizationId = searchParams.get('id');
  const artsDataId = location?.state?.data?.id ?? null;

  const { data: organizationData, isLoading: organizationLoading } = useGetOrganizationQuery(
    { id: organizationId, calendarId, sessionId: timestampRef },
    { skip: organizationId ? false : true },
  );

  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.ORGANIZATION,
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [getEntities] = useLazyGetEntitiesQuery({ sessionId: timestampRef });
  const [addOrganization, { isLoading: addOrganizationLoading }] = useAddOrganizationMutation();
  const [updateOrganization, { isLoading: updateOrganizationLoading }] = useUpdateOrganizationMutation();
  const [addImage, { isLoading: imageUploadLoading }] = useAddImageMutation();

  const [artsData, setArtsData] = useState(null);
  const [newEntityData, setNewEntityData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [locationPlace, setLocationPlace] = useState();
  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [addedFields, setAddedFields] = useState([]);
  const [scrollToSelectedField, setScrollToSelectedField] = useState();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.organization);
  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.organization);
  formFields = formFields?.length > 0 && formFields[0]?.formFields;
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  const addUpdateOrganizationApiHandler = (organizationObj) => {
    var promise = new Promise(function (resolve, reject) {
      if (!organizationId || organizationId === '') {
        if (artsDataId && artsData) {
          let artsDataSameAs = Array.isArray(artsData?.sameAs);
          if (artsDataSameAs)
            organizationObj = {
              ...organizationObj,
              sameAs: artsData?.sameAs,
            };
          else
            organizationObj = {
              ...organizationObj,
              sameAs: [artsData?.sameAs],
            };
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
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.Organizations}`);
          })
          .catch((errorInfo) => {
            reject();
            console.log(errorInfo);
          });
      } else {
        organizationObj = {
          ...organizationObj,
          sameAs: organizationObj?.sameAs,
        };
        updateOrganization({
          data: organizationObj,
          calendarId,
          organizationId,
        })
          .unwrap()
          .then(() => {
            resolve(organizationId);
            notification.success({
              description: t('dashboard.organization.createNew.notification.editSuccess'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}`);
          })
          .catch((error) => {
            reject();
            console.log(error);
          });
      }
    });
    return promise;
  };

  const onSaveHandler = () => {
    form
      .validateFields([
        ['name', 'fr'],
        ['name', 'en'],
      ])
      .then(() => {
        var values = form.getFieldsValue(true);
        let organizationPayload = {};
        Object.keys(values)?.map((object) => {
          let payload = formPayloadHandler(values[object], object, formFields);
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
        if ((values?.image || (values?.image && values?.image?.length > 0)) && !values?.logo) {
          if (values?.image?.length > 0 && values?.image[0]?.originFileObj) {
            const formdata = new FormData();
            formdata.append('file', values?.image[0].originFileObj);
            formdata &&
              addImage({ data: formdata, calendarId })
                .unwrap()
                .then((response) => {
                  if (featureFlags.imageCropFeature) {
                    imageCrop = {
                      ...imageCrop,
                      original: {
                        ...imageCrop?.original,
                        entityId: response?.data?.original?.entityId,
                        height: response?.data?.height,
                        width: response?.data?.width,
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
                  organizationPayload['image'] = imageCrop;
                  addUpdateOrganizationApiHandler(organizationPayload);
                })
                .catch((error) => {
                  console.log(error);
                  const element = document.getElementsByClassName('image');
                  element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                });
          } else {
            if (values?.image) {
              if (values?.image && values?.image?.length == 0) organizationPayload['image'] = null;
              else organizationPayload['image'] = imageCrop;
            }
            addUpdateOrganizationApiHandler(organizationPayload);
          }
        } else if ((values?.logo || (values?.logo && values?.logo?.length > 0)) && !values?.image) {
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
                  addUpdateOrganizationApiHandler(organizationPayload);
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
            addUpdateOrganizationApiHandler(organizationPayload);
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
                .then((response) => {
                  if (featureFlags.imageCropFeature) {
                    imageCrop = {
                      ...imageCrop,
                      original: {
                        ...imageCrop?.original,
                        entityId: response?.data?.original?.entityId,
                        height: response?.data?.height,
                        width: response?.data?.width,
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
                          addUpdateOrganizationApiHandler(organizationPayload);
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
                    addUpdateOrganizationApiHandler(organizationPayload);
                  }
                })
                .catch((error) => {
                  console.log(error);
                  const element = document.getElementsByClassName('image');
                  element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                });
          } else {
            if (values?.image) {
              if (values?.image && values?.image?.length == 0) organizationPayload['image'] = null;
              else organizationPayload['image'] = imageCrop;
            }
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
                    addUpdateOrganizationApiHandler(organizationPayload);
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
              addUpdateOrganizationApiHandler(organizationPayload);
            }
          }
        } else {
          if (values?.logo) {
            if (values?.logo && values?.logo?.length == 0) organizationPayload['logo'] = null;
            else organizationPayload['logo'] = organizationData?.logo;
          }
          if (values?.image) {
            if (values?.image && values?.image?.length == 0) organizationPayload['image'] = null;
            else organizationPayload['image'] = imageCrop;
          }
          addUpdateOrganizationApiHandler(organizationPayload);
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

  useEffect(() => {
    if (calendarId && organizationData && currentCalendarData) {
      if (routinghandler(user, calendarId, organizationData?.createdByUserId, null, true)) {
        if (organizationData?.image) {
          form.setFieldsValue({
            imageCrop: {
              large: {
                x: organizationData?.image?.large?.xCoordinate,
                y: organizationData?.image?.large?.yCoordinate,
                height: organizationData?.image?.large?.height,
                width: organizationData?.image?.large?.width,
              },
              original: {
                entityId: organizationData?.image?.original?.entityId ?? null,
                height: organizationData?.image?.original?.height,
                width: organizationData?.image?.original?.width,
              },
              thumbnail: {
                x: organizationData?.image?.thumbnail?.xCoordinate,
                y: organizationData?.image?.thumbnail?.yCoordinate,
                height: organizationData?.image?.thumbnail?.height,
                width: organizationData?.image?.thumbnail?.width,
              },
            },
          });
        }
        let organizationKeys = Object.keys(organizationData);
        if (organizationKeys?.length > 0) setAddedFields(organizationKeys);
      } else
        window.location.replace(
          `${location?.origin}${PathName.Dashboard}/${calendarId}${PathName.Organizations}/${organizationId}`,
        );
    }
  }, [organizationLoading, currentCalendarData]);

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
      setNewEntityData({
        name: {
          fr: location?.state?.name,
          en: location?.state?.name,
        },
      });

    placesSearch('');
  }, []);

  return fields && !organizationLoading && !taxonomyLoading && !artsDataLoading ? (
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
                      {t('dashboard.organization.createNew.search.breadcrumb')}
                    </Button>
                  </div>
                </Col>
                <Col>
                  <div className="add-event-button-wrap">
                    <Form.Item>
                      <PrimaryButton
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
                <h4>
                  {organizationId
                    ? t('dashboard.organization.createNew.addOrganization.editOrganization')
                    : t('dashboard.organization.createNew.addOrganization.newOrganization')}
                </h4>
              </div>
            </Col>
          </Row>
          {fields?.map((section, index) => {
            if (section?.length > 0)
              return (
                <Card title={section[0]?.category !== formCategory.PRIMARY && section[0]?.category} key={index}>
                  <>
                    {artsDataLinkChecker(organizationData?.sameAs) && section[0]?.category === formCategory.PRIMARY && (
                      <Row>
                        <Col span={24}>
                          <p className="add-entity-label">
                            {t('dashboard.organization.createNew.addOrganization.dataSource')}
                          </p>
                        </Col>
                        <Col span={24}>
                          <ArtsDataInfo
                            artsDataLink={artsDataLinkChecker(organizationData?.sameAs)}
                            name={contentLanguageBilingual({
                              en: organizationData?.name?.en,
                              fr: organizationData?.name?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            disambiguatingDescription={contentLanguageBilingual({
                              en: organizationData?.disambiguatingDescription?.en,
                              fr: organizationData?.disambiguatingDescription?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                          />
                        </Col>
                        <Col span={24}>
                          <div style={{ display: 'inline' }}>
                            <span className="add-event-date-heading">
                              {t('dashboard.organization.createNew.addOrganization.question.firstPart')}
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
                                navigate(
                                  `${PathName.Dashboard}/${calendarId}${PathName.Organizations}${PathName.Search}`,
                                );
                              }}>
                              {t('dashboard.organization.createNew.addOrganization.question.secondPart')}
                            </span>
                            <span className="add-event-date-heading">
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
                            allTaxonomyData,
                            user,
                            calendarContentLanguage,
                            entityData: organizationData ? organizationData : artsData ? artsData : newEntityData,
                            index,
                            t,
                            adminCheckHandler,
                            currentCalendarData,
                            imageCropOpen,
                            setImageCropOpen,
                            placesSearch,
                            allPlacesList,
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
                          });
                        }
                      });
                    })}
                    {section[0]?.category === formCategory.PRIMARY &&
                      allTaxonomyData?.data?.map((taxonomy, index) => {
                        if (taxonomy?.isDynamicField) {
                          let initialValues;
                          organizationData?.dynamicFields?.forEach((dynamicField) => {
                            if (taxonomy?.id === dynamicField?.taxonomyId) initialValues = dynamicField?.conceptIds;
                          });
                          return (
                            <Form.Item
                              key={index}
                              name={['dynamicFields', taxonomy?.id]}
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
                  <>
                    {section?.filter((field) => !field?.isPreset)?.length > 0 && (
                      <Form.Item
                        label={t('dashboard.organization.createNew.addOrganization.addMoreDetails')}
                        style={{ lineHeight: '2.5' }}>
                        {section
                          ?.filter((field) => !field?.isPreset)
                          ?.map((field) => addedFields?.includes(field?.mappedField))
                          ?.includes(false) ? (
                          section?.map((field) => {
                            if (!addedFields?.includes(field?.mappedField) && !field?.isPreset)
                              return (
                                <ChangeType
                                  key={field?.mappedField}
                                  primaryIcon={<PlusOutlined />}
                                  disabled={false}
                                  label={contentLanguageBilingual({
                                    en: field?.label?.en,
                                    fr: field?.label?.fr,
                                    interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                    calendarContentLanguage: calendarContentLanguage,
                                  })}
                                  promptText={contentLanguageBilingual({
                                    en: field?.helperText?.en,
                                    fr: field?.helperText?.fr,
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
                    )}
                  </>
                </Card>
              );
          })}
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
