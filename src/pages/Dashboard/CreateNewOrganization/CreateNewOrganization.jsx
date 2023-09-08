import React, { useRef } from 'react';
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
import { formCategory, formFieldValue, renderFormFields } from '../../../constants/formFields';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { bilingual, contentLanguageBilingual } from '../../../utils/bilingual';
import { useGetOrganizationQuery } from '../../../services/organization';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import TreeSelectOption from '../../../components/TreeSelectOption/TreeSelectOption';
import NoContent from '../../../components/NoContent/NoContent';
import { treeDynamicTaxonomyOptions } from '../../../components/TreeSelectOption/treeSelectOption.settings';
import Tags from '../../../components/Tags/Common/Tags';
import { formFieldsHandler } from '../../../utils/formFieldsHandler';
import { formPayloadHandler } from '../../../utils/formPayloadHandler';
import { formInitialValueHandler } from '../../../utils/formInitialValueHandler';

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
  // const [addOrganization] = useAddOrganizationMutation();

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.organization);
  let formFields = currentCalendarData?.forms?.filter((form) => form?.formName === entitiesClass.organization);
  formFields = formFields?.length > 0 && formFields[0]?.formFields;

  const onSaveHandler = () => {
    form
      .validateFields([])
      .then(() => {
        var values = form.getFieldsValue(true);
        let organizationPayload = {};
        Object.keys(values)?.map((object) => {
          let payload = formPayloadHandler(values[object], object, formFields);
          let newKeys = Object.keys(payload);
          let childKeys = Object.keys(payload[newKeys[0]]);
          organizationPayload = {
            ...organizationPayload,
            ...(newKeys?.length > 0 && {
              [newKeys[0]]: {
                ...organizationPayload[newKeys[0]],
                ...(childKeys?.length > 0 && { [childKeys[0]]: payload[newKeys[0]][childKeys[0]] }),
                ...(childKeys?.length > 1 && {
                  [childKeys[childKeys?.length - 1]]: payload[newKeys[0]][childKeys[childKeys?.length - 1]],
                }),
              },
            }),
          };
        });
        // addOrganization({ data: {}, calendarId })
        //   .unwrap()
        //   .then((response) => {
        //     console.log(response);
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
      })
      .catch((error) => console.log(error));
  };

  // console.log(fields);
  // console.log(organizationData);
  return (
    fields &&
    !organizationLoading &&
    !taxonomyLoading && (
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
                            return renderFormFields({
                              name: [field?.mappedField],
                              type: field?.type,
                              datatype: field?.datatype,
                              element: formField?.element({
                                datatype: field?.datatype,
                                taxonomyData: allTaxonomyData,
                                user: user,
                                type: field?.mappedField,
                                isDynamicField: false,
                                calendarContentLanguage,
                                name: [field?.mappedField],
                                placeholder: contentLanguageBilingual({
                                  en: field?.placeholder?.en,
                                  fr: field?.placeholder?.fr,
                                  interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                  calendarContentLanguage: calendarContentLanguage,
                                }),
                              }),
                              key: index,
                              initialValue: formInitialValueHandler(
                                field?.type,
                                field?.mappedField,
                                field?.datatype,
                                organizationData,
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
          </Form>
        </div>
      </FeatureFlag>
    )
  );
}

export default CreateNewOrganization;
