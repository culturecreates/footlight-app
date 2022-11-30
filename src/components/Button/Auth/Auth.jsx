import React from 'react';
import './auth.css';
import { Button } from 'antd';
function Auth(props) {
  const { label } = props;
  return (
    <Button type="primary" className="login-form-button" {...props}>
      <span>{label}</span>
    </Button>
  );
}

export default Auth;
