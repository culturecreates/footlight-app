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
import PrimaryButton from '../../../components/Button/Primary';
import { ReactComponent as OrganizationLogo } from '../../../assets/icons/organization-light.svg';
import { featureFlags } from '../../../utils/featureFlags';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { entitiesClass } from '../../../constants/entitiesClass';
import Card from '../../../components/Card/Common/Event';
import { formCategory, formFieldValue, returnFormDataWithFields } from '../../../constants/formFields';
import { useSelector } from 'react-redux';
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
import { userRoles } from '../../../constants/userRoles';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import { Prompt, usePrompt } from '../../../hooks/usePrompt';
import { getExternalSourceId } from '../../../utils/getExternalSourceId';
import { useGetEntitiesByIdQuery, useLazyGetEntityDependencyDetailsQuery } from '../../../services/entities';
import { sameAsTypes } from '../../../constants/sameAsTypes';
import SelectionItem from '../../../components/List/SelectionItem';
import moment from 'moment';

function CreateNewPerson() {
  const timestampRef = useRef(Date.now()).current;
  const [form] = Form.useForm();
  const { t } = useTranslation();
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

  usePrompt(t('common.unsavedChanges'), showDialog);

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

  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });

  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

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
    let validateFieldList = [
      ['name', 'fr'],
      ['name', 'en'],
    ];
    // if (
    //   form.getFieldValue('socialMediaLinks')?.filter((link) => {
    //     if (link) return true;
    //   })?.length > 0
    // ) {
    //   validateFieldList = validateFieldList?.concat(
    //     form
    //       .getFieldValue('socialMediaLinks')
    //       ?.filter((link) => {
    //         if (link) return true;
    //       })
    //       ?.map((link, index) => ['socialMediaLinks', index]),
    //   );
    // }
    let mandatoryFields = formFieldProperties?.mandatoryFields?.standardFields?.map((field) => field?.fieldName);
    mandatoryFields = mandatoryFields?.concat(
      formFieldProperties?.mandatoryFields?.dynamicFields?.map((field) => field?.fieldName),
    );
    validateFieldList = validateFieldList?.concat(
      formFields?.filter((field) => mandatoryFields?.includes(field?.name))?.map((field) => field?.mappedField),
    );

    form
      .validateFields(validateFieldList)
      .then(() => {
        var values = form.getFieldsValue(true);
        let personPayload = {};
        Object.keys(values)?.map((object) => {
          let payload = formPayloadHandler(values[object], object, formFields);
          if (payload) {
            let newKeys = Object.keys(payload);
            personPayload = {
              ...personPayload,
              ...(newKeys?.length > 0 && { [newKeys[0]]: payload[newKeys[0]] }),
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
                personPayload['image'] = imageCrop;
                addUpdatePersonApiHandler(personPayload);
              })
              .catch((error) => {
                console.log(error);
                const element = document.getElementsByClassName('image');
                element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
              });
        } else {
          if (values?.image) {
            if (values?.image && values?.image?.length == 0) personPayload['image'] = null;
            else personPayload['image'] = imageCrop;
          } else if (values?.imageCrop) personPayload['image'] = imageCrop;
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
    if (calendarId && currentCalendarData) {
      if (personData) {
        if (routinghandler(user, calendarId, personData?.createdByUserId, null, true)) {
          if (personData?.image) {
            form.setFieldsValue({
              imageCrop: {
                large: {
                  x: personData?.image?.large?.xCoordinate,
                  y: personData?.image?.large?.yCoordinate,
                  height: personData?.image?.large?.height,
                  width: personData?.image?.large?.width,
                },
                original: {
                  entityId: personData?.image?.original?.entityId ?? null,
                  height: personData?.image?.original?.height,
                  width: personData?.image?.original?.width,
                },
                thumbnail: {
                  x: personData?.image?.thumbnail?.xCoordinate,
                  y: personData?.image?.thumbnail?.yCoordinate,
                  height: personData?.image?.thumbnail?.height,
                  width: personData?.image?.thumbnail?.width,
                },
              },
            });
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
        form.setFieldsValue({
          imageCrop: {
            large: {
              x: externalCalendarEntityData[0]?.image?.large?.xCoordinate,
              y: externalCalendarEntityData[0]?.image?.large?.yCoordinate,
              height: externalCalendarEntityData[0]?.image?.large?.height,
              width: externalCalendarEntityData[0]?.image?.large?.width,
            },
            original: {
              entityId: externalCalendarEntityData[0]?.image?.original?.entityId ?? null,
              height: externalCalendarEntityData[0]?.image?.original?.height,
              width: externalCalendarEntityData[0]?.image?.original?.width,
            },
            thumbnail: {
              x: externalCalendarEntityData[0]?.image?.thumbnail?.xCoordinate,
              y: externalCalendarEntityData[0]?.image?.thumbnail?.yCoordinate,
              height: externalCalendarEntityData[0]?.image?.thumbnail?.height,
              width: externalCalendarEntityData[0]?.image?.thumbnail?.width,
            },
          },
        });
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
        console.log(response?.data?.organizations);
      });
    }
  }, []);

  useEffect(() => {
    if (artsDataId) {
      getArtsData(artsDataId);
    } else if (location?.state?.name) {
      setNewEntityData({
        name: {
          fr: location?.state?.name,
          en: location?.state?.name,
        },
      });
    }
  }, []);

  return fields && !personLoading && !taxonomyLoading && !artsDataLoading && !isEntityDetailsLoading ? (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <Prompt when={showDialog} message={t('common.unsavedChanges')} beforeUnload={true} />
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
                                artsDataLink={artsDataLinkChecker(personData?.sameAs)}
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
                                  en: taxonomy?.name?.en,
                                  fr: taxonomy?.name?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                })}
                                initialValue={initialValues}
                                hidden={taxonomy?.isAdminOnly ? (adminCheckHandler() ? false : true) : false}>
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
