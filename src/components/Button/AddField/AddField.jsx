import React from 'react';
import './addField.css';
import { truncateText } from '../../../utils/stringManipulations';

function AddField(props) {
  const { label, onClick, icon, disabled } = props;
  return (
    <div type="text" size="large" onClick={onClick} {...props} className={`add-field-wrapper`}>
      <span className={`add-field-icon ${disabled ? 'disabled' : 'enabled'}`}>{icon}</span>
      <span className={`add-field-label ${disabled ? 'disabled' : 'enabled'}`}> {truncateText(label, 50)}</span>
    </div>
  );
}

export default AddField;
