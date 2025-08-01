import React from 'react';
import styles from './auth.module.css';
import { Button } from 'antd';
function Auth(props) {
  const { label } = props;
  return (
    <Button type="primary" className={styles['login-form-button']} {...props}>
      <span>{label}</span>
    </Button>
  );
}

export default Auth;
