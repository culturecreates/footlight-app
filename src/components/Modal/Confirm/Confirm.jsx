import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './confirm.css';

export const Confirm = ({ title, content, onAction, okText, cancelText }) => {
  const { confirm } = Modal;

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
    className: 'global-delete-modal-container',
    closable: true,
    header: null,
    onOk() {
      onAction();
    },
  });
};
