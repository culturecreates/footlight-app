import { Form } from 'antd';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function TextEditor(props) {
  const { formName, initialValue, dependencies, rules, currentReactQuillRef } = props;

  return (
    <Form.Item name={formName} initialValue={initialValue} dependencies={dependencies} rules={rules}>
      <ReactQuill ref={currentReactQuillRef} />
    </Form.Item>
  );
}
export default TextEditor;
