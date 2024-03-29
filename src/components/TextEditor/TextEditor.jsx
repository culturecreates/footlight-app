import { Form } from 'antd';
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import './textEditor.css';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';
import { pluralize } from '../../utils/pluralise';
import OutlinedButton from '../Button/Outlined';
import { contentLanguage } from '../../constants/contentLanguage';
function TextEditor(props) {
  const {
    formName,
    initialValue,
    dependencies,
    rules,
    currentReactQuillRef,
    placeholder,
    editorLanguage,
    descriptionMinimumWordCount,
    calendarContentLanguage,
  } = props;
  let translateTo;

  if (editorLanguage == 'en') {
    translateTo = 'fr';
  } else {
    translateTo = 'en';
  }

  const { t } = useTranslation();
  const [wordCount, setWordCount] = useState(
    currentReactQuillRef?.current?.unprivilegedEditor
      ?.getText()
      .split(' ')
      ?.filter((n) => n != '').length,
  );
  const modules = {
    toolbar: [
      [{ header: '1' }],
      ['bold', 'italic', 'underline'],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      ['link'],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const onChange = () => {
    const filteredCount = currentReactQuillRef?.current?.unprivilegedEditor
      ?.getText()
      ?.split(' ')
      ?.filter((n) => n != '');
    filteredCount &&
      setWordCount(
        filteredCount[filteredCount.length - 1] === '\n' && filteredCount?.length == 1
          ? filteredCount?.length - 1
          : filteredCount?.length,
      );
  };

  const translateHandler = () => {
    let newString = currentReactQuillRef?.current?.unprivilegedEditor?.getText();
    //Note: Replace "/" with "\/"// //Note: Replace "/" with "\/"
    newString = newString?.replace(/\//g, '\\/');
    // //Note: Replace "|" with "\|"
    newString = newString?.replace(/\|/g, '\\|');
    newString = encodeURIComponent(newString);
    window.open(`${process.env.REACT_APP_DEEPL_URL}${editorLanguage}/${translateTo}/${newString}`);
  };

  useEffect(() => {
    const filteredCount = currentReactQuillRef?.current?.unprivilegedEditor
      ?.getText()
      ?.split(' ')
      ?.filter((n) => n != '');
    filteredCount &&
      setWordCount(
        filteredCount[filteredCount.length - 1] === '\n' && filteredCount?.length == 1
          ? filteredCount?.length - 1
          : filteredCount?.length,
      );
  }, [
    currentReactQuillRef?.current?.unprivilegedEditor
      ?.getText()
      ?.split(' ')
      .filter((n) => n != '')?.length,
  ]);

  return (
    <>
      <Form.Item name={formName} initialValue={initialValue} dependencies={dependencies} rules={rules}>
        <ReactQuill
          ref={currentReactQuillRef}
          placeholder={placeholder}
          className="text-editor"
          modules={modules}
          style={{
            border: `${
              calendarContentLanguage === contentLanguage.BILINGUAL ? '4px solid #E8E8E8' : '1px solid #b6c1c9'
            }`,
          }}
          preserveWhitespace
          onChange={onChange}
          data-cy="text-editor"
        />
      </Form.Item>
      <div className="event-description-footer">
        {descriptionMinimumWordCount > 1 ? (
          <p data-cy="para-description-footer-title">
            {t('dashboard.events.addEditEvent.otherInformation.description.footerTitle', {
              wordCount: descriptionMinimumWordCount,
            })}
          </p>
        ) : (
          <div></div>
        )}
        <p data-cy="description-word-count">
          {pluralize(wordCount, t('dashboard.events.addEditEvent.otherInformation.description.word'))}
        </p>
      </div>
      {calendarContentLanguage === contentLanguage.BILINGUAL && (
        <OutlinedButton
          label={t('dashboard.events.addEditEvent.otherInformation.description.translate')}
          size="middle"
          disabled={wordCount > 1 ? false : true}
          onClick={translateHandler}
          data-cy="button-translate"
        />
      )}
    </>
  );
}
export default TextEditor;
