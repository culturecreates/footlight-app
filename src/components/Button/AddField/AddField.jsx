import React from 'react';
import './addField.css';

function AddField(props) {
  const { label, onClick, icon, disabled } = props;
  return (
    <div type="text" size="large" onClick={onClick} {...props} className={`add-field-wrapper`}>
      <span className={`add-field-icon ${disabled ? 'disabled' : 'enabled'}`}>{icon}</span>
      <span className={`add-field-label ${disabled ? 'disabled' : 'enabled'}`}> {label}</span>
    </div>
  );
}

export default AddField;
