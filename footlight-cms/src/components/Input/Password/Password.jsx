import React from 'react';
import './password.css';
import { Input } from 'antd';

function Password(props) {
  return <Input.Password className="form-item-password-input-style" {...props} size="large" />;
}

export default Password;
