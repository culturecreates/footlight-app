import React from 'react';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text/Text';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../Button/Primary/Primary';
import { Row, Col, Form, Input } from 'antd';
import ContentLanguageInput from '../../ContentLanguageInput/ContentLanguageInput';
import { contentLanguage } from '../../../constants/contentLanguage';
import BilingualInput from '../../BilingualInput/BilingualInput';
import ImageUpload from '../../ImageUpload/ImageUpload';
import StyledInput from '../../Input/Common';
import { useAddImageMutation } from '../../../services/image';
import { useAddOrganizationMutation } from '../../../services/organization';

const { TextArea } = Input;

function QuickCreateOrganization(props) {
  const { open, setOpen, calendarContentLanguage, calendarId } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const [addImage] = useAddImageMutation();
  const [addOrganization] = useAddOrganizationMutation();

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
                  .then(() => {
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
            .then(() => {
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
      title={<span>{t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.title')}</span>}
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
      <Row gutter={[0, 10]}>
        <Col span={24}>
          <Form form={form} layout="vertical" name="organizerForm" preserve={false}>
            <Row>
              <Col>
                <p className="add-event-date-heading">
                  {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.subHeading')}
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="add-event-date-heading">
                  {t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.name')}
                </p>
              </Col>
            </Row>
            <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
              <BilingualInput>
                <Form.Item
                  name="french"
                  key={contentLanguage.FRENCH}
                  dependencies={['english']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value || getFieldValue('english')) {
                          return Promise.resolve();
                        } else return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                      },
                    }),
                  ]}>
                  <TextArea
                    autoSize
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                    style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '100%' }}
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="english"
                  dependencies={['french']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value || getFieldValue('french')) {
                          return Promise.resolve();
                        } else return Promise.reject(new Error(t('dashboard.events.addEditEvent.validations.title')));
                      },
                    }),
                  ]}>
                  <TextArea
                    autoSize
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.language.placeHolderEnglish')}
                    style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '100%' }}
                    size="large"
                  />
                </Form.Item>
              </BilingualInput>
            </ContentLanguageInput>
            <Form.Item
              name="contactWebsiteUrl"
              className="subheading-wrap"
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
                placeholder={t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderWebsite')}
              />
            </Form.Item>
            <Form.Item
              label={t('dashboard.events.addEditEvent.quickCreate.quickCreateOrganization.logo')}
              name="draggerWrap"
              className="draggerWrap"
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
                  <p className="add-event-date-heading">
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
