import React from 'react';
import { Input } from 'antd';
import './authenticationInput.css';

function AuthenticationInput(props) {
  const { type, placeholder, suffixIcon } = props;
  return <Input type={type} placeholder={placeholder} className="form-item-input-style" suffix={suffixIcon} />;
}

export default AuthenticationInput;
