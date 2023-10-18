import { Card, Checkbox, Col, Dropdown, Form, Input, notification, Row, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import BilingualInput from '../../../components/BilingualInput';
import BreadCrumbButton from '../../../components/Button/BreadCrumb/BreadCrumbButton';
import { contentLanguage } from '../../../constants/contentLanguage';
import PrimaryButton from '../../../components/Button/Primary';
import Outlined from '../../../components/Button/Outlined';
import ContentLanguageInput from '../../../components/ContentLanguageInput';
import './addTaxonomy.css';
import { taxonomyClassTranslations } from '../../../constants/taxonomyClass';
import { userRolesWithTranslation } from '../../../constants/userRoles';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';
import DraggableTree from '../../../components/DraggableTree/DraggableTree';
import { useAddTaxonomyMutation, useLazyGetTaxonomyQuery, useUpdateTaxonomyMutation } from '../../../services/taxonomy';
import { standardFieldsForTaxonomy } from '../../../utils/standardFields';
import LoadingIndicator from '../../../components/LoadingIndicator';

const AddTaxonomy = () => {
  const { TextArea } = Input;
  const [form] = Form.useForm();

  const { calendarId } = useParams();
  const location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  const taxonomyId = searchParams.get('id');
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [loading, setLoading] = useState(true);
  const [deleteDisplayFlag, setDeleteDisplayFlag] = useState(true);
  const [newConceptName, setNewConceptName] = useState({ en: '', fr: '' });
  const [conceptData, setConceptData] = useState([]);
  const [standardFields, setStandardFields] = useState([]);
  const [taxonomyData, setTaxonomyData] = useState([]);
  const [formValues, setFormValues] = useState({
    classType: '',
    mapToField: '',
    name: {
      fr: '',
      en: '',
    },
    description: {
      fr: '',
      en: '',
    },
    userAccess: [false],
  });
  //   const [availableStandardFields, setAvailableStandardFields] = useState([]);
  const [addNewPopup, setAddNewPopup] = useState(false);

  const [getTaxonomy] = useLazyGetTaxonomyQuery({
    sessionId: timestampRef,
  });
  const [addTaxonomy] = useAddTaxonomyMutation();
  const [updateTaxonomy] = useUpdateTaxonomyMutation();

  useEffect(() => {
    if (!taxonomyId && currentCalendarData) {
      setLoading(true);
      if (location.state?.selectedClass) {
        const selectedKeys = taxonomyClassTranslations.filter((item) => item.key === location.state?.selectedClass);
        setFormValues({
          ...formValues,
          classType: selectedKeys[0].key,
        });
        const availableStandardFields = standardFieldsForTaxonomy(
          location.state?.selectedClass,
          currentCalendarData?.fieldTaxonomyMaps,
        );
        setStandardFields(availableStandardFields);
      }
      setLoading(false);
    }
    if (location.state?.id) {
      setSearchParams(location.state?.id);
    }
  }, [currentCalendarData]);

  useEffect(() => {
    if (taxonomyId) {
      setLoading(true);
      getTaxonomy({ id: taxonomyId, includeConcepts: true, calendarId })
        .unwrap()
        .then((res) => {
          setConceptData(res.concepts);
          setTaxonomyData(res);
          form.setFieldsValue({
            classType: res?.taxonomyClass,
            frenchname: res?.name?.fr,
            englishname: res?.name?.en,
            frenchdescription: res?.disambiguatingDescription?.fr,
            englishdescription: res?.disambiguatingDescription?.en,
            userAccess: [true],
          });
          setFormValues({
            classType: res?.taxonomyClass,
            name: res?.name,
            description: res?.disambiguatingDescription,
            id: res?.id,
            userAccess: [true],
            mapToField: res?.mappedToField,
          });
          setLoading(false);
        });
    }
  }, [taxonomyId]);

  const openAddNewConceptModal = () => {
    setAddNewPopup(true);
    setDeleteDisplayFlag(false);
  };

  const modifyConceptData = (conceptData) => {
    return conceptData.map((item) => {
      let modifiedConcept;
      if (item && item.isNew) {
        modifiedConcept = {
          name: item.name,
          children: item.children ? modifyConceptData(item.children) : [],
        };
      } else {
        modifiedConcept = {
          id: item.id,
          name: item.name,
          children: item.children ? modifyConceptData(item.children) : [],
        };
      }

      return modifiedConcept;
    });
  };

  const saveTaxonomyHandler = () => {
    const filteredConceptData = modifyConceptData(conceptData);
    form
      .validateFields(['frenchname', 'englishname', 'frenchdescription', 'englishdescription'])
      .then(() => {
        var values = form.getFieldsValue(true);
        setFormValues({
          ...formValues,
          description: {
            french: values?.frenchdescription,
            english: values?.englishdescription,
          },
          name: {
            en: values?.frenchname,
            fr: values?.englishname,
          },
        });
        const body = {
          name: {
            en: values?.frenchname,
            fr: values?.englishname,
          },
          taxonomyClass: formValues.classType,
          isDynamicField: location.state?.dynamic
            ? location.state?.dynamic === 'not-dynamic'
            : taxonomyData?.isDynamicField,
          includeInFullTextSearch: true,
          mappedToField: formValues?.mapToField,
          isAdminOnly: true,
          disambiguatingDescription: {
            en: values?.frenchdescription,
            fr: values?.englishdescription,
          },
          concepts: { concepts: [...filteredConceptData] },
        };

        if (taxonomyId) {
          updateTaxonomy({ calendarId, body, taxonomyId })
            .unwrap()
            .then(() => {
              notification.success({
                description: t('dashboard.taxonomy.addNew.messages.update'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              navigate(-1);
            });
        } else {
          addTaxonomy({ calendarId, body })
            .unwrap()
            .then(() => {
              notification.success({
                description: t('dashboard.taxonomy.addNew.messages.create'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              navigate(-3);
            });
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <>
      {!loading ? (
        <Form layout="vertical" form={form}>
          <Row className="add-taxonomy-wrapper">
            <Col span={24}>
              <Row justify="space-between">
                <Col>
                  <BreadCrumbButton />
                  <div className="add-Taxonomy-heading">
                    <h4>
                      {taxonomyId ? t('dashboard.taxonomy.addNew.editHeading') : t('dashboard.taxonomy.addNew.heading')}
                    </h4>
                  </div>
                </Col>
                <Col>
                  <div className="add-event-button-wrap">
                    <Form.Item>
                      <PrimaryButton
                        label={t('dashboard.taxonomy.addNew.save')}
                        onClick={(e) => saveTaxonomyHandler(e)}
                        // disabled={updateEventLoading || addEventLoading || addImageLoading ? true : false}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col flex="736px">
              <div className="taxonomy-information-card">
                <Card bordered={false}>
                  <div>
                    <Row>
                      <Col flex="423px">
                        <Form.Item
                          label={t('dashboard.taxonomy.addNew.class')}
                          required
                          className={`classType ${taxonomyId != '' ? 'disabled-dropdown' : ''}`}>
                          <Dropdown
                            overlayClassName="add-user-form-field-dropdown-wrapper"
                            getPopupContainer={(trigger) => trigger.parentNode}
                            overlayStyle={{ minWidth: '100%' }}
                            menu={{
                              items: taxonomyClassTranslations,
                              selectable: true,
                              onSelect: ({ selectedKeys }) => {
                                setFormValues({
                                  ...formValues,
                                  classType: selectedKeys[0],
                                  mapToField: '',
                                });
                                const availableStandardFields = standardFieldsForTaxonomy(
                                  selectedKeys[0],
                                  currentCalendarData?.fieldTaxonomyMaps,
                                );
                                setStandardFields(availableStandardFields);
                              },
                            }}
                            disabled={!!taxonomyId}
                            trigger={['click']}>
                            <div>
                              <Typography.Text>
                                {formValues?.classType
                                  ? formValues?.classType
                                  : t('dashboard.taxonomy.selectType.classPlaceHolder')}
                              </Typography.Text>
                              <DownOutlined style={{ fontSize: '16px' }} />
                            </div>
                          </Dropdown>
                          <span className="field-description">{t(`dashboard.taxonomy.addNew.destinationHeading`)}</span>
                        </Form.Item>
                      </Col>
                    </Row>
                    {(location.state?.dynamic === 'dynamic' || (taxonomyId && !taxonomyData?.isDynamicField)) && (
                      <Row>
                        <Col flex="423px">
                          <Form.Item label={t('dashboard.taxonomy.addNew.mapToField')} required className="classType">
                            <Dropdown
                              overlayClassName="add-user-form-field-dropdown-wrapper"
                              getPopupContainer={(trigger) => trigger.parentNode}
                              overlayStyle={{ minWidth: '100%' }}
                              menu={{
                                items: standardFields.map((field) => ({ key: field, label: field })),
                                selectable: true,
                                onSelect: ({ selectedKeys }) => {
                                  setFormValues({
                                    ...formValues,
                                    mapToField: selectedKeys[0],
                                  });
                                },
                              }}
                              disabled={formValues?.classType === '' || standardFields.length === 0}
                              trigger={['click']}>
                              <div>
                                <Typography.Text>
                                  {formValues?.mapToField
                                    ? formValues?.mapToField
                                    : t('dashboard.taxonomy.selectType.classPlaceHolder')}
                                </Typography.Text>
                                <DownOutlined style={{ fontSize: '16px' }} />
                              </div>
                            </Dropdown>
                            <span className="field-description">
                              {t(`dashboard.taxonomy.addNew.mapToFieldDescription`)}
                            </span>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col flex="423px">
                        <Form.Item label={t('dashboard.taxonomy.addNew.name')} required>
                          <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                            <BilingualInput fieldData={formValues?.name}>
                              <Form.Item
                                name="frenchname"
                                key={contentLanguage.FRENCH}
                                initialValue={formValues?.name?.fr}
                                dependencies={['english']}
                                rules={[
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (value || getFieldValue('englishname')) {
                                        return Promise.resolve();
                                      } else
                                        return Promise.reject(
                                          new Error(t('dashboard.taxonomy.addNew.validations.name')),
                                        );
                                    },
                                  }),
                                ]}>
                                <TextArea
                                  autoSize
                                  autoComplete="off"
                                  placeholder={t('dashboard.taxonomy.addNew.frNamePlaceHolder')}
                                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                                  size="large"
                                />
                              </Form.Item>
                              <Form.Item
                                name="englishname"
                                initialValue={formValues?.name?.en}
                                key={contentLanguage.ENGLISH}
                                dependencies={['frenchname']}
                                rules={[
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (value || getFieldValue('frenchname')) {
                                        return Promise.resolve();
                                      } else
                                        return Promise.reject(
                                          new Error(t('dashboard.taxonomy.addNew.validations.name')),
                                        );
                                    },
                                  }),
                                ]}>
                                <TextArea
                                  autoSize
                                  defaultValue={formValues?.name?.en}
                                  autoComplete="off"
                                  placeholder={t('dashboard.taxonomy.addNew.enNamePlaceHolder')}
                                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                                  size="large"
                                />
                              </Form.Item>
                            </BilingualInput>
                          </ContentLanguageInput>
                          <span className="field-description">{t(`dashboard.taxonomy.addNew.nameDescription`)}</span>
                          {/* {location.state?.dynamic === 'dynamic' && (
                            <Form.Item name="useTaxonomyName" valuePropName="checked">
                              <Checkbox className="name-checkbox">
                                {t(`dashboard.taxonomy.addNew.nameCheckbox`)}
                              </Checkbox>
                            </Form.Item>
                          )} */}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col flex="423px">
                        <Form.Item label={t('dashboard.taxonomy.addNew.description')}>
                          <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                            <BilingualInput fieldData={formValues?.description} key="description">
                              <Form.Item
                                name="frenchdescription"
                                key={contentLanguage.FRENCH}
                                dependencies={['englishdescription']}
                                // rules={[
                                //   ({ getFieldValue }) => ({
                                //     validator(_, value) {
                                //       if (value || getFieldValue('englishdescription')) {
                                //         return Promise.resolve();
                                //       } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                                //     },
                                //   }),
                                // ]}
                              >
                                <TextArea
                                  autoSize
                                  autoComplete="off"
                                  defaultValue={formValues?.description?.fr}
                                  value={formValues?.description?.fr}
                                  onChange={(e) => {
                                    setFormValues({
                                      ...formValues,
                                      description: { ...formValues.description, fr: e.target.value },
                                    });
                                  }}
                                  placeholder={t('dashboard.taxonomy.addNew.frDescriptionPlaceHolder')}
                                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                                  size="large"
                                />
                              </Form.Item>
                              <Form.Item
                                name="englishdescription"
                                key={contentLanguage.ENGLISH}
                                dependencies={['frenchdescription']}
                                // rules={[
                                // ({ getFieldValue }) => ({
                                // validator(_, value) {
                                // if (value || getFieldValue('frenchdescription')) {
                                // return Promise.resolve();
                                // } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                                // },
                                // }),
                                // ]}
                              >
                                <TextArea
                                  autoSize
                                  defaultValue={formValues?.description?.en}
                                  autoComplete="off"
                                  value={formValues?.description?.en}
                                  onChange={(e) => {
                                    setFormValues({
                                      ...formValues,
                                      description: { ...formValues.description, en: e.target.value },
                                    });
                                  }}
                                  placeholder={t('dashboard.taxonomy.addNew.enDescriptionPlaceHolder')}
                                  style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                                  size="large"
                                />
                              </Form.Item>
                            </BilingualInput>
                          </ContentLanguageInput>
                          <span className="field-description">
                            {t(`dashboard.taxonomy.addNew.descriptionExplation`)}
                          </span>
                        </Form.Item>
                      </Col>
                    </Row>
                    {(location.state?.dynamic !== 'dynamic' || taxonomyId) && (
                      <Row>
                        <Col flex="423px">
                          <Form.Item
                            label={t('dashboard.taxonomy.addNew.userAccess')}
                            name="userAccess"
                            required
                            className="user-access"
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (value.length > 0 || getFieldValue('userAccess')) {
                                    return Promise.resolve();
                                  } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                                },
                              }),
                            ]}>
                            <SearchableCheckbox
                              disabled={true}
                              onFilterChange={(values) => {
                                setFormValues({ ...formValues, userAccess: values });
                              }}
                              data={[
                                {
                                  key: userRolesWithTranslation[0].key,
                                  label: (
                                    <Checkbox
                                      key={userRolesWithTranslation[0].key}
                                      style={{ marginLeft: '8px' }}
                                      value={userRolesWithTranslation[0].key}>
                                      {userRolesWithTranslation[0].label}
                                    </Checkbox>
                                  ),
                                  filtervalue: userRolesWithTranslation[0].key,
                                },
                              ]}
                              overlayStyle={{ minWidth: '100%' }}
                              value={formValues.userAccess}>
                              {userRolesWithTranslation[0].label}
                              <DownOutlined style={{ fontSize: '16px' }} />
                            </SearchableCheckbox>
                            <div className="field-description" style={{ marginTop: 8 }}>
                              {t(`dashboard.taxonomy.addNew.userAccessDescription`)}
                            </div>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </div>
                </Card>
              </div>
            </Col>
            <Col flex="736px" style={{ marginTop: '32px' }} className="concept-card">
              <Card bordered={false}>
                <Row justify="space-between">
                  <Col flex="423px">
                    <Row gutter={[24, 24]}>
                      <Col className="heading-concepts">{t('dashboard.taxonomy.addNew.concepts.heading')}</Col>
                      <Col className="text-concepts">{t('dashboard.taxonomy.addNew.concepts.description')}</Col>
                      <Col
                        flex="423px"
                        style={{
                          display: 'flex',
                          paddingTop: '0',
                          paddingRight: '12px',
                          paddingBottom: '0',
                          paddingLeft: '12px',
                        }}>
                        <DraggableTree
                          data={conceptData}
                          form={form}
                          setData={setConceptData}
                          addNewPopup={addNewPopup}
                          setAddNewPopup={setAddNewPopup}
                          newConceptName={newConceptName}
                          setNewConceptName={setNewConceptName}
                          deleteDisplayFlag={deleteDisplayFlag}
                          setDeleteDisplayFlag={setDeleteDisplayFlag}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <Outlined
                      label={t('dashboard.taxonomy.addNew.concepts.item')}
                      onClick={openAddNewConceptModal}
                      style={{
                        paddingTop: '8px',
                        paddingRight: '16px',
                        paddingBottom: '8px',
                        paddingLeft: '8px',
                        height: '40px',
                      }}>
                      <PlusOutlined style={{ fontSize: '24px' }} />
                    </Outlined>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      ) : (
        <div style={{ display: 'grid', placeContent: 'center', height: '500px', width: '100%' }}>
          <LoadingIndicator />
        </div>
      )}
    </>
  );
};

export default AddTaxonomy;
