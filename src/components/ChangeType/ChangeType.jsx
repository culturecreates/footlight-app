import React from 'react';
import { Button } from 'antd';
import TooltipStyled from '../Tooltip/TooltipStyled';
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
        data-cy="button-select-change-type"
      />

      <Button
        type="text"
        disabled={disabled}
        className="second-button"
        onClick={onClick}
        data-cy="button-select-change-type">
        <span>
          {label}&nbsp;
          <TooltipStyled title={disabled ? '' : promptText}>{secondaryIcon}</TooltipStyled>
        </span>
      </Button>
    </div>
  );
}

export default ChangeType;
