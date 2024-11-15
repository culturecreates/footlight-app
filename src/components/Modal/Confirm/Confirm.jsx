import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './confirm.css';

export const Confirm = ({ title, content, onAction, okText, cancelText, className, closable }) => {
  const { confirm } = Modal;

  let modalClassName = ['global-delete-modal-container'];
  if (className) {
    modalClassName.push(className);
    modalClassName = modalClassName.join(' ');
  }

  return confirm({
    title: (
      <>
        <span>{title}</span>
      </>
    ),
    content: (
      <div style={{ padding: '24px' }}>
        <ExclamationCircleOutlined size="18px" />
        <span style={{ fontSize: '16px' }}>{content}</span>
      </div>
    ),
    icon: null,
    okType: 'danger',
    okText: okText,
    cancelText: cancelText,
    centered: true,
    className: modalClassName,
    closable: closable ?? true,
    header: null,
    onOk() {
      onAction();
    },
  });
};
