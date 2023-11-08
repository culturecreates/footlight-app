import React from 'react';
import { Modal } from 'antd';
import './customModal.css';

function CustomModal(props) {
  const { children, className } = props;
  console.log(className);
  return (
    <Modal
      title="Basic Modal"
      {...props}
      wrapClassName="custom-common-modal-container-wrapper"
      className={`custom-common-modal-container ${className ? className : ''}`}>
      {children}
    </Modal>
  );
}

export default CustomModal;
