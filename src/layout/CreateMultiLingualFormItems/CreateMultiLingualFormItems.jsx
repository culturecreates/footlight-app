import React, { useEffect } from 'react';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import MultilingualInput from '../../components/MultilingualInput';
import { useWatch } from 'antd/lib/form/Form';

/**
 * CreateMultiLingualFormItems Component
 *
 * This component generates multilingual form items for each content language of calendar.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - React elements to be rendered inside form items.
 * @param {Array<string>} props.calendarContentLanguage - An array of languages to be displayed as form items.
 * @param {Object} props.form - The form instance from Ant Design.
 * @param {Array<string>} props.name - Field name/path.
 * @param {Object} props.data - Initial field values
 * @param {boolean} props.required - Whether the field is required.
 * @param {string} [props.validations] - Custom validation message.
 * @param {string} props.dataCy - Test attribute prefix
 * @param {string} props.entityId - The entity id.
 * @param {Object} props.placeholder - Placeholder texts for the form items.
 *
 * @returns {React.Element} MultilingualInput component with processed form items as children.
 */

const CreateMultiLingualFormItems = ({ children, ...rest }) => {
  const {
    calendarContentLanguage,
    form,
    name,
    data,
    required,
    validations,
    dataCy,
    placeholder,
    entityId,
    formItemProps = {},
    namePrefix = [],
    ...additionalProps
  } = rest;
  const { t } = useTranslation();

  // Determine if this is in a Form.List context by checking name structure
  const isListContext = Array.isArray(name) && name.length > 1;

  // Relative path used for Form.Item name (antd resolves it against the surrounding Form.List).
  const relativePath = (lanKey) => (isListContext ? [...name, lanKey] : [name, lanKey]);

  // Absolute path used for imperative form API calls (getFieldValue/setFieldValue/isFieldTouched/useWatch).
  // In a Form.List, the Form.Item name is relative, so imperative calls must be prefixed with the list path.
  const absolutePath = (lanKey) => (isListContext ? [...namePrefix, ...name, lanKey] : [name, lanKey]);

  // Watch all language-specific field paths to trigger re-renders when any language field changes
  const fieldPathsToWatch =
    calendarContentLanguage?.map((language) => {
      const lanKey = contentLanguageKeyMap[language];
      return absolutePath(lanKey);
    }) || [];

  useWatch(fieldPathsToWatch, form);

  useEffect(() => {
    if (!data || !form) return;
    calendarContentLanguage?.forEach((language) => {
      const lanKey = contentLanguageKeyMap[language];
      const content = data?.[lanKey];
      const value = Array.isArray(content) ? content[0] : content;
      if (value !== undefined && !form.isFieldTouched(absolutePath(lanKey))) {
        form.setFieldValue(absolutePath(lanKey), value);
      }
    });
  }, [data, form, calendarContentLanguage, name, namePrefix]);

  // Track dirty fields
  const isFieldDirty = {};
  const dataCyCollection = [];
  const placeholderCollection = [];

  calendarContentLanguage?.forEach((language) => {
    const lanKey = contentLanguageKeyMap[language];
    isFieldDirty[lanKey] = form.isFieldTouched(absolutePath(lanKey));
  });

  const formItemList = calendarContentLanguage?.map((language) => {
    const lanKey = contentLanguageKeyMap[language];
    const dependencies = calendarContentLanguage
      .filter((lan) => lan !== language)
      .map((lan) => (isListContext ? [...name, contentLanguageKeyMap[lan]] : [name, contentLanguageKeyMap[lan]]));

    dataCyCollection.push(`${dataCy}${language.toLowerCase()}`);
    placeholderCollection.push(placeholder[lanKey] ?? '');

    const validationRules = required
      ? [
          ({ getFieldValue }) => ({
            validator(_, value) {
              const dependenciesValues = dependencies.map((dependency) => getFieldValue(dependency));
              const isAnyDependencyFilled = dependenciesValues.some(
                (dependencyValue) => dependencyValue !== undefined && dependencyValue !== '',
              );

              if (value || isAnyDependencyFilled) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(validations ?? t('common.validations.informationRequired')));
            },
          }),
        ]
      : undefined;

    const content = data?.[lanKey];
    const initialValue = Array.isArray(content) ? content[0] : content;

    return (
      <Form.Item
        {...formItemProps}
        name={relativePath(lanKey)}
        key={language}
        dependencies={dependencies}
        initialValue={!isListContext ? initialValue : undefined}
        rules={validationRules}>
        {children}
      </Form.Item>
    );
  });

  return (
    <MultilingualInput
      fieldData={data}
      calendarContentLanguage={calendarContentLanguage}
      isFieldsDirty={isFieldDirty}
      entityId={entityId}
      dataCyCollection={dataCyCollection}
      required={required}
      form={form}
      namePrefix={namePrefix}
      placeholderCollection={placeholderCollection}
      {...additionalProps}>
      {formItemList}
    </MultilingualInput>
  );
};

export default CreateMultiLingualFormItems;
