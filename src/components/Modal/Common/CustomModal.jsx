import React from 'react';
import { Modal } from 'antd';
import './customModal.css';

function CustomModal(props) {
  const { children } = props;
  return (
    <Modal
      title="Basic Modal"
      {...props}
      wrapClassName="custom-common-modal-container-wrapper"
      className="custom-common-modal-container">
      {children}
    </Modal>
  );
}

export default CustomModal;
