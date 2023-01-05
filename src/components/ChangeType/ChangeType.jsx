import React from 'react';
import { Button, Tooltip } from 'antd';
import './changeType.css';
function ChangeType(props) {
  const { primaryIcon, disabled, label, secondaryIcon, promptText, onClick } = props;
  return (
    <div className="change-type-wrapper">
      <Button
        type="primary"
        icon={primaryIcon}
        disabled={disabled}
        size="small"
        className="first-button"
        onClick={onClick}
      />
      <Button type="text" disabled={disabled} size="small" className="second-button" onClick={onClick}>
        {label}
      </Button>
      <Tooltip title={promptText}>
        <Button type="text" icon={secondaryIcon} disabled={disabled} size="small" className="third-button" />
      </Tooltip>
    </div>
  );
}

export default ChangeType;
