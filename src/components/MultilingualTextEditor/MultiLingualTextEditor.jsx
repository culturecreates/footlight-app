import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextEditor from '../TextEditor';
import MultilingualInput from '../MultilingualInput';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import { languageFallbackStatusCreator } from '../../utils/languageFallbackStatusCreator';
import { useOutletContext } from 'react-router-dom';
import { getActiveFallbackFieldsInfo, setActiveFallbackFieldsInfo } from '../../redux/reducer/languageLiteralSlice';
import { useDispatch, useSelector } from 'react-redux';
import LiteralBadge from '../Badge/LiteralBadge';
import { removeEmptyParagraphsAtEnd } from '../../utils/removeEmptyParagraphsAtEnd';

/**
 * MultiLingualTextEditor component handles multilingual text input using React Quill editors.
 * It supports dynamic rules and fallback language prompts.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.name - The name of the form field.
 * @param {Object} props.data - The initial data for the text editors.
 * @param {Object} props.placeholder - Placeholder text for each language.
 * @param {string[]} props.calendarContentLanguage - Array of language keys.
 * @param {string} props.entityId - The entity id.
 * @param {boolean} props.required - Flag to indicate if the field is required.
 * @param {Object} props.form - The form instance from Ant Design.
 * @param {number || undefined} props.descriptionMinimumWordCount - Minimum word count for description.
 *
 * @returns {JSX.Element} The rendered component, ie a text editor for each content language is wrapped in multilingual input.
 */

