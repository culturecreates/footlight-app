import { Modal } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Outlined from '../../Button/Outlined';
import PrimaryButton from '../../Button/Primary/Primary';
import TextButton from '../../Button/Text/Text';

export const CustomModal = ({
  title,
  secondaryAction,
  primaryAction,
  primaryButtonText,
  secondaryButtonText,
  cancelText,
  className = 'custom-hook-modal',
  closable,
  footer,
  content,
}) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);

  const handleClose = () => {
    root.unmount();
    container.remove();
  };

  const modal = (
    <Modal
      open={true}
      title={<span style={{ fontSize: '20px', fontWeight: 700 }}>{title}</span>}
      onCancel={() => {
        handleClose();
      }}
      footer={
        footer || (
          <div
            style={{ display: 'flex', justifyContent: 'space-between', padding: '6px' }}
            className="hook-modal-modal-footer">
            <div className="hook-modal-modal-footer-btn-wrapper" key="add-full-details">
              <Outlined
                size="large"
                label={cancelText}
                data-cy="button-cancel-action-hook-modal"
                onClick={() => {
                  handleClose();
                }}
              />
            </div>
            <div>
              <TextButton
                key="cancel"
                size="large"
                label={secondaryButtonText}
                onClick={() => {
                  secondaryAction?.();
                  handleClose();
                }}
                data-cy="button-secondary-action-hook-modal"
              />
              <PrimaryButton
                key="primaryAction"
                label={primaryButtonText}
                onClick={() => {
                  primaryAction?.();
                  handleClose();
                }}
                data-cy="button-primary-action-hook-modal"
              />
            </div>
          </div>
        )
      }
      centered
      className={className}
      closable={closable ?? true}>
      <div style={{ padding: '12px' }}>
        <span style={{ fontSize: '16px', fontWeight: 500 }}>{content}</span>
      </div>
    </Modal>
  );

  root.render(modal);
};
