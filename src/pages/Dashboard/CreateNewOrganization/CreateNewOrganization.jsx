import React, { useRef, useState, useEffect } from 'react';
import './createNewOrganization.css';
import '../AddEvent/addEvent.css';
import { Form, Row, Col, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import PrimaryButton from '../../../components/Button/Primary';
import { featureFlags } from '../../../utils/featureFlags';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { entitiesClass } from '../../../constants/entitiesClass';
import Card from '../../../components/Card/Common/Event';
import { formCategory, formFieldValue, returnFormDataWithFields } from '../../../constants/formFields';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { bilingual } from '../../../utils/bilingual';
import { useGetOrganizationQuery } from '../../../services/organization';
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
// const sampleForm = {
//   forms: [
//     {
//       formName: 'Organization',
//       formFields: [
//         {
//           order: 1,
//           name: 'Name',
//           label: { en: 'Name', fr: 'Nom' },
//           mappedField: 'name',
//           isRequiredField: true,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'MultiLingual',
//           category: 'Primary',
//           placeholder: {
//             en: { en: 'Enter english organization name', fr: 'Enter french organization name' },
//             fr: { en: "Entrez nom de l'organisation en anglais", fr: "Entrez le nom de l'organisation en français" },
//           },
//           isPreLoaded: true,
//           validations: {
//             en: { en: 'Name is required.', fr: 'Name is required.' },
//             fr: { en: 'Le nom est requis.', fr: 'Le nom est requis.' },
//           },
//         },
//         {
//           order: 2,
//           name: 'Disambiguating description',
//           label: { en: 'Disambiguating description', fr: 'Description identifiante' },
//           mappedField: 'disambiguatingDescription',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'MultiLingual',
//           category: 'Primary',
//           placeholder: {
//             en: { en: 'Enter english disambiguation description', fr: 'Enter french disambiguation description' },
//             fr: { en: 'Entrez la description identifiante', fr: 'Entrez la description identifiante' },
//           },
//           isPreLoaded: true,
//           userTips: {
//             text: {
//               en: 'Add to differentiate organization in search results',
//               fr: "Ajouter pour différencier l'organisation dans les résultats de recherche.",
//             },
//             position: 'bottom',
//           },
//         },
//         {
//           order: 3,
//           name: 'Organization type',
//           label: { en: 'Organization type', fr: 'Type' },
//           mappedField: 'additionalType',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'MultiSelect',
//           category: 'Primary',
//           datatype: 'StandardField',
//           placeholder: { en: { en: 'Select Organization type' }, fr: { fr: 'Select Organization type' } },
//           isPreLoaded: true,
//         },
//         {
//           order: 4,
//           name: 'Description',
//           label: { en: 'Description', fr: 'Description' },
//           mappedField: 'description',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Editor',
//           datatype: 'MultiLingual',
//           category: 'Primary',
//           placeholder: {
//             en: { en: 'Enter English description', fr: 'Enter French description' },
//             fr: { en: 'Entrez la description', fr: 'Entrez la description' },
//           },
//           isPreLoaded: true,
//         },
//         {
//           order: 5,
//           name: 'Website',
//           label: { en: 'Website', fr: 'Site web' },
//           mappedField: 'url',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'URIString',
//           category: 'Primary',
//           placeholder: { en: { en: 'enter URL' }, fr: { fr: 'enter URL' } },
//           isPreLoaded: true,
//         },
//         {
//           order: 6,
//           name: 'Logo',
//           label: { en: 'Logo', fr: 'Logo' },
//           mappedField: 'logo',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Image',
//           datatype: 'Image',
//           category: 'Primary',
//           placeholder: { en: { en: 'Browse or drag to upload' }, fr: { fr: 'Parcourir ou glisser pour télécharger' } },
//           isPreLoaded: true,
//           userTips: {
//             text: {
//               en: 'Only .jpeg and .png files are supported.',
//               fr: 'Uniquement les fichiers .jpeg et .png sont acceptés.',
//             },
//             position: 'top',
//           },
//         },
//         {
//           order: 7,
//           name: 'Image',
//           label: { en: 'Image', fr: 'Image' },
//           mappedField: 'image',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Image',
//           datatype: 'Image',
//           category: 'Primary',
//           placeholder: { en: { en: 'Browse or drag to upload' }, fr: { fr: 'Parcourir ou glisser pour télécharger' } },
//           isPreLoaded: true,
//           userTips: {
//             text: {
//               en: 'Only .jpeg and .png files are supported.',
//               fr: 'Uniquement les fichiers .jpeg et .png sont acceptés.',
//             },
//             position: 'top',
//           },
//         },
//         {
//           order: 8,
//           name: 'Contact title',
//           label: { en: 'Contact title', fr: 'Titre du contact' },
//           mappedField: 'contactPoint.name',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'MultiLingual',
//           category: 'Contact',
//           placeholder: { en: { en: 'Enter contact title' }, fr: { fr: 'Entrez titre contact' } },
//           isPreLoaded: true,
//         },
//         {
//           order: 9,
//           name: 'Website',
//           label: { en: 'Website', fr: 'Site web' },
//           mappedField: 'contactPoint.url',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'URIString',
//           category: 'Contact',
//           placeholder: { en: { en: 'enter URL' }, fr: { fr: 'enter URL' } },
//           isPreLoaded: true,
//         },
//         {
//           order: 10,
//           name: 'Phone Number',
//           label: { en: 'Phone Number', fr: 'Numéro de téléphone' },
//           mappedField: 'contactPoint.telephone',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'String',
//           category: 'Contact',
//           placeholder: { en: { en: 'enter phone number' }, fr: { fr: 'entrez numéro téléphone' } },
//           isPreLoaded: true,
//         },
//         {
//           order: 11,
//           name: 'Email',
//           label: { en: 'Email', fr: 'Courriel' },
//           mappedField: 'contactPoint.email',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'String',
//           category: 'Contact',
//           placeholder: { en: { en: 'enter email' }, fr: { fr: 'entrez email' } },
//           isPreLoaded: true,
//         },
//         {
//           order: 12,
//           name: 'Description',
//           label: { en: 'Description', fr: 'Description' },
//           mappedField: 'contactPoint.description',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Editor',
//           datatype: 'String',
//           category: 'Contact',
//           placeholder: {
//             en: { en: 'Enter english contact description', fr: 'Enter french contact description' },
//             fr: { en: 'Entrez description contact en anglais', fr: 'Entrez description contact en français' },
//           },
//           isPreLoaded: true,
//         },
//         {
//           order: 13,
//           name: 'Location',
//           label: { en: 'Location', fr: 'Endroit' },
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Search',
//           datatype: 'IdentityString',
//           category: 'Primary',
//           mappedField: 'place',
//           placeholder: { en: { en: 'Search places' }, fr: { fr: 'Rechercher un lieu' } },
//           isPreLoaded: true,
//         },
//       ],
//     },
//     {
//       formName: 'People',
//       formFields: [
//         {
//           order: 1,
//           name: 'Name',
//           label: { en: 'Name', fr: 'Nom' },
//           mappedField: 'name',
//           isRequiredField: true,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'MultiLingual',
//           category: 'Primary',
//           placeholder: { en: { en: 'Enter name' }, fr: { fr: 'Nom' } },
//           isPreLoaded: true,
//           validations: {
//             en: { en: 'Name is required.', fr: 'Name is required.' },
//             fr: { en: 'Le nom est requis.', fr: 'Le nom est requis.' },
//           },
//         },
//         {
//           order: 2,
//           name: 'Occupation',
//           label: { en: 'Occupation', fr: 'Profession' },
//           mappedField: 'Occupation',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'MultiSelect',
//           datatype: 'StandardField',
//           category: 'Primary',
//           placeholder: { en: { en: 'Select occupation' }, fr: { fr: 'Profession' } },
//           isPreLoaded: true,
//         },
//         {
//           order: 3,
//           name: 'Disambiguating description',
//           label: { en: 'Disambiguating Description', fr: 'Description identifiante' },
//           mappedField: 'disambiguatingDescription',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'MultiLingual',
//           category: 'Primary',
//           placeholder: {
//             en: { en: 'Enter english disambiguation description', fr: 'Enter french disambiguation description' },
//             fr: { en: 'Entrez la description identifiante', fr: 'Entrez la description identifiante' },
//           },
//           isPreLoaded: true,
//           userTips: {
//             text: {
//               en: 'Add to differentiate person in search results',
//               fr: 'AAjouter pour différencier la personne dans les résultats de recherche',
//             },
//             position: 'bottom',
//           },
//         },
//         {
//           order: 4,
//           name: 'Website',
//           label: { en: 'Website', fr: 'Site web' },
//           mappedField: 'url',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Input',
//           datatype: 'URIString',
//           category: 'Primary',
//           placeholder: { en: { en: 'enter URL' }, fr: { fr: 'entrer URL' } },
//           isPreLoaded: true,
//         },
//         {
//           order: 5,
//           name: 'Image',
//           label: { en: 'Image', fr: 'Image' },
//           mappedField: 'image',
//           isRequiredField: false,
//           isAdminOnlyField: false,
//           type: 'Image',
//           datatype: 'Image',
//           category: 'Primary',
//           placeholder: { en: { en: 'Browse or drag to upload' }, fr: { fr: 'Parcourir ou glisser pour télécharger' } },
//           isPreLoaded: true,
//           userTips: {
//             text: {
//               en: 'Only .jpeg and .png files are supported.',
//               fr: 'Uniquement les fichiers .jpeg et .png sont acceptés.',
//             },
//             position: 'top',
//           },
//         },
//       ],
//     },
//   ],
// };
function CreateNewOrganization() {
  const timestampRef = useRef(Date.now()).current;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  // const [addOrganization] = useAddOrganizationMutation();

  const [artsData, setArtsData] = useState(null);
  const [newEntityData, setNewEntityData] = useState(null);
  const [artsDataLoading, setArtsDataLoading] = useState(false);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [locationPlace, setLocationPlace] = useState();
  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const onSaveHandler = () => {
    form
      .validateFields([])
      .then(() => {
        var values = form.getFieldsValue(true);
        let organizationPayload = {};
        // console.log(values);
        Object.keys(values)?.map((object) => {
          let payload = formPayloadHandler(values[object], object, formFields);
          let newKeys = Object.keys(payload);
          organizationPayload = {
            ...organizationPayload,
            ...(newKeys?.length > 0 && { [newKeys[0]]: payload[newKeys[0]] }),
          };
        });
        // console.log(organizationPayload);
        // addOrganization({ data: {}, calendarId })
        //   .unwrap()
        //   .then((response) => {
        //     console.log(response);
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
      })
      .catch((error) => {
        console.log(error);
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

  useEffect(() => {
    if (calendarId && organizationData && currentCalendarData) {
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

  // console.log(fields);
  // console.log(organizationData);
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
                        onClick={onSaveHandler}
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

export default CreateNewOrganization;
