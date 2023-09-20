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
                      name="french"
                      key={contentLanguage.FRENCH}
                      initialValue={placeData?.name?.fr}
                      dependencies={['english']}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue('english')) {
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
                      name="english"
                      key={contentLanguage.ENGLISH}
                      initialValue={placeData?.name?.en}
                      dependencies={['french']}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value || getFieldValue('french')) {
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
                name="eventType"
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
