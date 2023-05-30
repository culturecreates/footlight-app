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

const { TextArea } = Input;

function QuickCreateOrganization(props) {
  const { open, onCancel, onOk, form, calendarContentLanguage } = props;
  const { t } = useTranslation();

  return (
    <CustomModal
      open={open}
      title={<span>Create an organizer</span>}
      onCancel={onCancel}
      onOk={onOk}
      footer={[
        <TextButton key="cancel" size="large" label={t('dashboard.events.addEditEvent.dates.cancel')} />,
        <PrimaryButton key="add-dates" label={t('dashboard.events.addEditEvent.dates.addDates')} />,
      ]}>
      <Row gutter={[0, 10]}>
        <Col span={24}>
          <Form form={form} layout="vertical" name="organizerForm">
            <Row>
              <Col>
                <p className="add-event-date-heading">
                  {t('dashboard.events.addEditEvent.otherInformation.supporter.subHeading')}
                </p>
              </Col>
            </Row>
            <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
              <BilingualInput>
                <Form.Item name="french" key={contentLanguage.FRENCH} dependencies={['english']}>
                  <TextArea
                    autoSize
                    autoComplete="off"
                    placeholder={t('dashboard.events.addEditEvent.language.placeHolderFrench')}
                    style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                    size="large"
                  />
                </Form.Item>
                <Form.Item name="english" dependencies={['french']}>
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
              label={t('dashboard.events.addEditEvent.otherInformation.image.title')}
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
                    {t('dashboard.events.addEditEvent.otherInformation.image.subHeading')}
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
