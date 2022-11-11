import React from 'react';
import './auth.css';
import { Button } from 'antd';
function Auth(props) {
  const { label, onClick, htmlType } = props;
  return (
    <Button type="primary" htmlType={htmlType} className="login-form-button" onClick={onClick}>
      <span>{label}</span>
    </Button>
  );
}

export default Auth;
