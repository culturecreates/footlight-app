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
import { dataTypes, formCategory, formFieldValue, formTypes, renderFormFields } from '../../../constants/formFields';
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

  const {
    data: organizationData,
    isLoading: organizationLoading,
    isSuccess: organizationSuccess,
  } = useGetOrganizationQuery(
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

  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  let fields = formFieldsHandler(currentCalendarData?.forms, entitiesClass.organization);

  const onSaveHandler = () => {
    form
      .validateFields([])
      .then(() => {
        let values = form.getFieldsValue(true);
        console.log(values);
      })
      .catch((error) => {
        let values = form.getFieldsValue(true);
        console.log(values, error);
      });
  };

  const initialValueHandler = (type, mappedField, datatype, data) => {
    let mappedFieldSplit = mappedField?.split('.');
    let initialData = data;
    for (let index = 0; index < mappedFieldSplit?.length; index++) {
      if (initialData) initialData = initialData[mappedFieldSplit[index]];
    }
    switch (type) {
      case formTypes.INPUT:
        if (datatype === dataTypes.URI_STRING) return initialData?.uri;
        else return initialData;

      case formTypes.MULTISELECT:
        return initialData?.map((concept) => concept?.entityId);

      default:
        break;
    }
  };

  // console.log(fields);
  // console.log(organizationData);
  return (
    fields &&
    organizationSuccess &&
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
              return (
                <Card title={section[0]?.category} key={index}>
                  <>
                    {section?.map((field) => {
                      return formFieldValue?.map((formField, index) => {
                        if (formField?.type === field.type) {
                          return renderFormFields({
                            name: field?.mappedField?.split('.'),
                            type: field?.type,
                            datatype: field?.datatype,
                            element: formField?.element({
                              datatype: field?.datatype,
                              taxonomyData: allTaxonomyData,
                              data: user,
                              type: field?.mappedField,
                              isDynamicField: false,
                              calendarContentLanguage,
                              name: field?.mappedField?.split('.'),
                            }),
                            key: index,
                            initialValue: initialValueHandler(
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
                              required: field?.isRequiredField,
                              hidden: true,
                            }),
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
    )
  );
}

export default CreateNewOrganization;
