import React from 'react';
import './reviewContent.css';
import { Badge } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

function ReviewContent(props) {
  const { text, closable, onClose } = props;
  return (
    <div className="review-content-wrapper" data-cy="div-review-content">
      <Badge dot text={text ?? 'Remove merged content'} color="var(--content-action-default)" />
      {closable && <CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '18px' }} onClick={onClose} />}
    </div>
  );
}

export default ReviewContent;
