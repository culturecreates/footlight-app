import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './confirm.css';

export const Confirm = ({ title, content, onCancel, onAction, okText, cancelText, className, closable }) => {
  const { confirm } = Modal;
  const isStringContent = typeof content === 'string';

  let modalClassName = ['global-delete-modal-container'];
  if (className) {
    modalClassName.push(className);
    modalClassName = modalClassName.join(' ');
  }

  const config = {
    title: (
      <>
        <span data-cy="confirm-modal-title">{title}</span>
      </>
    ),
    content: (
      <div data-cy="confirm-modal-content" style={{ padding: '24px' }}>
        <ExclamationCircleOutlined size="18px" />
        {isStringContent ? <span>{content}</span> : content}
      </div>
    ),
    icon: null,
    okType: 'danger',
    okText,
    cancelText,
    okButtonProps: {
      'data-cy': 'button-confirm-ok',
    },
    cancelButtonProps: {
      'data-cy': 'button-confirm-cancel',
    },
    centered: true,
    className: modalClassName,
    closable: closable ?? true,
    header: null,
    onOk() {
      onAction();
    },
  };

  if (onCancel) {
    config.onCancel = onCancel;
  }

  return confirm(config);
};
