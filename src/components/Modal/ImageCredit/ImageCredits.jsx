import React, { useEffect } from 'react';
import './imageCredits.css';
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
    fileList,
    setFileList,
    selectedUID,
    setSelectedUID,
  } = props;
  const { initialCredit, initialAltText, initialCaption } = imageCreditInitialValues || {};
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
    } else {
      setFileList((prev) => {
        const index = prev.findIndex((file) => file.uid === selectedUID);
        const newFile = { ...prev[index], imageOptions };
        prev[index] = newFile;
        return [...prev];
      });
      setSelectedUID(null);
      form.setFieldsValue({
        multipleImagesCrop: fileList,
      });
    }

    setOpen(false);
  };

  const onClose = () => {
    if (selectedField === IMAGE_ACTIONS.CREDIT) {
      setImageOptions({
        credit: initialCredit,
        ...imageOptions,
      });
    } else if (selectedField === IMAGE_ACTIONS.ALT_TEXT) {
      setImageOptions({
        altText: initialAltText,
        ...imageOptions,
      });
    } else if (selectedField === IMAGE_ACTIONS.CAPTION) {
      setImageOptions({
        caption: initialCaption,
        ...imageOptions,
      });
    }
    if (selectedUID) setSelectedUID(null);
    setOpen(false);
  };

  useEffect(() => {
    if (!selectedUID) setImageOptions({ credit: initialCredit, altText: initialAltText, caption: initialCaption });
  }, [initialCredit, initialAltText, initialCaption]);

  return (
    <CustomModal
      closable={true}
      maskClosable={true}
      onCancel={onClose}
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
          onClick={onClose}
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
      <Form layout="vertical" name="imageDetails" data-cy="form-image-options" className="form-image-options">
        {selectedField === IMAGE_ACTIONS.ALT_TEXT && (
          <p className="add-alt-text-description" data-cy="para-alt-text-description">
            {t('dashboard.events.addEditEvent.otherInformation.image.modalTexts.altText.description')}
          </p>
        )}
        {formItems.map((item, index) => (
          <Form.Item
            label={t(item.label)}
            hidden={selectedField !== item.key}
            data-cy="form-item-image-options"
            key={index}>
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
        ))}
      </Form>
    </CustomModal>
  );
};

export default ImageCredits;
