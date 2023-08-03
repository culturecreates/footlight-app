import React, { useRef } from 'react';
import './quickCreatePlace.css';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input, notification } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import ContentLanguageInput from '../../ContentLanguageInput/ContentLanguageInput';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../BilingualInput/BilingualInput';
import { treeEntitiesOption, treeTaxonomyOptions } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { entitiesClass } from '../../../constants/entitiesClass';
import { useAddPersonMutation, useLazyGetPersonQuery } from '../../../services/people';
import { taxonomyClass } from '../../../constants/taxonomyClass';
import { useGetAllTaxonomyQuery } from '../../../services/taxonomy';
import TreeSelectOption from '../../TreeSelectOption/TreeSelectOption';
import NoContent from '../../NoContent/NoContent';
import Tags from '../../Tags/Common/Tags';
import { taxonomyDetails } from '../../../utils/taxonomyDetails';

const { TextArea } = Input;

function QuickCreatePlace(props) {
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
    taxonomyClass: taxonomyClass.PLACE,
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
        createdPerson = treeEntitiesOption(createdPerson, user, calendarContentLanguage);
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
        personObj = {
          name,
          url,
        };
        addPerson({ data: personObj, calendarId })
          .unwrap()
          .then((response) => {
            notification.success({
              description: t('dashboard.events.addEditEvent.location.quickCreate.quickCreatePerson.success'),
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
          <span className="quick-create-place-modal-title">
            {t('dashboard.events.addEditEvent.location.quickCreatePlace.title')}
          </span>
        }
        onCancel={() => setOpen(false)}
        footer={[
          <TextButton
            key="cancel"
            size="large"
            label={t('dashboard.events.addEditEvent.location.quickCreatePlace.cancel')}
            onClick={() => setOpen(false)}
          />,
          <PrimaryButton
            key="add-dates"
            label={t('dashboard.events.addEditEvent.location.quickCreatePlace.create')}
            onClick={createPersonHandler}
          />,
        ]}>
        <Row gutter={[0, 10]} className="quick-create-place-modal-wrapper">
          <Col span={24}>
            <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
              <Row>
                <Col>
                  <p className="quick-create-place-modal-sub-heading">
                    {t('dashboard.events.addEditEvent.location.quickCreatePlace.subHeading')}
                  </p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <span className="quick-create-place-modal-label">
                    {t('dashboard.events.addEditEvent.location.quickCreatePlace.name')}
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
                              new Error(t('dashboard.events.addEditEvent.location.quickCreatePlace.validations.name')),
                            );
                        },
                      }),
                    ]}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.namePlaceholder')}
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
                              new Error(t('dashboard.events.addEditEvent.location.quickCreatePlace.validations.name')),
                            );
                        },
                      }),
                    ]}>
                    <TextArea
                      autoSize
                      autoComplete="off"
                      placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.namePlaceholder')}
                      style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </BilingualInput>
              </ContentLanguageInput>

              <Form.Item name="placeType" label={taxonomyDetails(allTaxonomyData?.data, user, 'Type', 'name', false)}>
                <TreeSelectOption
                  allowClear
                  treeDefaultExpandAll
                  placeholder={t('dashboard.events.addEditEvent.location.quickCreatePlace.typePlaceholder')}
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={treeTaxonomyOptions(allTaxonomyData, user, 'Type', false, calendarContentLanguage)}
                  tagRender={(props) => {
                    const { closable, onClose, label } = props;
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
            </Form>
          </Col>
        </Row>
      </CustomModal>
    )
  );
}

export default QuickCreatePlace;
