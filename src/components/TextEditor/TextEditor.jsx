import { Form } from 'antd';
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import './textEditor.css';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';
import { pluralize } from '../../utils/pluralise';
import OutlinedButton from '../Button/Outlined';
function TextEditor(props) {
  const { formName, initialValue, dependencies, rules, currentReactQuillRef, placeholder, editorLanguage } = props;
  let translateTo;

  if (editorLanguage == 'en') {
    translateTo = 'fr';
  } else {
    translateTo = 'en';
  }

  const { t } = useTranslation();
  const [wordCount, setWordCount] = useState(
    currentReactQuillRef?.current?.unprivilegedEditor?.getText().split(' ').length,
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
    setWordCount(currentReactQuillRef?.current?.unprivilegedEditor?.getText().split(' ').length);
  };

  useEffect(() => {
    setWordCount(currentReactQuillRef?.current?.unprivilegedEditor?.getText().split(' ').length);
  }, [currentReactQuillRef?.current?.unprivilegedEditor?.getText().split(' ').length]);

  return (
    <>
      <Form.Item name={formName} initialValue={initialValue} dependencies={dependencies} rules={rules}>
        <ReactQuill
          ref={currentReactQuillRef}
          placeholder={placeholder}
          className="text-editor"
          modules={modules}
          onChange={onChange}
        />
      </Form.Item>
      <div className="event-description-footer">
        <p>{t('dashboard.events.addEditEvent.otherInformation.description.footerTitle')}</p>
        <p>{pluralize(wordCount, t('dashboard.events.addEditEvent.otherInformation.description.word'))}</p>
      </div>
      <OutlinedButton
        label={t('dashboard.events.addEditEvent.otherInformation.description.translate')}
        size="middle"
        disabled={wordCount > 1 ? false : true}
        onClick={() => {
          window.open(
            `${
              process.env.REACT_APP_DEEPL_URL
            }${editorLanguage}/${translateTo}/${currentReactQuillRef?.current?.unprivilegedEditor?.getText()}`,
          );
        }}
      />
    </>
  );
}
export default TextEditor;
