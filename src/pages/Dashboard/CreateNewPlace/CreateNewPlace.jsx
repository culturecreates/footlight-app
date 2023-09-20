import React, { useRef, useEffect, useState } from 'react';
import './createNewPlace.css';
import '../AddEvent/addEvent.css';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import { Button, Col, Form, Input, Row } from 'antd';
import { LeftOutlined, CloseCircleOutlined } from '@ant-design/icons';
import PrimaryButton from '../../../components/Button/Primary';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { PathName } from '../../../constants/pathName';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import { useTranslation } from 'react-i18next';
import { loadArtsDataEntity } from '../../../services/artsData';
import { useGetPlaceQuery } from '../../../services/places';
import { useSelector } from 'react-redux';
import { routinghandler } from '../../../utils/roleRoutingHandler';
import ContentLanguageInput from '../../../components/ContentLanguageInput';
import Card from '../../../components/Card/Common/Event';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../../components/BilingualInput';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import { placeTaxonomyMappedFieldTypes } from '../../../constants/placeMappedFieldTypes';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import TreeSelectOption from '../../../components/TreeSelectOption';
import NoContent from '../../../components/NoContent/NoContent';
import { treeTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import Tags from '../../../components/Tags/Common/Tags';
import StyledInput from '../../../components/Input/Common';

const { TextArea } = Input;

function CreateNewPlace() {
  const timestampRef = useRef(Date.now()).current;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentCalendarData] = useOutletContext();
  const { user } = useSelector(getUserDetails);
  const { calendarId } = useParams();
  let [searchParams] = useSearchParams();

  const formFieldNames = {
    NAME: 'name',
    ENGLISH: 'english',
    FRENCH: 'french',
    TYPE: 'type',
    STREET_ADDRESS_ENGLISH: 'englishStreetAddress',
    STREET_ADDRESS_FRENCH: 'frenchStreetAddress',
    CITY_FRENCH: 'frenchCity',
    CITY_ENGLISH: 'englishCity',
    POSTAL_CODE: 'postalCode',
    PROVINCE_ENGLISH: 'englishProvince',
    PROVINCE_FRENCH: 'frenchProvince',
    COUNTRY_ENGLISH: 'englishCountry',
    COUNTRY_FRENCH: 'frenchConutry',
    COORDINATES: 'coordinates',
  };
  const placeId = searchParams.get('id');
  const artsDataId = location?.state?.data?.id ?? null;
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { currentData: placeData, isPlaceLoading } = useGetPlaceQuery(
    { placeId: placeId, calendarId, sessionId: timestampRef },
    { skip: placeId ? false : true },
  );
  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PLACE,
    includeConcepts: true,
    sessionId: timestampRef,
  });

  const [artsData, setArtsData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  // const [addedFields, setAddedFields] = useState([]);
  // const [scrollToSelectedField, setScrollToSelectedField] = useState();

  // const placesSearch = (inputValue = '') => {
  //   let query = new URLSearchParams();
  //   query.append('classes', entitiesClass.place);
  //   getEntities({ searchKey: inputValue, classes: decodeURIComponent(query.toString()), calendarId })
  //     .unwrap()
  //     .then((response) => {
  //       setAllPlacesList(placesOptions(response, user, calendarContentLanguage));
  //     })
  //     .catch((error) => console.log(error));
  // };

  // const addFieldsHandler = (fieldNames) => {
  //   let array = addedFields?.concat(fieldNames);
  //   array = [...new Set(array)];
  //   setAddedFields(array);
  //   setScrollToSelectedField(array?.at(-1));
  // };

  // useEffect(() => {
  //   if (addedFields?.length > 0) {
  //     const element = document.getElementsByClassName(scrollToSelectedField);
  //     element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  //   }
  // }, [addedFields]);

  console.log(artsData);

  useEffect(() => {
    if (calendarId && placeData && currentCalendarData) {
      if (routinghandler(user, calendarId, placeData?.createdByUserId, null, true)) {
        if (placeData?.image) {
          form.setFieldsValue({
            imageCrop: {
              large: {
                x: placeData?.image?.large?.xCoordinate,
                y: placeData?.image?.large?.yCoordinate,
                height: placeData?.image?.large?.height,
                width: placeData?.image?.large?.width,
              },
              original: {
                entityId: placeData?.image?.original?.entityId ?? null,
                height: placeData?.image?.original?.height,
                width: placeData?.image?.original?.width,
              },
              thumbnail: {
                x: placeData?.image?.thumbnail?.xCoordinate,
                y: placeData?.image?.thumbnail?.yCoordinate,
                height: placeData?.image?.thumbnail?.height,
                width: placeData?.image?.thumbnail?.width,
              },
            },
          });
        }
        // let placeKeys = Object.keys(placeData);
        // if (placeKeys?.length > 0) setAddedFields(placeKeys);
      } else
        window.location.replace(`${location?.origin}${PathName.Dashboard}/${calendarId}${PathName.Places}/${placeId}`);
    }
  }, [isPlaceLoading, currentCalendarData]);

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
      form.setFieldValue({
        name: {
          fr: location?.state?.name,
          en: location?.state?.name,
        },
      });

    // placesSearch('');
  }, []);

  return !isPlaceLoading && !artsDataLoading && !taxonomyLoading ? (
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
                      {t('dashboard.places.createNew.search.breadcrumb')}
                    </Button>
                  </div>
                </Col>
                <Col>
                  <div className="add-event-button-wrap">
                    <Form.Item>
                      <PrimaryButton
                        label={t('dashboard.events.addEditEvent.saveOptions.save')}
                        // onClick={() => onSaveHandler()}
                        // disabled={
                        //   addOrganizationLoading || imageUploadLoading || updateOrganizationLoading ? true : false
                        // }
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col>
              <div className="add-edit-event-heading">
                <h4>
                  {placeId
                    ? t('dashboard.places.createNew.addPlace.editPlace')
                    : t('dashboard.places.createNew.addPlace.newPlace')}
                </h4>
              </div>
            </Col>
          </Row>
          <Card>
            <>
              <Form.Item label={t('dashboard.places.createNew.addPlace.name')} required={true}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.name}>
                    <Form.Item
                      name={formFieldNames.FRENCH}
                      key={contentLanguage.FRENCH}
                      initialValue={placeData?.name?.fr}
                      dependencies={[formFieldNames.ENGLISH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.FRENCH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name={formFieldNames.ENGLISH}
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.name?.en}
                      dependencies={[formFieldNames.FRENCH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.ENGLISH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>
              <Form.Item
                name={formFieldNames.TYPE}
                label={taxonomyDetails(allTaxonomyData?.data, user, placeTaxonomyMappedFieldTypes.TYPE, 'name', false)}
                initialValue={placeData?.additionalType?.map((type) => {
                  return type?.entityId;
                })}>
                <TreeSelectOption
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderEventType')}
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
                        closable={closable}
                        onClose={onClose}
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
                />
              </Form.Item>
            </>
            <></>
          </Card>
          <Card title={t('dashboard.places.createNew.addPlace.address.address')}>
            <>
              <Form.Item label={t('dashboard.places.createNew.addPlace.address.streetAddress')} required={true}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.name}>
                    <Form.Item
                      name={formFieldNames.STREET_ADDRESS_FRENCH}
                      key={contentLanguage.FRENCH}
                      initialValue={placeData?.name?.fr}
                      dependencies={[formFieldNames.STREET_ADDRESS_ENGLISH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.STREET_ADDRESS_ENGLISH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.places.createNew.addPlace.address.streetAddressPlaceholder.french')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name={formFieldNames.STREET_ADDRESS_ENGLISH}
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.name?.en}
                      dependencies={[formFieldNames.STREET_ADDRESS_FRENCH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.STREET_ADDRESS_FRENCH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.places.createNew.addPlace.address.streetAddressPlaceholder.english')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>
              <Form.Item label={t('dashboard.places.createNew.addPlace.address.city.city')}>
                <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                  <BilingualInput fieldData={placeData?.name}>
                    <Form.Item
                      name={formFieldNames.CITY_FRENCH}
                      key={contentLanguage.FRENCH}
                      initialValue={placeData?.name?.fr}
                      dependencies={[formFieldNames.CITY_ENGLISH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.CITY_ENGLISH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.places.createNew.addPlace.address.city.placeholder.french')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name={formFieldNames.CITY_ENGLISH}
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.name?.en}
                      dependencies={[formFieldNames.CITY_FRENCH]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue(formFieldNames.CITY_FRENCH)) {
                              return Promise.resolve();
                            } else
                              return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                          },
                        }),
                      ]}>
                      <TextArea
                        autoSize
                        autoComplete="off"
                        placeholder={t('dashboard.places.createNew.addPlace.address.city.placeholder.english')}
                        style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                        size="large"
                      />
                    </Form.Item>
                  </BilingualInput>
                </ContentLanguageInput>
              </Form.Item>
              <Form.Item
                name={formFieldNames.POSTAL_CODE}
                label={t('dashboard.places.createNew.addPlace.address.postalCode.postalCode')}
                rules={[
                  {
                    type: 'url',
                    message: t('dashboard.events.addEditEvent.validations.url'),
                  },
                ]}>
                <StyledInput placeholder={t('dashboard.places.createNew.addPlace.address.postalCode.placeholder')} />
              </Form.Item>
              <Row gutter={[16, 0]}>
                <Col span={12}>
                  <Form.Item label={t('dashboard.places.createNew.addPlace.address.province.province')}>
                    <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                      <BilingualInput fieldData={placeData?.name}>
                        <Form.Item
                          name={formFieldNames.PROVINCE_FRENCH}
                          key={contentLanguage.FRENCH}
                          initialValue={placeData?.name?.fr}
                          dependencies={[formFieldNames.PROVINCE_ENGLISH]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value || getFieldValue(formFieldNames.PROVINCE_ENGLISH)) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.places.createNew.addPlace.address.province.placeholder.french')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                        <Form.Item
                          name={formFieldNames.PROVINCE_ENGLISH}
                          key={contentLanguage.ENGLISH}
                          initialValue={placeData?.name?.en}
                          dependencies={[formFieldNames.PROVINCE_FRENCH]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value || getFieldValue(formFieldNames.PROVINCE_FRENCH)) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.places.createNew.addPlace.address.province.placeholder.english')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                      </BilingualInput>
                    </ContentLanguageInput>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t('dashboard.places.createNew.addPlace.address.country.country')}>
                    <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                      <BilingualInput fieldData={placeData?.name}>
                        <Form.Item
                          name={formFieldNames.CITY_FRENCH}
                          key={contentLanguage.FRENCH}
                          initialValue={placeData?.name?.fr}
                          dependencies={[formFieldNames.CITY_ENGLISH]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value || getFieldValue(formFieldNames.CITY_ENGLISH)) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.places.createNew.addPlace.address.country.placeholder.french')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                        <Form.Item
                          name={formFieldNames.CITY_ENGLISH}
                          key={contentLanguage.ENGLISH}
                          initialValue={placeData?.name?.en}
                          dependencies={[formFieldNames.CITY_FRENCH]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value || getFieldValue(formFieldNames.CITY_FRENCH)) {
                                  return Promise.resolve();
                                } else
                                  return Promise.reject(
                                    new Error(t('dashboard.events.addEditEvent.validations.title')),
                                  );
                              },
                            }),
                          ]}>
                          <TextArea
                            autoSize
                            autoComplete="off"
                            placeholder={t('dashboard.places.createNew.addPlace.address.country.placeholder.english')}
                            style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                            size="large"
                          />
                        </Form.Item>
                      </BilingualInput>
                    </ContentLanguageInput>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name={formFieldNames.COORDINATES}
                label={t('dashboard.places.createNew.addPlace.address.coordinates.coordinates')}>
                <StyledInput />
              </Form.Item>
              <Form.Item
                name={formFieldNames.TYPE}
                label={taxonomyDetails(
                  allTaxonomyData?.data,
                  user,
                  placeTaxonomyMappedFieldTypes.REGION,
                  'name',
                  false,
                )}
                initialValue={placeData?.regions?.map((type) => {
                  return type?.entityId;
                })}>
                <TreeSelectOption
                  placeholder={t('dashboard.events.addEditEvent.language.placeHolderEventType')}
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
                        closable={closable}
                        onClose={onClose}
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
                />
              </Form.Item>
            </>
            <></>
          </Card>
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