function MultiLingualTextEditor(props) {
  const { name, data, placeholder, entityId, calendarContentLanguage, required, form, descriptionMinimumWordCount } =
    props;

  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();
  const reactQuillRefs = useRef(
    calendarContentLanguage.reduce((acc, lang) => {
      acc[lang] = React.createRef();
      return acc;
    }, {}),
  );

  let combinedName = calendarContentLanguage.map((language) => `${name}` + contentLanguageKeyMap[language]).join('-');
  let isFieldsDirty = {}; // to keep track of dirty fields
  calendarContentLanguage.forEach((language) => {
    const lanKey = contentLanguageKeyMap[language];
    const fieldName = [`${name}`, lanKey];
    isFieldsDirty[lanKey] = form.isFieldTouched(fieldName);
  });

  // Function to generate rules based on language
  const generateRules = (language) => [
    required
      ? () => ({
          validator() {
            const currentEditor = reactQuillRefs.current[language]?.current?.getEditor();
            const currentEditorLength = currentEditor?.getLength() || 0;
            const otherEditors = calendarContentLanguage
              .filter((lang) => lang !== language)
              .map((lang) => reactQuillRefs.current[lang]?.current?.getEditor()?.getLength() || 0);

            if (currentEditorLength > 1 || otherEditors.some((length) => length > 1)) {
              return Promise.resolve();
            } else {
              return Promise.reject(
                new Error(
                  calendarContentLanguage.includes(language)
                    ? t('dashboard.organization.createNew.validations.unilingualEmptyDescription')
                    : t('dashboard.organization.createNew.validations.emptyDescription', {
                        wordCount: descriptionMinimumWordCount,
                      }),
                ),
              );
            }
          },
        })
      : [],
    descriptionMinimumWordCount && descriptionMinimumWordCount > 1
      ? () => ({
          validator() {
            const currentEditor = reactQuillRefs.current[language]?.current?.getEditor();
            const currentTextLength = currentEditor
              ?.getText()
              .trim()
              .split(/\s+/)
              .filter((n) => n !== '').length;
            const otherTextLengths = calendarContentLanguage
              .filter((lang) => lang !== language)
              .map(
                (lang) =>
                  reactQuillRefs.current[lang]?.current
                    ?.getEditor()
                    ?.getText()
                    .trim()
                    .split(/\s+/)
                    .filter((n) => n !== '').length,
              );

            if (
              currentTextLength >= descriptionMinimumWordCount ||
              otherTextLengths.some((length) => length >= descriptionMinimumWordCount)
            ) {
              return Promise.resolve();
            } else {
              return Promise.reject(
                new Error(
                  calendarContentLanguage.includes(language)
                    ? t('dashboard.organization.createNew.validations.unilingualDescriptionShort')
                    : t('dashboard.organization.createNew.validations.shortDescription'),
                ),
              );
            }
          },
        })
      : [],
  ];

  // Fallback status and prompt text config for text editors

  const dispatch = useDispatch();
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);

  const [isInitialRender, setIsInitialRender] = useState(true);
  const [fallbackStatus, setFallbackStatus] = useState(null);
  const [fallbackPromptTextCollection, setFallbackPromptTextCollection] = useState({});

  useEffect(() => {
    if (!currentCalendarData) return;

    const currentActiveDataInFormFields = {};
    calendarContentLanguage.forEach((language) => {
      const languageKey = contentLanguageKeyMap[language];
      currentActiveDataInFormFields[languageKey] = form.getFieldValue([`${name}`, languageKey]);
    });

    const status = languageFallbackStatusCreator({
      calendarContentLanguage,
      fieldData: data,
      languageFallbacks: currentCalendarData.languageFallbacks,
      isFieldsDirty,
      currentActiveDataInFormFields,
    });

    // Only update fallbackStatus if it has actually changed
    if (JSON.stringify(status) !== JSON.stringify(fallbackStatus)) {
      setFallbackStatus(status);
    }
  }, [isFieldsDirty]);

  useEffect(() => {
    // fallback prompt text creation for each required tab
    const collection = {};
    const fallbackKeys = fallbackStatus ? Object.keys(fallbackStatus) : [];
    fallbackKeys.length > 0 &&
      fallbackKeys.forEach((key) => {
        collection[key] =
          fallbackStatus?.[key]?.fallbackLiteralKey == '?'
            ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
            : t('common.forms.languageLiterals.knownLanguagePromptText');
      });
    setFallbackPromptTextCollection(collection);
  }, [fallbackStatus]);

  useEffect(() => {
    const modifiedActiveFallbackFieldsInfo = {
      ...activeFallbackFieldsInfo,
      [combinedName]: fallbackStatus,
    };

    const fallbackActiveFlag = calendarContentLanguage.find((language) => {
      const languageKey = contentLanguageKeyMap[language];
      return fallbackStatus?.[languageKey]?.tagDisplayStatus;
    });
    const hasDirtyFields = Object.values(isFieldsDirty).some((value) => value == true);
    if (fallbackActiveFlag)
      dispatch(setActiveFallbackFieldsInfo({ data: modifiedActiveFallbackFieldsInfo, method: 'add' }));
    else if (hasDirtyFields) {
      // eslint-disable-next-line no-unused-vars
      const { [combinedName]: _, ...rest } = activeFallbackFieldsInfo;
      dispatch(setActiveFallbackFieldsInfo({ data: rest, method: 'remove' }));
    }
    if (fallbackStatus != null) {
      setIsInitialRender(false);
    }
  }, [fallbackStatus]);

  return (
    !isInitialRender && (
      <MultilingualInput
        fieldData={data}
        required={required}
        entityId={entityId}
        calendarContentLanguage={calendarContentLanguage}
        skipChildModification={true}>
        {calendarContentLanguage.map((language) => {
          const languageKey = contentLanguageKeyMap[language];
          let initialValue = data?.[languageKey] || fallbackStatus?.[languageKey]?.fallbackLiteralValue;
          const tagDisplayStatus = fallbackStatus?.[languageKey]?.tagDisplayStatus;
          const fallbackLiteralKey = fallbackStatus?.[languageKey]?.fallbackLiteralKey;
          const promptText = fallbackPromptTextCollection[languageKey];

          // Check if initialValue is a string and in correct format
          if (typeof initialValue === 'string' && !/^<p>.*<\/p>$/.test(initialValue.trim()))
            initialValue = `<p>${initialValue}</p>`;

          return (
            <div key={language}>
              <TextEditor
                formName={[`${name}`, languageKey]}
                initialValue={removeEmptyParagraphsAtEnd(initialValue)}
                calendarContentLanguage={calendarContentLanguage}
                editorLanguage={languageKey}
                placeholder={placeholder?.[languageKey]}
                descriptionMinimumWordCount={descriptionMinimumWordCount}
                currentReactQuillRef={reactQuillRefs.current[language]}
                rules={generateRules(language)}
                form={form}
              />
              {tagDisplayStatus && <LiteralBadge tagTitle={fallbackLiteralKey} promptText={promptText} />}
            </div>
          );
        })}
      </MultilingualInput>
    )
  );
}

export default MultiLingualTextEditor;
