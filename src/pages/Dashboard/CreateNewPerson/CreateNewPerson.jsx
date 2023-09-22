import React, { useRef, useEffect, useState } from 'react';
import '../AddEvent/addEvent.css';
import { Form, Row, Col, Button, notification, message } from 'antd';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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

function CreateNewPerson() {
  const timestampRef = useRef(Date.now()).current;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentCalendarData] = useOutletContext();
  const { user } = useSelector(getUserDetails);
  const { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const personId = searchParams.get('id');
  const artsDataId = location?.state?.data?.id ?? null;

  const { data: personData, isLoading: personLoading } = useGetPersonQuery(
    { personId, calendarId, sessionId: timestampRef },
    { skip: personId ? false : true },
  );

  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PERSON,
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [addPerson, { isLoading: addPersonLoading }] = useAddPersonMutation();
  const [addImage, { isLoading: imageUploadLoading }] = useAddImageMutation();
  const [updatePerson, { isLoading: updatePersonLoading }] = useUpdatePersonMutation();

  const [artsData, setArtsData] = useState(null);
  const [newEntityData, setNewEntityData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [imageCropOpen, setImageCropOpen] = useState(false);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.people);
  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.people);
  formFields = formFields?.length > 0 && formFields[0]?.formFields;

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
            notification.success({
              description: t('dashboard.people.createNew.addPerson.notification.editSuccess'),
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
          }
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
  useEffect(() => {
    if (calendarId && personData && currentCalendarData) {
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
      } else
        window.location.replace(`${location?.origin}${PathName.Dashboard}/${calendarId}${PathName.People}/${personId}`);
    }
  }, [personLoading, currentCalendarData]);

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
    } else if (location?.state?.name) {
      setNewEntityData({
        name: {
          fr: location?.state?.name,
          en: location?.state?.name,
        },
      });
    }
  }, []);

  return fields && !personLoading && !taxonomyLoading && !artsDataLoading ? (
    <FeatureFlag isFeatureEnabled={featureFlags.editScreenPeoplePlaceOrganization}>
      <div className="add-edit-wrapper add-organization-wrapper">
        <Form form={form} layout="vertical" name="person">
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
                            disabled={addPersonLoading || imageUploadLoading || updatePersonLoading ? true : false}
                          />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col>
                  <div className="add-edit-event-heading">
                    <h4>
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
                  <Card title={section[0]?.category !== formCategory.PRIMARY && section[0]?.category} key={index}>
                    <>
                      {(artsDataLinkChecker(personData?.sameAs) || artsDataLinkChecker(artsData?.sameAs)) &&
                        section[0]?.category === formCategory.PRIMARY && (
                          <Row>
                            <Col span={24}>
                              <p className="add-entity-label">{t('dashboard.people.createNew.addPerson.dataSource')}</p>
                            </Col>
                            <Col span={24}>
                              <ArtsDataInfo
                                artsDataLink={artsDataLinkChecker(personData?.sameAs ?? artsData?.sameAs)}
                                name={contentLanguageBilingual({
                                  en: personData?.name?.en ?? artsData?.name?.en,
                                  fr: personData?.name?.fr ?? artsData?.name?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  calendarContentLanguage: calendarContentLanguage,
                                })}
                                disambiguatingDescription={contentLanguageBilingual({
                                  en:
                                    personData?.disambiguatingDescription?.en ??
                                    artsData?.disambiguatingDescription?.en,
                                  fr:
                                    personData?.disambiguatingDescription?.fr ??
                                    artsData?.disambiguatingDescription?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  calendarContentLanguage: calendarContentLanguage,
                                })}
                              />
                            </Col>
                            <Col span={24}>
                              <div style={{ display: 'inline' }}>
                                <span className="add-event-date-heading">
                                  {t('dashboard.people.createNew.addPerson.question.firstPart')}
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
                                    navigate(`${PathName.Dashboard}/${calendarId}${PathName.People}${PathName.Search}`);
                                  }}>
                                  {t('dashboard.people.createNew.addPerson.question.secondPart')}
                                </span>
                                <span className="add-event-date-heading">
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
                              entityData: personData ? personData : artsData ? artsData : newEntityData,
                              index,
                              t,
                              adminCheckHandler,
                              currentCalendarData,
                              imageCropOpen,
                              setImageCropOpen,
                              form,
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
                                initialValue={initialValues}>
                                <TreeSelectOption
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

export default CreateNewPerson;
