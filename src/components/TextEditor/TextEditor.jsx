import { Form } from 'antd';
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import './textEditor.css';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';
import { pluralize } from '../../utils/pluralise';

function TextEditor(props) {
  const { formName, initialValue, dependencies, rules, currentReactQuillRef, placeholder } = props;
  const { t } = useTranslation();
  const [wordCount, setWordCount] = useState(
    currentReactQuillRef?.current?.unprivilegedEditor?.getText().split(' ').length,
  );
  const modules = {
    toolbar: [['bold', 'italic', 'underline'], [{ align: [] }], [{ list: 'ordered' }, { list: 'bullet' }], ['link']],
    clipboard: {
      matchVisual: false,
    },
  };
  const onChange = () => {
    setWordCount(currentReactQuillRef?.current?.unprivilegedEditor?.getText().split(' ').length);
  };
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
    </>
  );
}
export default TextEditor;
