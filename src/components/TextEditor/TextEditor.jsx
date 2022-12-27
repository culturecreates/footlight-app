import { Form } from 'antd';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function TextEditor(props) {
  const { formName, initialValue, dependencies, rules, currentReactQuillRef, placeholder } = props;

  return (
    <Form.Item name={formName} initialValue={initialValue} dependencies={dependencies} rules={rules}>
      <ReactQuill ref={currentReactQuillRef} placeholder={placeholder} />
    </Form.Item>
  );
}
export default TextEditor;
