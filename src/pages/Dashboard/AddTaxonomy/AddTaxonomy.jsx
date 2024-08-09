import React, { useEffect, useRef, useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getStandardFieldTranslation, standardFieldsForTaxonomy } from '../../../utils/standardFields';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { taxonomyClassTranslations } from '../../../constants/taxonomyClass';
import { Card, Checkbox, Col, Form, Input, Row, notification } from 'antd';
import BreadCrumbButton from '../../../components/Button/BreadCrumb/BreadCrumbButton';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../../components/Button/Primary';
import './addTaxonomy.css';
import { useAddTaxonomyMutation, useLazyGetTaxonomyQuery, useUpdateTaxonomyMutation } from '../../../services/taxonomy';
import Select from '../../../components/Select';
import CardEvent from '../../../components/Card/Common/Event';
import SearchableCheckbox from '../../../components/Filter/SearchableCheckbox';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { userRolesWithTranslation } from '../../../constants/userRoles';
import Outlined from '../../../components/Button/Outlined';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { setErrorStates } from '../../../redux/reducer/ErrorSlice';
import { RouteLeavingGuard } from '../../../hooks/usePrompt';
import { compareArraysOfObjects } from '../../../utils/genericObjectCompare';
import { PathName } from '../../../constants/pathName';
import StyledSwitch from '../../../components/Switch/StyledSwitch';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { getCurrentCalendarDetailsFromUserDetails } from '../../../utils/getCurrentCalendarDetailsFromUserDetails';
import { placeHolderCollectionCreator } from '../../../utils/MultiLingualFormItemSupportFunctions';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems/CreateMultiLingualFormItems';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import DraggableTreeTest from '../../../components/DraggableTree/DraggableTree';

const taxonomyClasses = taxonomyClassTranslations.map((item) => {
  return { ...item, value: item.key };
});
const { TextArea } = Input;

