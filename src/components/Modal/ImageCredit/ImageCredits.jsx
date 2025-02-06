import React from 'react';
import './imageCredits.css';
import { Form, Input } from 'antd';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text';
import PrimaryButton from '../../Button/Primary';
import { useTranslation } from 'react-i18next';
import { IMAGE_ACTIONS } from '../../../constants/imageUploadOptions';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems';
import { placeHolderCollectionCreator } from '../../../utils/MultiLingualFormItemSupportFunctions';

const { TextArea } = Input;

const ImageCredits = (props) => {
  const { t } = useTranslation();

  const {
    open,
    setOpen,
    selectedField,
    isImageGallery,
    form,
    imageOptions,
    setImageOptions,
    setFileList,
    selectedUID,
    setSelectedUID,
    calendarContentLanguage,
  } = props;
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
      formItems.forEach((item) => {
        if (item.key === selectedField) {
          form.validateFields([item.name]).then((values) => {
            setImageOptions({
              ...imageOptions,
              [item.name]: values[item.name],
            });
            form.setFieldValue('mainImageOptions', {
              ...imageOptions,
              [item.name]: values[item.name],
            });
            setOpen(false);
          });
        }
      });
    } else {
      formItems.forEach((item) => {
        if (item.key === selectedField) {
          form.validateFields([item.name]).then((values) => {
            setFileList((prev) => {
              const index = prev.findIndex((file) => file.uid === selectedUID);
              const newFile = {
                ...prev[index],
                imageOptions: {
                  ...prev[index].imageOptions,
                  [item.name]: values[item.name],
                },
              };
              prev[index] = newFile;
              form.setFieldsValue({
                multipleImagesCrop: [...prev],
              });
              return [...prev];
            });
          });
        }
      });

      setSelectedUID(null);
    }

    setOpen(false);
  };

  const onClose = () => {
    formItems.forEach((item) => {
      if (item.key === selectedField) {
        form.setFieldValue(item.name, imageOptions[item.name]);
        setOpen(false);
      }
    });
    if (selectedUID) setSelectedUID(null);
    setOpen(false);
  };

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
          <CreateMultiLingualFormItems
            calendarContentLanguage={calendarContentLanguage}
            form={form}
            name={[`${item.name}`]}
            data={imageOptions[item.name]}
            dataCy={`textarea-${item.name}`}
            placeholder={placeHolderCollectionCreator({
              calendarContentLanguage,
              placeholderBase: item.placeholder,
              t,
            })}>
            <TextArea
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
          </CreateMultiLingualFormItems>
        </Form.Item>
      ))}
    </CustomModal>
  );
};

export default ImageCredits;
