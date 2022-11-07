import React from 'react';
import './auth.css';
import { Button } from 'antd';
function Auth(props) {
  const { label } = props;
  return (
    <Button type="primary" htmlType="submit" className="login-form-button">
      <span>{label}</span>
    </Button>
  );
}

export default Auth;
