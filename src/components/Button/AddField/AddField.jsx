import React from 'react';

function AddField(props) {
  const { label, onClick, icon } = props;
  return (
    <div type="text" size="large" onClick={onClick} {...props}>
      <span>{icon}</span>
      <span> {label}</span>
    </div>
  );
}

export default AddField;
