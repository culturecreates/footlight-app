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
import { userRoles, userRolesWithTranslation } from '../../../constants/userRoles';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';
import DraggableTree from '../../../components/DraggableTree/DraggableTree';
import { useAddTaxonomyMutation, useLazyGetTaxonomyQuery, useUpdateTaxonomyMutation } from '../../../services/taxonomy';
import { getStandardFieldArrayForClass, standardFieldsForTaxonomy } from '../../../utils/standardFields';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { setErrorStates } from '../../../redux/reducer/ErrorSlice';

const AddTaxonomy = () => {
  const { TextArea } = Input;
  const [form] = Form.useForm();

  const { calendarId } = useParams();
  const location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  const taxonomyId = searchParams.get('id');
  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const [currentCalendarData, , , getCalendar] = useOutletContext();
  const timestampRef = useRef(Date.now()).current;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const calendar = user?.roles.filter((calendar) => {
    return calendar.calendarId === calendarId;
  });
  const adminCheckHandler = () => {
    if (calendar[0]?.role === userRoles.ADMIN || user?.isSuperAdmin) return true;
    else return false;
  };

  const [loading, setLoading] = useState(true);
  const [render, setRender] = useState(true);
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
    userAccess: [],
  });
  //   const [availableStandardFields, setAvailableStandardFields] = useState([]);
  const [addNewPopup, setAddNewPopup] = useState(false);

  const [getTaxonomy] = useLazyGetTaxonomyQuery({
    sessionId: timestampRef,
  });
  const [addTaxonomy] = useAddTaxonomyMutation();
  const [updateTaxonomy] = useUpdateTaxonomyMutation();

  useEffect(() => {
    if (!adminCheckHandler) {
      dispatch(setErrorStates({ errorCode: '403', isError: true, message: 'Not Authorized' }));
    }
  }, []);

  useEffect(() => {
    if (!taxonomyId && currentCalendarData) {
      setLoading(true);
      if (location.state?.selectedClass) {
        const selectedKeys = taxonomyClassTranslations.filter((item) => item.key === location.state?.selectedClass);
        setFormValues({
          ...formValues,
          classType: selectedKeys[0]?.key,
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
    if (taxonomyId && currentCalendarData) {
      setLoading(true);
      getTaxonomy({ id: taxonomyId, includeConcepts: true, calendarId })
        .unwrap()
        .then((res) => {
          setConceptData(res.concepts);
          setTaxonomyData(res);
          const availableStandardFields = standardFieldsForTaxonomy(
            res?.taxonomyClass,
            currentCalendarData?.fieldTaxonomyMaps,
          );
          setStandardFields([
            ...availableStandardFields,
            getStandardFieldArrayForClass(res?.taxonomyClass).find((i) => i.key == res?.mappedToField),
          ]);
          form.setFieldsValue({
            classType: res?.taxonomyClass,
            frenchname: res?.name?.fr,
            englishname: res?.name?.en,
            frenchdescription: res?.disambiguatingDescription?.fr,
            englishdescription: res?.disambiguatingDescription?.en,
            userAccess: res?.isAdminOnly ? [t(`dashboard.taxonomy.addNew.adminOnly`)] : [],
          });

          setFormValues({
            classType: res?.taxonomyClass,
            name: res?.name,
            description: res?.disambiguatingDescription,
            id: res?.id,
            userAccess: res?.isAdminOnly ? [t(`dashboard.taxonomy.addNew.adminOnly`)] : [],
            mapToField: res?.mappedToField,
          });
          setLoading(false);
        });
    }
  }, [taxonomyId, currentCalendarData]);

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
            french: values?.frenchdescription?.trim(),
            english: values?.englishdescription?.trim(),
          },
        });
        const body = {
          name: {
            en: values?.englishname?.trim(),
            fr: values?.frenchname?.trim(),
          },
          taxonomyClass: formValues.classType,
          isDynamicField: location.state?.dynamic
            ? location.state?.dynamic === 'not-dynamic'
            : taxonomyData?.isDynamicField,
          includeInFullTextSearch: true,
          mappedToField: formValues?.mapToField,
          isAdminOnly: formValues.userAccess.length > 0,
          disambiguatingDescription: {
            en: values?.frenchdescription?.trim(),
            fr: values?.englishdescription?.trim(),
          },
          concepts: { concepts: [...filteredConceptData] },
        };

        if (taxonomyId) {
          updateTaxonomy({ calendarId, body, taxonomyId })
            .unwrap()
            .then((res) => {
              if (res.statusCode == 202) {
                getCalendar({ id: calendarId, sessionId: timestampRef });
                notification.success({
                  description: t('dashboard.taxonomy.addNew.messages.update'),
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
                navigate(-1);
              }
            });
        } else {
          addTaxonomy({ calendarId, body })
            .unwrap()
            .then((res) => {
              if (res.statusCode == 202) {
                getCalendar({ id: calendarId, sessionId: timestampRef });
                notification.success({
                  description: t('dashboard.taxonomy.addNew.messages.create'),
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
                navigate(-3);
              }
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
                    <h4 data-cy="heading-add-edit-taxonomy">
                      {taxonomyId ? t('dashboard.taxonomy.addNew.editHeading') : t('dashboard.taxonomy.addNew.heading')}
                    </h4>
                  </div>
                </Col>
                <Col>
                  <div className="add-event-button-wrap">
                    <Form.Item>
                      <PrimaryButton
                        data-cy="button-taxonomy-save"
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
                          data-cy="form-item-taxonomy-class"
                          label={t('dashboard.taxonomy.addNew.class')}
                          required
                          className={`classType ${taxonomyId != '' ? 'disabled-dropdown' : ''}`}>
                          <Dropdown
                            data-cy="dropdown-taxonomy-class"
                            overlayClassName="add-user-form-field-dropdown-wrapper"
                            getPopupContainer={(trigger) => trigger.parentNode}
                            overlayStyle={{ minWidth: '100%' }}
                            menu={{
                              items: taxonomyClassTranslations,
                              selectable: true,
                              onSelect: ({ selectedKeys }) => {
                                const classKey = taxonomyClassTranslations.find((item) => {
                                  return item.key === selectedKeys[0];
                                });
                                setFormValues({
                                  ...formValues,
                                  classType: classKey?.key,
                                  mapToField: '',
                                });
                                const availableStandardFields = standardFieldsForTaxonomy(
                                  selectedKeys[0],
                                  currentCalendarData?.fieldTaxonomyMaps,
                                );
                                setStandardFields([
                                  ...availableStandardFields,
                                  getStandardFieldArrayForClass(classKey?.key).find(
                                    (i) => i.key == formValues?.mapToField,
                                  ),
                                ]);
                              },
                            }}
                            disabled={!!taxonomyId}
                            trigger={['click']}>
                            <div>
                              <Typography.Text data-cy="typography-taxonomy-class-placeholder">
                                {formValues?.classType
                                  ? formValues?.classType
                                  : t('dashboard.taxonomy.selectType.classPlaceHolder')}
                              </Typography.Text>
                              <DownOutlined style={{ fontSize: '16px' }} />
                            </div>
                          </Dropdown>
                          <span className="field-description" data-cy="span-taxonomy-class-helper-text">
                            {t(`dashboard.taxonomy.addNew.destinationHeading`)}
                          </span>
                        </Form.Item>
                      </Col>
                    </Row>
                    {(location.state?.dynamic === 'dynamic' || (taxonomyId && !taxonomyData?.isDynamicField)) && (
                      <Row>
                        <Col flex="423px">
                          <Form.Item
                            label={t('dashboard.taxonomy.addNew.mapToField')}
                            required
                            className="classType"
                            data-cy="form-item-taxonomy-mapped-field-title">
                            <Dropdown
                              data-cy="dropdown-taxonomy-mapped-field"
                              overlayClassName="add-user-form-field-dropdown-wrapper"
                              getPopupContainer={(trigger) => trigger.parentNode}
                              overlayStyle={{ minWidth: '100%' }}
                              menu={{
                                items: standardFields.filter((s) => s != undefined),
                                selectable: true,
                                onSelect: ({ selectedKeys }) => {
                                  const item = getStandardFieldArrayForClass(formValues?.classType).find(
                                    (i) => i.key == selectedKeys[0],
                                  );
                                  const name = {
                                    en: item?.en,
                                    fr: item?.fr,
                                  };
                                  form.setFieldValue('frenchname', item?.fr);
                                  form.setFieldValue('englishname', item?.en);
                                  setFormValues({
                                    ...formValues,
                                    mapToField: selectedKeys[0],
                                    name,
                                  });
                                  setRender(!render);
                                },
                              }}
                              disabled={
                                formValues?.classType === '' ||
                                standardFields.filter((s) => s != undefined).length === 0
                              }
                              trigger={['click']}>
                              <div>
                                <Typography.Text data-cy="typography-taxonomy-mapped-field-placeholder">
                                  {formValues?.mapToField
                                    ? getStandardFieldArrayForClass(formValues?.classType).find(
                                        (i) => i.key == formValues?.mapToField,
                                      )?.label
                                    : t('dashboard.taxonomy.selectType.classPlaceHolder')}
                                </Typography.Text>
                                <DownOutlined style={{ fontSize: '16px' }} />
                              </div>
                            </Dropdown>
                            <span className="field-description" data-cy="span-taxonomy-mapped-field-helper-text">
                              {t(`dashboard.taxonomy.addNew.mapToFieldDescription`)}
                            </span>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col flex="423px">
                        <Form.Item
                          label={t('dashboard.taxonomy.addNew.name')}
                          required
                          data-cy="form-item-taxonomy-name">
                          <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                            <BilingualInput fieldData={formValues?.name}>
                              <Form.Item
                                name="frenchname"
                                key={contentLanguage.FRENCH}
                                // initialValue={formValues?.name?.fr}
                                dependencies={['englishname']}
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
                                  data-cy="input-text-area-taxonomy-name-french"
                                  autoSize
                                  autoComplete="off"
                                  placeholder={t('dashboard.taxonomy.addNew.frNamePlaceHolder')}
                                  key={render}
                                  defaultValue={formValues?.name?.fr}
                                  value={formValues.name.fr}
                                  onChange={(e) => {
                                    setFormValues({
                                      ...formValues,
                                      name: { ...formValues.name, fr: e.target.value },
                                    });
                                  }}
                                  style={{
                                    borderRadius: '4px',
                                    border: `${
                                      calendarContentLanguage === contentLanguage.BILINGUAL
                                        ? '4px solid #E8E8E8'
                                        : '1px solid #b6c1c9'
                                    }`,
                                    width: '423px',
                                  }}
                                  size="large"
                                />
                              </Form.Item>
                              <Form.Item
                                name="englishname"
                                // initialValue={formValues?.name?.en}
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
                                  data-cy="input-text-area-taxonomy-english"
                                  autoSize
                                  defaultValue={formValues?.name?.en}
                                  autoComplete="off"
                                  key={render}
                                  value={formValues.name.en}
                                  placeholder={t('dashboard.taxonomy.addNew.enNamePlaceHolder')}
                                  onChange={(e) => {
                                    setFormValues({
                                      ...formValues,
                                      name: { ...formValues.name, en: e.target.value },
                                    });
                                  }}
                                  style={{
                                    borderRadius: '4px',
                                    border: `${
                                      calendarContentLanguage === contentLanguage.BILINGUAL
                                        ? '4px solid #E8E8E8'
                                        : '1px solid #b6c1c9'
                                    }`,
                                    width: '423px',
                                  }}
                                  size="large"
                                />
                              </Form.Item>
                            </BilingualInput>
                          </ContentLanguageInput>
                          <span className="field-description" data-cy="span-taxonomy-name-helper-text">
                            {t(`dashboard.taxonomy.addNew.nameDescription`)}
                          </span>
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
                        <Form.Item
                          label={t('dashboard.taxonomy.addNew.description')}
                          data-cy="form-item-taxonomy-description-title">
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
                                  data-cy="input-text-area-taxonomy-description-french"
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
                                  style={{
                                    borderRadius: '4px',
                                    border: `${
                                      calendarContentLanguage === contentLanguage.BILINGUAL
                                        ? '4px solid #E8E8E8'
                                        : '1px solid #b6c1c9'
                                    }`,
                                    width: '423px',
                                  }}
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
                                  data-cy="input-text-area-taxonomy-description-english"
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
                                  style={{
                                    borderRadius: '4px',
                                    border: `${
                                      calendarContentLanguage === contentLanguage.BILINGUAL
                                        ? '4px solid #E8E8E8'
                                        : '1px solid #b6c1c9'
                                    }`,
                                    width: '423px',
                                  }}
                                  size="large"
                                />
                              </Form.Item>
                            </BilingualInput>
                          </ContentLanguageInput>
                          <span className="field-description" data-cy="span-taxonomy-description-helper-text">
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
                            className="user-access"
                            data-cy="form-item-user-access-title"
                            // rules={[
                            // ({ getFieldValue }) => ({
                            // validator(_, value) {
                            // if (value.length > 0 || getFieldValue('userAccess')) {
                            // return Promise.resolve();
                            // } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                            // },
                            // }),
                            // ]}
                          >
                            <SearchableCheckbox
                              data-cy="searchable-checkbox-user-roles"
                              // disabled={true}
                              onFilterChange={(values) => {
                                setFormValues({ ...formValues, userAccess: values });
                              }}
                              data={[
                                {
                                  key: userRolesWithTranslation[0].key,
                                  label: (
                                    <Checkbox
                                      data-cy="checkbox-user-roles"
                                      key={userRolesWithTranslation[0].key}
                                      style={{ marginLeft: '8px' }}
                                      value={t(`dashboard.taxonomy.addNew.adminOnly`)}>
                                      {t(`dashboard.taxonomy.addNew.adminOnly`)}
                                    </Checkbox>
                                  ),
                                  filtervalue: userRolesWithTranslation[0].key,
                                },
                              ]}
                              overlayStyle={{ minWidth: '100%' }}
                              value={formValues.userAccess}>
                              {formValues.userAccess?.length > 0
                                ? t(`dashboard.taxonomy.addNew.adminOnly`)
                                : t(`dashboard.taxonomy.addNew.userAccessPlaceHolder`)}
                              <DownOutlined style={{ fontSize: '16px' }} />
                            </SearchableCheckbox>
                            <div
                              className="field-description"
                              style={{ marginTop: 8 }}
                              data-cy="div-user-access-helper-text">
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
                <Row justify="space-between" wrap={false}>
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
                      data-cy="button-taxonomy-add-item"
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
