import React from 'react';
import { Input } from 'antd';
import './authenticationInput.css';

function AuthenticationInput(props) {
  return <Input {...props} size="large" className="form-item-input" />;
}

export default AuthenticationInput;
