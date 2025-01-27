import React, { useEffect } from 'react';
import { Form, Input } from 'antd';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text';
import PrimaryButton from '../../Button/Primary';
import { useTranslation } from 'react-i18next';
import { IMAGE_ACTIONS } from '../../../constants/imageUploadOptions';

const { TextArea } = Input;

const ImageCredits = (props) => {
  const { t } = useTranslation();

  const {
    open,
    setOpen,
    selectedField,
    imageCreditInitialValues,
    isImageGallery,
    form,
    imageOptions,
    setImageOptions,
  } = props;
  const { initialCredit, initialAltText, initialCaption } = imageCreditInitialValues;

  let formItems = [
    {
      label: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.credit.label',
      title: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.credit.title',
      key: IMAGE_ACTIONS.CREDIT,
      name: 'credit',
      placeholder: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.credit.placeholder',
    },
    {
      label: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.altText.label',
      title: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.altText.title',
      key: IMAGE_ACTIONS.ALT_TEXT,
      name: 'altText',
      placeholder: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.altText.placeholder',
    },
    {
      label: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.caption.label',
      title: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.caption.title',
      key: IMAGE_ACTIONS.CAPTION,
      name: 'caption',
      placeholder: 'dashboard.events.addEditEvent.otherInformation.image.modalTexts.caption.placeholder',
    },
  ];
  let selectedTitle = formItems.find((item) => item.key === selectedField)?.title;

  const onFinish = () => {
    if (!isImageGallery) {
      form.setFieldValue('mainImageOptions', imageOptions);
    }
    setOpen(false);
  };

  useEffect(() => {
    setImageOptions({ credit: initialCredit, altText: initialAltText, caption: initialCaption });
  }, [initialCredit, initialAltText, initialCaption]);

  return (
    <CustomModal
      closable={true}
      title={
        <div className="custom-modal-title-wrapper" data-cy="div-image-options-heading">
          <span className="custom-modal-title-heading" data-cy="span-image-options-heading">
            {selectedTitle && t(selectedTitle)}
          </span>
        </div>
      }
      open={open}
      footer={[
        <TextButton
          key="cancel"
          size="large"
          label={t('dashboard.events.addEditEvent.otherInformation.image.modalTexts.cancel')}
          onClick={() => {
            setImageOptions({ credit: initialCredit, altText: initialAltText, caption: initialCaption });
            setOpen(false);
          }}
          data-cy="button-cancel-image-options"
        />,
        <PrimaryButton
          key="add-dates"
          label={t('dashboard.events.addEditEvent.otherInformation.image.modalTexts.save')}
          onClick={onFinish}
          data-cy="button-save-image-options"
        />,
      ]}
      className="image-credit-modal">
      {formItems.map((item, index) => (
        <Form layout="vertical" name="imageDetails" key={index} data-cy="form-image-options">
          <Form.Item label={t(item.label)} hidden={selectedField !== item.key} data-cy="form-item-image-options">
            <TextArea
              value={imageOptions[item.name]}
              onChange={(e) => setImageOptions({ ...imageOptions, [item.name]: e.target.value })}
              autoSize
              autoComplete="off"
              style={{
                borderRadius: '4px',
                border: '1px solid #B6C1C9',
                width: '423px',
              }}
              size="large"
              placeholder={t(item.placeholder)}
              data-cy={`textarea-${item.name}`}
            />
          </Form.Item>
        </Form>
      ))}
    </CustomModal>
  );
};

export default ImageCredits;
