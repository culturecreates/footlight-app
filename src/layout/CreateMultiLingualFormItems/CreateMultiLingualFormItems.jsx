import React, { useState } from 'react';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import MultilingualInput from '../../components/MultilingualInput';

/**
 * CreateMultiLingualFormItems Component
 *
 * This component generates multilingual form items for each content language of calendar.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - React elements to be rendered inside form items.
 * @param {Array<string>} props.calendarContentLanguage - An array of languages to be displayed as form items.
 * @param {Object} props.form - The form instance from Ant Design.
 * @param {Array<string>} props.name - The name of the form field.
 * @param {Object} props.data - The initial data for the form fields.
 * @param {boolean} props.required - Whether the form items are required.
 * @param {string} [props.validations] - Custom validation message.
 * @param {string} props.dataCy - The data-cy attribute for testing purposes.
 * @param {string} props.entityId - The entity id.
 * @param {Object} props.placeholder - Placeholder texts for the form items.
 *
 * @returns {React.Element} MultilingualInput component with processed form items as children.
 */

const CreateMultiLingualFormItems = ({ children, ...rest }) => {
  const { calendarContentLanguage, form, name, data, required, validations, dataCy, placeholder, entityId } = rest;
  const { t } = useTranslation();

  // State to track dirty fields
  const [isFieldDirty, setIsFieldDirty] = useState({});

  let dataCyCollection = [];
  let placeholderCollection = [];

  const formItemList = calendarContentLanguage.map((language) => {
    const lanKey = contentLanguageKeyMap[language];
    const dependencies = calendarContentLanguage // dependencies for each form item
      .filter((lan) => lan !== language)
      .map((lan) => [name, contentLanguageKeyMap[lan]]);

    dataCyCollection.push(`${dataCy}${language.toLowerCase()}`);
    placeholderCollection.push(placeholder[lanKey] ?? '');

    const validationRules = required // validation rules for each form item
      ? [
          ({ getFieldValue }) => ({
            validator(_, value) {
              const dependenciesValues = dependencies.map((dependency) => getFieldValue(dependency));
              const isAnyDependencyFilled = dependenciesValues.some(
                (dependencyValue) => dependencyValue !== undefined && dependencyValue !== '',
              );

              if (value || isAnyDependencyFilled) {
                return Promise.resolve();
              } else return Promise.reject(new Error(validations ?? t('common.validations.informationRequired')));
            },
          }),
        ]
      : undefined;

    return (
      <Form.Item
        name={[`${name}`, lanKey]}
        key={language}
        dependencies={dependencies}
        initialValue={data?.[lanKey]}
        rules={validationRules}
        shouldUpdate={() => {
          const updatedIsFieldDirty = {};
          calendarContentLanguage.forEach((language) => {
            const lanKey = contentLanguageKeyMap[language];
            const fieldName = name.concat([lanKey]);
            updatedIsFieldDirty[lanKey] = form.isFieldTouched(fieldName);
          });
          setIsFieldDirty(updatedIsFieldDirty);
          return true;
        }}>
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
      placeholderCollection={placeholderCollection}>
      {formItemList}
    </MultilingualInput>
  );
};

export default CreateMultiLingualFormItems;