const AddTaxonomyTest = () => {
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    getCalendar,
    setContentBackgroundColor,
    isReadOnly,
  ] = useOutletContext();
  let [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;
  const { calendarId } = useParams();
  const { user } = useSelector(getUserDetails);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const calendar = getCurrentCalendarDetailsFromUserDetails(user, calendarId);

  const taxonomyId = searchParams.get('id');
  setContentBackgroundColor('#F9FAFF');

  const [standardFields, setStandardFields] = useState([]);
  const [dynamic, setDynamic] = useState(location.state?.dynamic ?? false);
  const [userAccess, setUserAccess] = useState();
  const [deleteDisplayFlag, setDeleteDisplayFlag] = useState(true);
  const [newConceptName, setNewConceptName] = useState();
  const [conceptData, setConceptData] = useState([]);
  const [addNewPopup, setAddNewPopup] = useState(false);
  const [isDirty, setIsDirty] = useState({
    formState: false,
    isSubmitting: false,
  });

  const [getTaxonomy, { data: taxonomyData, isSuccess: isSuccess, isFetching: loading }] = useLazyGetTaxonomyQuery({
    sessionId: timestampRef,
  });
  const [addTaxonomy] = useAddTaxonomyMutation();
  const [updateTaxonomy] = useUpdateTaxonomyMutation();

  const { taxonomyClass } = taxonomyData || {};
  const selectedClass = location.state?.selectedClass;

  useEffect(() => {
    if (taxonomyId && currentCalendarData) {
      getTaxonomy({ id: taxonomyId, includeConcepts: true, calendarId })
        .unwrap()
        .then((res) => {
          const availableStandardFields = standardFieldsForTaxonomy(
            res?.taxonomyClass,
            currentCalendarData?.fieldTaxonomyMaps,
          );
          setConceptData(res.concepts);
          setUserAccess(res?.isAdminOnly && [userRolesWithTranslation[0].key]);
          setStandardFields([
            ...availableStandardFields,
            getStandardFieldTranslation({ value: res?.mappedToField, classType: res?.taxonomyClass }),
          ]);
          setDynamic(res?.isDynamicField ?? false);
        });
    }
  }, [taxonomyId, currentCalendarData]);

  useEffect(() => {
    if (user && calendar.length > 0) {
      !adminCheckHandler({ calendar, user }) &&
        dispatch(setErrorStates({ errorCode: '403', isError: true, message: 'Not Authorized' }));
    }
  }, [user, calendar]);

  useEffect(() => {
    // setting class initial value

    const value = taxonomyId ? taxonomyClass : selectedClass;
    let initialTaxonomyValue;

    if (!value) {
      initialTaxonomyValue = taxonomyClasses[0];
      form.setFieldValue('class', taxonomyClasses[0]);
    } else {
      initialTaxonomyValue = taxonomyClasses.find((c) => c.key === value) || {};
      form.setFieldValue('class', initialTaxonomyValue);
    }

    // setting standardFields initial value
    taxonomyData?.mappedToField &&
      initialTaxonomyValue &&
      form.setFieldValue(
        'mappedToField',
        getStandardFieldTranslation({ value: taxonomyData?.mappedToField, classType: initialTaxonomyValue.key }),
      );
  }, [taxonomyData]);

  useEffect(() => {
    // setup for new taxonomy
    if (!taxonomyId && currentCalendarData) {
      if (location.state?.selectedClass) {
        const availableStandardFields = standardFieldsForTaxonomy(
          location.state?.selectedClass ?? taxonomyClasses[0].key,
          currentCalendarData?.fieldTaxonomyMaps,
        );
        setStandardFields(availableStandardFields);
      }
    }
    if (location.state?.id) {
      setSearchParams(location.state?.id);
    }
  }, [currentCalendarData]);

  useEffect(() => {
    if (!calendarContentLanguage) return;

    setEmptyConceptName();
  }, [calendarContentLanguage]);

  const setEmptyConceptName = () => {
    const initialConceptName = {};
    calendarContentLanguage.forEach((language) => {
      initialConceptName[contentLanguageKeyMap[language]] = '';
    });
    setNewConceptName(initialConceptName, calendarContentLanguage);
  };

  const saveTaxonomyHandler = (e) => {
    e.preventDefault();
    const filteredConceptData = modifyConceptData(conceptData);
    setIsDirty({
      formState: false,
      isSubmitting: true,
    });
    form
      .validateFields(['name', 'disambiguatingDescription'])
      .then(() => {
        var values = form.getFieldsValue(true);

        const body = {
          name: values?.name,
          taxonomyClass: values?.class?.value,
          isDynamicField: dynamic ?? false,
          includeInFullTextSearch: true,
          ...(dynamic == false && {
            mappedToField: values?.mappedToField?.key ?? values?.mappedToField,
          }),
          isAdminOnly: userAccess?.length > 0,
          disambiguatingDescription: values?.disambiguatingDescription,
          concepts: { concepts: [...filteredConceptData] },
          addToFilter: values?.addToFilter,
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
                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}`, { replace: true });
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

                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}`, { replace: true });
              }
            });
        }
      })
      .catch((error) => {
        console.error(error);
        setIsDirty({
          formState: form.isFieldsTouched([
            'userAccess',
            'disambiguatingDescription',
            'name',
            'mappedToField',
            'class',
          ]),
          isSubmitting: false,
        });
      });
  };

  const handleSelectChange = (selectedKeys, option) => {
    Object.keys(option).forEach((key) => {
      if (key != 'value' && key != 'key' && key != 'label') {
        form.setFieldValue(['name', key], option[key]);
      }
    });
  };

  function modifyConceptData(conceptData) {
    return conceptData?.map(function (item) {
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
  }

  const openAddNewConceptModal = () => {
    setAddNewPopup(true);
    setDeleteDisplayFlag(false);
  };

  const handleValueChange = () => {
    setIsDirty({
      formState: form.isFieldsTouched(['userAccess', 'disambiguatingDescription', 'name', 'mappedToField', 'class']),
      isSubmitting: false,
    });
  };

  useEffect(() => {
    if (isReadOnly) navigate(`${PathName.Dashboard}/${calendarId}${PathName.Taxonomies}`, { replace: true });
  }, [isReadOnly]);

  return (
    <>
      <RouteLeavingGuard
        isBlocking={
          isDirty.formState ||
          (!isDirty.isSubmitting ? !compareArraysOfObjects(conceptData ?? [], taxonomyData?.concepts ?? []) : false)
        }
      />

      {!loading && (isSuccess || !taxonomyId) ? (
        <Form layout="vertical" form={form} onValuesChange={handleValueChange}>
          <Row className="add-taxonomy-wrapper" gutter={[16, 16]}>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col>
                      <BreadCrumbButton />
                    </Col>
                    <Col>
                      <div className="add-event-button-wrap">
                        <Form.Item>
                          <PrimaryButton
                            data-cy="button-taxonomy-save"
                            label={t('dashboard.taxonomy.addNew.save')}
                            onClick={(e) => saveTaxonomyHandler(e)}
                          />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <Row>
                    <div className="add-Taxonomy-heading">
                      <h4 data-cy="heading-add-edit-taxonomy">
                        {taxonomyId
                          ? t('dashboard.taxonomy.addNew.editHeading')
                          : t('dashboard.taxonomy.addNew.heading')}
                      </h4>
                    </div>
                  </Row>
                </Col>
              </Row>
            </Col>
            <CardEvent marginResponsive="0px">
              <>
                <Row>
                  <Col flex={'423px'}>
                    <Form.Item
                      data-cy="form-item-taxonomy-class"
                      label={t('dashboard.taxonomy.addNew.class')}
                      name="class"
                      required
                      className={`classType disabled-dropdown`}>
                      <Select data-cy="dropdown-taxonomy-class" options={taxonomyClasses} disabled />
                    </Form.Item>
                    <span className="field-description" data-cy="span-taxonomy-class-helper-text">
                      {t(`dashboard.taxonomy.addNew.destinationHeading`)}
                    </span>
                  </Col>
                </Row>
                {(dynamic == false || (taxonomyId && !taxonomyData?.isDynamicField)) && (
                  <Row>
                    <Col flex={'423px'}>
                      <Form.Item
                        label={t('dashboard.taxonomy.addNew.mapToField')}
                        required
                        className="mapToField"
                        name="mappedToField"
                        data-cy="form-item-taxonomy-mapped-field-title">
                        <Select
                          data-cy="dropdown-taxonomy-mapped-field"
                          options={standardFields.filter((s) => s !== undefined)}
                          onSelect={handleSelectChange}
                          disabled={
                            form.getFieldValue('class') === '' ||
                            standardFields.filter((s) => s !== undefined).length === 0
                          }
                          trigger={['click']}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Row>
                  <Col flex="423px">
                    <Form.Item label={t('dashboard.taxonomy.addNew.name')} required data-cy="form-item-taxonomy-name">
                      <CreateMultiLingualFormItems
                        calendarContentLanguage={calendarContentLanguage}
                        form={form}
                        name="name"
                        data={taxonomyData?.name}
                        required={true}
                        validations={t('dashboard.taxonomy.addNew.validations.name')}
                        dataCy="input-text-area-taxonomy-name-"
                        placeholder={placeHolderCollectionCreator({
                          calendarContentLanguage,
                          placeholderBase: 'dashboard.taxonomy.addNew.placeHolder.',
                          t,
                          postfixFillerText: 'NamePlaceHolder',
                        })}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          style={{
                            borderRadius: '4px',
                            border: `${
                              calendarContentLanguage?.length > 1 ? '4px solid #E8E8E8' : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                          }}
                          size="large"
                        />
                      </CreateMultiLingualFormItems>

                      <span className="field-description" data-cy="span-taxonomy-name-helper-text">
                        {t(`dashboard.taxonomy.addNew.nameDescription`)}
                      </span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col flex="423px">
                    <Form.Item
                      label={t('dashboard.taxonomy.addNew.description')}
                      data-cy="form-item-taxonomy-description-title">
                      <CreateMultiLingualFormItems
                        calendarContentLanguage={calendarContentLanguage}
                        form={form}
                        name="disambiguatingDescription"
                        data={taxonomyData?.disambiguatingDescription}
                        dataCy="input-text-area-taxonomy-description-"
                        placeholder={placeHolderCollectionCreator({
                          calendarContentLanguage,
                          placeholderBase: 'dashboard.taxonomy.addNew.placeHolder.',
                          t,
                          postfixFillerText: 'DescriptionPlaceHolder',
                        })}>
                        <TextArea
                          autoSize
                          autoComplete="off"
                          style={{
                            borderRadius: '4px',
                            border: `${
                              calendarContentLanguage?.length > 1 ? '4px solid #E8E8E8' : '1px solid #b6c1c9'
                            }`,
                            width: '423px',
                          }}
                          size="large"
                        />
                      </CreateMultiLingualFormItems>

                      <span className="field-description" data-cy="span-taxonomy-description-helper-text">
                        {t(`dashboard.taxonomy.addNew.descriptionExplation`)}
                      </span>
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col flex="423px">
                    <div className="userAccess-label">{t('dashboard.taxonomy.addNew.userAccess')}</div>
                    <div name="userAccess" className="user-access" data-cy="form-item-user-access-title">
                      <SearchableCheckbox
                        data-cy="searchable-checkbox-user-roles"
                        value={userAccess}
                        onFilterChange={(values) => {
                          form.setFieldValue('userAccess', values);
                          setUserAccess(values);
                        }}
                        data={[userRolesWithTranslation[0]]?.map((role) => {
                          return {
                            key: role.key,
                            label: (
                              <Checkbox value={role.value} key={role.key} style={{ marginLeft: '8px' }}>
                                {t(`dashboard.taxonomy.addNew.adminOnly`)}
                              </Checkbox>
                            ),
                            filtervalue: role.key,
                          };
                        })}>
                        {userAccess?.length > 0
                          ? t(`dashboard.taxonomy.addNew.adminOnly`)
                          : t(`dashboard.taxonomy.addNew.userAccessPlaceHolder`)}
                        <DownOutlined style={{ fontSize: '16px' }} />
                      </SearchableCheckbox>
                    </div>
                    <div className="field-description" style={{ marginTop: 8 }} data-cy="div-user-access-helper-text">
                      {t(`dashboard.taxonomy.addNew.userAccessDescription`)}
                    </div>
                  </Col>
                </Row>

                <Row justify={'start'} align={'top'} gutter={[8, 0]}>
                  <Col>
                    <Form.Item valuePropName="checked" name="addToFilter" initialValue={taxonomyData?.addToFilter}>
                      <StyledSwitch />
                    </Form.Item>
                  </Col>
                  <Col>
                    <span
                      style={{ color: '#222732', minHeight: '32px', display: 'flex', alignItems: 'center' }}
                      data-cy="span-add-to-filter-taxonomy-text">
                      {t('dashboard.taxonomy.addNew.addAsFilter')}
                    </span>
                  </Col>
                </Row>
              </>
              <></>
            </CardEvent>
            <Col span={24}>
              <Row>
                <Col flex="780px" style={{ margin: '32px 0px' }} className="concept-card">
                  <Card bordered={false}>
                    <Row justify="space-between" wrap={false}>
                      <Col>
                        <Row>
                          <Col>
                            <Row gutter={[8, 8]} justify="space-between">
                              <Col className="heading-concepts">{t('dashboard.taxonomy.addNew.concepts.heading')}</Col>
                              <Col>
                                <Outlined
                                  data-cy="button-taxonomy-add-item"
                                  label={t('dashboard.taxonomy.addNew.concepts.item')}
                                  onClick={openAddNewConceptModal}>
                                  <PlusOutlined style={{ fontSize: '24px' }} />
                                </Outlined>
                              </Col>
                            </Row>
                            <Row>
                              <Col flex="423px" className="text-concepts">
                                {t('dashboard.taxonomy.addNew.concepts.description')}
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row>
                          <Col
                            span={24}
                            style={{
                              display: 'flex',
                              marginTop: '16px',
                              width: 'calc(100% - 100px)',
                            }}>
                            <Row style={{ flex: 1 }}>
                              <DraggableTreeTest
                                data={conceptData}
                                form={form}
                                setEmptyConceptName={setEmptyConceptName}
                                setData={setConceptData}
                                addNewPopup={addNewPopup}
                                setAddNewPopup={setAddNewPopup}
                                newConceptName={newConceptName}
                                setNewConceptName={setNewConceptName}
                                deleteDisplayFlag={deleteDisplayFlag}
                                setDeleteDisplayFlag={setDeleteDisplayFlag}
                              />
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
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

export default AddTaxonomyTest;
