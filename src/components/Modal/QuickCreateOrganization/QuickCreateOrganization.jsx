import React from 'react';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input, notification } from 'antd';
import ContentLanguageInput from '../../ContentLanguageInput/ContentLanguageInput';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../BilingualInput/BilingualInput';
import ImageUpload from '../../ImageUpload/ImageUpload';
import StyledInput from '../../Input/Common';
import { useAddImageMutation } from '../../../services/image';
import { useAddOrganizationMutation, useLazyGetOrganizationQuery } from '../../../services/organization';
import './quickCreateOrganization.css';
import { treeEntitiesOption } from '../../TreeSelectOption/treeSelectOption.settings';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/reducer/userSlice';
import { entitiesClass } from '../../../constants/entitiesClass';

const { TextArea } = Input;

function QuickCreateOrganization(props) {
  const {
    open,
    setOpen,
    calendarContentLanguage,
    calendarId,
    keyword,
    setKeyword,
    interfaceLanguage,
    selectedOrganizers,
    setSelectedOrganizers,
    selectedPerformers,
    setSelectedPerformers,
    selectedSupporters,
    setSelectedSupporters,
    selectedOrganizerPerformerSupporterType,
    organizerPerformerSupporterTypes,
  } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const { user } = useSelector(getUserDetails);

  const [addImage] = useAddImageMutation();
  const [addOrganization] = useAddOrganizationMutation();
  const [getOrganization] = useLazyGetOrganizationQuery();

  const getSelectedOrganizer = (id) => {
    getOrganization({ id, calendarId })
      .unwrap()
      .then((response) => {
        let createdOrganizer = [
          {
            disambiguatingDescription: response?.disambiguatingDescription,
            id: response?.id,
            name: response?.name,
            type: entitiesClass.organization,
            logo: response?.logo,
          },
        ];
        createdOrganizer = treeEntitiesOption(createdOrganizer, user, calendarContentLanguage);
        if (createdOrganizer?.length === 1) {
          switch (selectedOrganizerPerformerSupporterType) {
            case organizerPerformerSupporterTypes.organizer:
              setSelectedOrganizers([...selectedOrganizers, createdOrganizer[0]]);
              break;
            case organizerPerformerSupporterTypes.performer:
              setSelectedPerformers([...selectedPerformers, createdOrganizer[0]]);
              break;
            case organizerPerformerSupporterTypes.supporter:
              setSelectedSupporters([...selectedSupporters, createdOrganizer[0]]);
              break;

            default:
              break;
          }
        }
      })
      .catch((error) => console.log(error));
  };
  const createOrganizationHandler = () => {
    form
      .validateFields(['french', 'english'])
      .then(() => {
        var values = form.getFieldsValue(true);
        let name = {},
          url = {},
          organizationObj = {};

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
        organizationObj = {
          name,
          url,
        };
        if (values?.dragger?.length > 0 && values?.dragger[0]?.originFileObj) {
          const formdata = new FormData();
          formdata.append('file', values?.dragger[0].originFileObj);
          formdata &&
            addImage({ data: formdata, calendarId })
              .unwrap()
              .then((response) => {
                organizationObj['logo'] = response?.data;
                addOrganization({ data: organizationObj, calendarId })
                  .unwrap()
                  .then((response) => {
                    notification.success({
                      description: t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.success'),
                      placement: 'top',
                      closeIcon: <></>,
                      maxCount: 1,
                      duration: 3,
                    });
                    setKeyword('');
                    getSelectedOrganizer(response?.id);
                    setOpen(false);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              })
              .catch((error) => {
                console.log(error);
              });
        } else {
          addOrganization({ data: organizationObj, calendarId })
            .unwrap()
            .then((response) => {
              notification.success({
                description: t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.success'),
                placement: 'top',
                closeIcon: <></>,
                maxCount: 1,
                duration: 3,
              });
              setKeyword('');
              getSelectedOrganizer(response?.id);
              setOpen(false);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => console.log(error));
  };
  return (
    <CustomModal
      open={open}
      destroyOnClose
      centered
      title={
        <span className="quick-create-organization-modal-title">
          {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.title')}
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
          onClick={createOrganizationHandler}
        />,
      ]}>
      <Row gutter={[0, 10]} className="quick-create-organization-modal-wrapper">
        <Col span={24}>
          <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
            <Row>
              <Col>
                <p className="quick-create-organization-modal-sub-heading">
                  {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.subHeading')}
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <span className="quick-create-organization-modal-label">
                  {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.name')}
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
                              t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.validations.name'),
                            ),
                          );
                      },
                    }),
                  ]}>
                  <TextArea
                    autoSize
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.namePlaceholder')}
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
                              t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.validations.name'),
                            ),
                          );
                      },
                    }),
                  ]}>
                  <TextArea
                    autoSize
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.namePlaceholder')}
                    style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '100%' }}
                    size="large"
                  />
                </Form.Item>
              </BilingualInput>
            </ContentLanguageInput>
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
                placeholder={t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.websitePlaceholder')}
              />
            </Form.Item>
            <Form.Item
              label={t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.logo')}
              name="draggerWrap"
              //   {...(isAddImageError && {
              //     help: t('dashboard.events.addEditEvent.validations.errorImage'),
              //     validateStatus: 'error',
              //   })}
              rules={[
                ({ getFieldValue }) => ({
                  validator() {
                    if (
                      (getFieldValue('dragger') != undefined && getFieldValue('dragger')?.length > 0) ||
                      !getFieldValue('dragger') ||
                      getFieldValue('dragger')?.length > 0
                    ) {
                      return Promise.resolve();
                    } else
                      return Promise.reject(
                        new Error(t('dashboard.events.addEditEvent.validations.otherInformation.emptyImage')),
                      );
                  },
                }),
              ]}>
              <Row>
                <Col>
                  <p className="quick-create-organization-modal-sub-heading">
                    {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.logoSubHeading')}
                  </p>
                </Col>
              </Row>
              <ImageUpload imageReadOnly={false} preview={false} />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </CustomModal>
  );
}

export default QuickCreateOrganization;
