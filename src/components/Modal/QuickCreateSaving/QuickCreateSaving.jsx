import React from 'react';
import LoadingIndicator from '../../LoadingIndicator';
import CustomModal from '../Common/CustomModal';
import './quickCreateSaving.css';

const QuickCreateSaving = (props) => {
  const { open, title, text } = props;
  return (
    <div className="saving-loader-modal">
      <CustomModal
        {...props}
        open={!open}
        width="500px"
        height="296px"
        destroyOnClose
        centered
        className="saving-loader-modal"
        title={
          <span
            className="quick-create-loader-modal-title"
            data-cy="span-quick-create-loader-heading"
            style={{ fontSize: 20, fontWeight: 700, color: '#222732' }}>
            {title}
          </span>
        }
        footer={null}>
        <div
          style={{
            height: '184px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}>
          <LoadingIndicator
            style={{
              borderRadius: '100%',
              background: '#EFF2FF',
              height: 56,
              width: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <span className="text" data-cy="loading-indicator-text">
            {text}
          </span>
        </div>
      </CustomModal>
    </div>
  );
};

export default QuickCreateSaving;
