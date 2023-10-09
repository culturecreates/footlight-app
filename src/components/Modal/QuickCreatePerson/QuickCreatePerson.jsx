import React, { useRef } from 'react';
import './quickCreatePerson.css';
import { CloseCircleOutlined } from '@ant-design/icons';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input, notification } from 'antd';
import ContentLanguageInput from '../../ContentLanguageInput/ContentLanguageInput';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../BilingualInput/BilingualInput';
import StyledInput from '../../Input/Common';
import { treeEntitiesOption, treeTaxonomyOptions } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useAddPersonMutation, useLazyGetPersonQuery } from '../../../services/people';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';
import NoContent from '../../NoContent/NoContent';
import TreeSelectOption from '../../TreeSelectOption/TreeSelectOption';
import Tags from '../../Tags/Common/Tags';
import { sourceOptions } from '../../../constants/sourceOptions';

const { TextArea } = Input;

function QuickCreatePerson(props) {
  const {
    open,
    setOpen,
    calendarContentLanguage,
    calendarId,
    keyword,
    setKeyword,
    interfaceLanguage,
    setSelectedOrganizers,
    selectedOrganizers,
    selectedPerformers,
    setSelectedPerformers,
    selectedSupporters,
    setSelectedSupporters,
    selectedOrganizerPerformerSupporterType,
    organizerPerformerSupporterTypes,
  } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const timestampRef = useRef(Date.now()).current;

  const { user } = useSelector(getUserDetails);

  const { currentData: allTaxonomyData, isLoading: taxonomyLoading } = useGetAllTaxonomyQuery({
    calendarId,
    search: '',
    taxonomyClass: taxonomyClass.PERSON,
    includeConcepts: true,
    sessionId: timestampRef,
  });
  const [addPerson] = useAddPersonMutation();
  const [getPerson] = useLazyGetPersonQuery();

  const getSelectedPerson = (id) => {
    getPerson({ personId: id, calendarId })
      .unwrap()
      .then((response) => {
        let createdPerson = [
          {
            disambiguatingDescription: response?.disambiguatingDescription,
            id: response?.id,
            name: response?.name,
            type: entitiesClass.person,
            image: response?.image,
          },
        ];
        createdPerson = treeEntitiesOption(createdPerson, user, calendarContentLanguage, sourceOptions.CMS);
        if (createdPerson?.length === 1) {
          switch (selectedOrganizerPerformerSupporterType) {
            case organizerPerformerSupporterTypes.organizer:
              setSelectedOrganizers([...selectedOrganizers, createdPerson[0]]);
              break;
            case organizerPerformerSupporterTypes.performer:
              setSelectedPerformers([...selectedPerformers, createdPerson[0]]);
              break;
            case organizerPerformerSupporterTypes.supporter:
              setSelectedSupporters([...selectedSupporters, createdPerson[0]]);
              break;

            default:
              break;
          }
        }
      })
      .catch((error) => console.log(error));
  };
  const createPersonHandler = () => {
    form
      .validateFields(['french', 'english'])
      .then(() => {
        var values = form.getFieldsValue(true);
        let name = {},
          url = {},
          occupation = [],
          personObj = {};

        if (values?.english)
          name = {
            en: values?.english,
          };

        if (values?.french)
          name = {
            ...name,
            fr: values?.french,
          };

        if (values?.contactWebsiteUrl)
          url = {
            uri: values?.contactWebsiteUrl,
          };
        if (values?.occupation) {
          occupation = values?.occupation?.map((occupationId) => {
            return {
              entityId: occupationId,
            };
          });
        }
        personObj = {
          name,
          url,
          occupation,
        };
        addPerson({ data: personObj, calendarId })
          .unwrap()
          .then((response) => {
            notification.success({
              description: t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.success'),
              placement: 'top',
              closeIcon: <></>,
              maxCount: 1,
              duration: 3,
            });
            setKeyword('');
            getSelectedPerson(response?.id);
            setOpen(false);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => console.log(error));
  };
  return (
    !taxonomyLoading && (
      <CustomModal
        open={open}
        destroyOnClose
        centered
        title={
          <span className="quick-create-person-modal-title">
            {t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.title')}
          </span>
        }
        onCancel={() => setOpen(false)}
        footer={[
          <TextButton
            key="cancel"
            size="large"
            label={t('dashboard.events.addEditEvent.quickCreate.cancel')}
            onClick={() => setOpen(false)}
          />,
          <PrimaryButton
            key="add-dates"
            label={t('dashboard.events.addEditEvent.quickCreate.create')}
            onClick={createPersonHandler}
          />,
        ]}>
        <Row gutter={[0, 10]} className="quick-create-person-modal-wrapper">
          <Col span={24}>
            <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
              <Row>
                <Col>
                  <p className="quick-create-person-modal-sub-heading">
                    {t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.subHeading')}
                  </p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <span className="quick-create-person-modal-label">
                    {t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.name')}
                  </span>
                </Col>
              </Row>
              <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
                <BilingualInput defaultTab={interfaceLanguage}>
                  <Form.Item
                    name="french"
                    key={contentLanguage.FRENCH}
                    initialValue={
                      calendarContentLanguage === contentLanguage.BILINGUAL
                        ? interfaceLanguage === 'fr'
                          ? keyword
                          : undefined
                        : calendarContentLanguage === contentLanguage.FRENCH
                        ? keyword
                        : undefined
                    }
                    dependencies={['english']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value || getFieldValue('english')) {
                            return Promise.resolve();
                          } else
                            return Promise.reject(
                              new Error(
                                t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.validations.name'),
                              ),
                            );
                        },
                      }),
                    ]}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.namePlaceholder')}
                      style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    name="english"
                    dependencies={['french']}
                    initialValue={
                      calendarContentLanguage === contentLanguage.BILINGUAL
                        ? interfaceLanguage === 'en'
                          ? keyword
                          : undefined
                        : calendarContentLanguage === contentLanguage.ENGLISH
                        ? keyword
                        : undefined
                    }
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value || getFieldValue('french')) {
                            return Promise.resolve();
                          } else
                            return Promise.reject(
                              new Error(
                                t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.validations.name'),
                              ),
                            );
                        },
                      }),
                    ]}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.namePlaceholder')}
                      style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </BilingualInput>
              </ContentLanguageInput>
              <Form.Item
                name="occupation"
                label={taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false)}
                hidden={taxonomyDetails(allTaxonomyData?.data, user, 'Occupation', 'name', false) ? false : true}>
                <TreeSelectOption
                  placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.occupationPlaceholder')}
                  allowClear
                  treeDefaultExpandAll
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Occupation', false, calendarContentLanguage)}
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
              <Form.Item
                name="contactWebsiteUrl"
                label={t('dashboard.events.addEditEvent.otherInformation.contact.website')}
                rules={[
                  {
                    type: 'url',
                    message: t('dashboard.events.addEditEvent.validations.url'),
                  },
                ]}>
                <StyledInput
                  addonBefore="https://"
                  autoComplete="off"
                  placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreatePerson.websitePlaceholder')}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </CustomModal>
    )
  );
}

export default QuickCreatePerson;
