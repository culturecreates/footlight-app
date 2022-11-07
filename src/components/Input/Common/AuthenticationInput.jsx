import React from 'react';
import { Input } from 'antd';
import './authenticationInput.css';

function AuthenticationInput(props) {
  const { type, placeholder } = props;
  return <Input type={type} placeholder={placeholder} className="form-item-input-style" />;
}

export default AuthenticationInput;
