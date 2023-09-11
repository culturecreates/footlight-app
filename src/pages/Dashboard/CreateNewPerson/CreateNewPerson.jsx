import React, { useRef, useEffect, useState } from 'react';
import '../AddEvent/addEvent.css';
import { Form, Row, Col, Button, notification } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import PrimaryButton from '../../../components/Button/Primary';
import { featureFlags } from '../../../utils/featureFlags';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { entitiesClass } from '../../../constants/entitiesClass';
import Card from '../../../components/Card/Common/Event';
import { formCategory, formFieldValue, renderFormFields } from '../../../constants/formFields';
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
import { formInitialValueHandler } from '../../../utils/formInitialValueHandler';
import { useAddPersonMutation, useGetPersonQuery, useUpdatePersonMutation } from '../../../services/people';
import { useAddImageMutation } from '../../../services/image';
import { PathName } from '../../../constants/pathName';
import { loadArtsDataEntity } from '../../../services/artsData';
import ArtsDataInfo from '../../../components/ArtsDataInfo/ArtsDataInfo';
import { artsDataLinkChecker } from '../../../utils/artsDataLinkChecker';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';

function CreateNewPerson() {
  const timestampRef = useRef(Date.now()).current;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentCalendarData] = useOutletContext();
  const { user } = useSelector(getUserDetails);
  const { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const personId = searchParams.get('id');
  const artsDataId = location?.state?.data ?? null;

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
  const [artsDataLoading, setArtsDataLoading] = useState(false);

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.people);
  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.people);
  formFields = formFields?.length > 0 && formFields[0]?.formFields;

  const addUpdatePersonApiHandler = (personObj) => {
    var promise = new Promise(function (resolve, reject) {
      if (!personId || personId === '') {
        addPerson({
          data: personObj,
          calendarId,
        })
          .unwrap()
          .then((response) => {
            resolve(response?.id);
            //Add the notification msg for adding person
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
            //Add success msg for updating a person
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
      .validateFields([])
      .then(() => {
        var values = form.getFieldsValue(true);
        let personPayload = {};
        Object.keys(values)?.map((object) => {
          let payload = formPayloadHandler(values[object], object, formFields);
          if (payload) {
            let newKeys = Object.keys(payload);
            let childKeys = Object.keys(payload[newKeys[0]]);

            personPayload = {
              ...personPayload,
              ...(newKeys?.length > 0 && {
                [newKeys[0]]: {
                  ...personPayload[newKeys[0]],
                  ...(childKeys?.length > 0 && { [childKeys[0]]: payload[newKeys[0]][childKeys[0]] }),
                  ...(childKeys?.length > 1 && {
                    [childKeys[childKeys?.length - 1]]: payload[newKeys[0]][childKeys[childKeys?.length - 1]],
                  }),
                },
              }),
            };
          }
        });
        if (values?.image?.length > 0 && values?.image[0]?.originFileObj) {
          const formdata = new FormData();
          formdata.append('file', values?.image[0].originFileObj);
          formdata &&
            addImage({ data: formdata, calendarId })
              .unwrap()
              .then((response) => {
                personPayload['image'] = {
                  original: {
                    entityId: response?.data?.original?.entityId,
                    height: response?.data?.height,
                    width: response?.data?.width,
                  },
                  large: {},
                  thumbnail: {},
                };
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
            else personPayload['image'] = personData?.image;
          }
          addUpdatePersonApiHandler(personPayload);
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
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
  }, []);

  // console.log(fields);
  // console.log(personData);
  return fields && !personLoading && !taxonomyLoading && !artsDataLoading ? (
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
          {fields?.map((section, index) => {
            if (section?.length > 0)
              return (
                <Card title={section[0]?.category !== formCategory.PRIMARY && section[0]?.category} key={index}>
                  <>
                    {artsDataLinkChecker(personData?.sameAs) && section[0]?.category === formCategory.PRIMARY && (
                      <Row>
                        <Col span={24}>
                          <p className="add-entity-label">{t('dashboard.people.createNew.addPerson.dataSource')}</p>
                        </Col>
                        <Col span={24}>
                          <ArtsDataInfo
                            artsDataLink={artsDataLinkChecker(personData?.sameAs)}
                            name={contentLanguageBilingual({
                              en: personData?.name?.en,
                              fr: personData?.name?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                            disambiguatingDescription={contentLanguageBilingual({
                              en: personData?.disambiguatingDescription?.en,
                              fr: personData?.disambiguatingDescription?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            })}
                          />
                        </Col>
                        <Col span={24}>
                          <p className="add-event-date-heading">{t('dashboard.people.createNew.addPerson.question')}</p>
                        </Col>
                      </Row>
                    )}
                    {section?.map((field) => {
                      return formFieldValue?.map((formField, index) => {
                        if (formField?.type === field.type) {
                          return renderFormFields({
                            name: [field?.mappedField],
                            type: field?.type,
                            datatype: field?.datatype,
                            required: field?.isRequiredField,
                            element: formField?.element({
                              datatype: field?.datatype,
                              taxonomyData: allTaxonomyData,
                              user: user,
                              type: field?.mappedField,
                              isDynamicField: false,
                              calendarContentLanguage,
                              name: [field?.mappedField],
                              preview: true,
                              placeholder: contentLanguageBilingual({
                                en: field?.placeholder?.en,
                                fr: field?.placeholder?.fr,
                                interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                calendarContentLanguage: calendarContentLanguage,
                              }),
                              largeUrl: personData?.image?.large?.uri,
                              required: field?.isRequiredField,
                              t: t,
                            }),
                            key: index,
                            initialValue: formInitialValueHandler(
                              field?.type,
                              field?.mappedField,
                              field?.datatype,
                              personData ?? artsData,
                            ),
                            label: contentLanguageBilingual({
                              en: field?.label?.en,
                              fr: field?.label?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            }),
                            userTips: contentLanguageBilingual({
                              en: field?.userTips?.text?.en,
                              fr: field?.userTips?.text?.fr,
                              interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                              calendarContentLanguage: calendarContentLanguage,
                            }),
                            position: field?.userTips?.position,
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
                  <></>
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

export default CreateNewPerson;
