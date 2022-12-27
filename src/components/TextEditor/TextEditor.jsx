import { Form } from 'antd';
import React from 'react';
import ReactQuill from 'react-quill';
import './textEditor.css';
import 'react-quill/dist/quill.snow.css';

function TextEditor(props) {
  const { formName, initialValue, dependencies, rules, currentReactQuillRef, placeholder } = props;
  const modules = {
    toolbar: [['bold', 'italic', 'underline'], [{ align: [] }], [{ list: 'ordered' }, { list: 'bullet' }], ['link']],
    clipboard: {
      matchVisual: false,
    },
  };
  return (
    <Form.Item name={formName} initialValue={initialValue} dependencies={dependencies} rules={rules}>
      <ReactQuill ref={currentReactQuillRef} placeholder={placeholder} className="text-editor" modules={modules} />
    </Form.Item>
  );
}
export default TextEditor;
