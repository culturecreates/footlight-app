import React from 'react';
import LoadingIndicator from '../../LoadingIndicator';
import CustomModal from '../Common/CustomModal';
import './quickCreateSaving.css';

const QuickCreateSaving = ({ open, title, text }) => {
  console.log(title, text);
  return (
    <CustomModal
      open={!open}
      width="500px"
      height="296px"
      destroyOnClose
      centered
      title={
        <span className="quick-create-organization-modal-title" data-cy="span-quick-create-organization-heading">
          {title}
        </span>
      }
      footer={null}>
      <div
        style={{
          height: '232px',
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
        <span className="text">{text}</span>
      </div>
    </CustomModal>
  );
};

export default QuickCreateSaving;
