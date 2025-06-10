/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import './imageCredits.css';
import { Form, Input } from 'antd';
import CustomModal from '../Common/CustomModal';
import TextButton from '../../Button/Text';
import PrimaryButton from '../../Button/Primary';
import { useTranslation } from 'react-i18next';
import { IMAGE_ACTIONS } from '../../../constants/imageUploadOptions';
import CreateMultiLingualFormItems from '../../../layout/CreateMultiLingualFormItems';
import { placeHolderCollectionCreator } from '../../../utils/MultiLingualFormItemSupportFunctions';
import { filterNonEmptyValues } from '../../../utils/filterNonEmptyValues';
import { languageFallbackStatusCreator } from '../../../utils/languageFallbackStatusCreator';
import { useOutletContext } from 'react-router-dom';
import { contentLanguageKeyMap } from '../../../constants/contentLanguage';
import { useDispatch, useSelector } from 'react-redux';
import { getActiveFallbackFieldsInfo, setActiveFallbackFieldsInfo } from '../../../redux/reducer/languageLiteralSlice';
import { filterUneditedFallbackValues } from '../../../utils/removeUneditedFallbackValues';

const { TextArea } = Input;

const ImageCredits = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [currentCalendarData] = useOutletContext();

  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);

  const [fallbackStatus, setFallbackStatus] = useState({
    credit: null,
    altText: null,
    caption: null,
  });

  const modalContentRef = useRef(null);

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

  const checkIfFieldIsDirty = (values = {}, fieldName) => {
    const isFieldsDirty = {};

    Object.keys(values).forEach((language) => {
      isFieldsDirty[language] = form.isFieldTouched([fieldName, language]);
    });
    return isFieldsDirty;
  };

  const onFinish = () => {
    form.validateFields(formItems.map((item) => item.name)).then((values) => {
      const filteredValues = {};

      Object.keys(values).forEach((key) => {
        filteredValues[key] = filterUneditedFallbackValues({
          values: filterNonEmptyValues(values[key]),
          activeFallbackFieldsInfo,
          fieldName: key,
        });
      });

      Object.keys(values).forEach((key) => {
        if (values[key]) {
          const isFieldsDirty = checkIfFieldIsDirty(values[key], key);

          const computedFallbackStatus = languageFallbackStatusCreator({
            calendarContentLanguage,
            fieldData: filteredValues[key],
            languageFallbacks: currentCalendarData.languageFallbacks,
            isFieldsDirty,
            currentActiveDataInFormFields: filteredValues[key],
          });

          setFallbackStatus((prev) => ({
            ...prev,
            [key]: computedFallbackStatus,
          }));
        } else {
          setFallbackStatus((prev) => ({
            ...prev,
            [key]: null,
          }));
        }
      });

      if (!isImageGallery) {
        const updatedImageOptions = { ...imageOptions, ...filteredValues };
        form.setFieldValue('mainImageOptions', updatedImageOptions);
        setImageOptions(updatedImageOptions);
      } else {
        setFileList((prev) => {
          const index = prev.findIndex((file) => file.uid === selectedUID);
          if (index !== -1) {
            const newFileList = [...prev];
            newFileList[index] = {
              ...prev[index],
              imageOptions: { ...prev[index].imageOptions, ...filteredValues },
            };
            form.setFieldsValue({ multipleImagesCrop: newFileList });
            return newFileList;
          }
          return prev;
        });

        setSelectedUID(null);
      }

      setOpen(false);
    });
  };

  const onClose = () => {
    formItems.forEach((item) => {
      if (item.key === selectedField) {
        const formValues = form.getFieldsValue();

        const currentItemValues = formValues[item.name];

        // Create combined name similar to the hook version
        let combinedName = '';
        if (currentItemValues) {
          combinedName = Object.keys(currentItemValues)
            .map((langKey) => `${item.name}${langKey}`)
            .join('-');
        }

        let fallbackValidValues = {};
        Object.keys(activeFallbackFieldsInfo[combinedName] || {}).forEach((key) => {
          if (activeFallbackFieldsInfo[combinedName][key]?.tagDisplayStatus) {
            const fallbackLiteralValue = activeFallbackFieldsInfo[combinedName][key]?.fallbackLiteralValue;
            fallbackValidValues[key] = fallbackLiteralValue?.trim();
          }
        });

        form.setFieldValue(item.name, { ...fallbackValidValues, ...imageOptions[item.name] });
        setOpen(false);
      }
    });
    if (selectedUID) setSelectedUID(null);
    setOpen(false);
  };

  useEffect(() => {
    if (!selectedField) return;

    const formValues = form.getFieldsValue();
    const itemName = formItems.find((item) => item.key === selectedField)?.name;
    const currentItemValues = formValues[itemName];

    // Create combined name similar to the hook version
    let combinedName = '';
    if (currentItemValues) {
      combinedName = Object.keys(currentItemValues)
        .map((langKey) => `${itemName}${langKey}`)
        .join('-');
    }

    const sanitizedValues = filterUneditedFallbackValues({
      values: currentItemValues,
      activeFallbackFieldsInfo,
      fieldName: itemName,
    });

    const isFieldsDirty = checkIfFieldIsDirty(sanitizedValues, itemName);

    const modifiedActiveFallbackFieldsInfo = {
      ...activeFallbackFieldsInfo,
      [combinedName]: fallbackStatus[itemName],
    };

    // Check if any language has active fallback for this field
    const fallbackActiveFlag = calendarContentLanguage.some((language) => {
      const languageKey = contentLanguageKeyMap[language];
      return fallbackStatus[itemName]?.[languageKey]?.tagDisplayStatus;
    });

    const hasDirtyFields = Object.values(isFieldsDirty).some(Boolean);

    if (fallbackActiveFlag) {
      dispatch(
        setActiveFallbackFieldsInfo({
          data: modifiedActiveFallbackFieldsInfo,
          method: 'add',
        }),
      );
    } else if (hasDirtyFields) {
      const { [combinedName]: _, ...rest } = activeFallbackFieldsInfo;
      dispatch(setActiveFallbackFieldsInfo({ data: rest, method: 'remove' }));
    }
  }, [fallbackStatus, selectedField]);

  useEffect(() => {
    if (!selectedField) return;

    const formValues = form.getFieldsValue();
    const itemName = formItems.find((item) => item.key === selectedField)?.name;
    const currentItemValues = formValues[itemName];

    // Create combined name similar to the hook version
    let combinedName = '';
    if (currentItemValues) {
      combinedName = Object.keys(currentItemValues)
        .map((langKey) => `${itemName}${langKey}`)
        .join('-');
    }

    if (!combinedName) return;

    const fallbackInfo = activeFallbackFieldsInfo[combinedName] || {};

    Object.keys(fallbackInfo).forEach((key) => {
      const fallbackLiteralValue = fallbackInfo?.[key]?.fallbackLiteralValue;

      form.setFieldValue([itemName, key], fallbackLiteralValue);
    });
  }, [activeFallbackFieldsInfo, selectedField]);

  useEffect(() => {
    if (modalContentRef.current) {
      const firstInput = modalContentRef.current.querySelector('textarea');

      if (firstInput) {
        setTimeout(function () {
          firstInput.focus();
        }, 100);
      }
    }
  }, [props.open]);

  return (
    <CustomModal
      closable={true}
      maskClosable={true}
      onCancel={onClose}
      modalRender={(node) => {
        return <div ref={modalContentRef}>{node}</div>;
      }}
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
          className="image-credit-form-item"
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
                width: '100%',
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
