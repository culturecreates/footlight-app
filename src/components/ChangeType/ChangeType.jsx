import React from 'react';
import { Button } from 'antd';
import TooltipStyled from '../Tooltip/TooltipStyled';
import './changeType.css';
function ChangeType(props) {
  const { primaryIcon, disabled, label, secondaryIcon, promptText, onClick } = props;
  return (
    <div className="change-type-wrapper">
      <TooltipStyled title={promptText}>
        <Button
          type="primary"
          icon={primaryIcon}
          disabled={disabled}
          size="small"
          className="first-button"
          onClick={onClick}
          data-cy="button-select-change-type"
        />
      </TooltipStyled>

      <Button
        type="text"
        disabled={disabled}
        className="second-button"
        onClick={onClick}
        data-cy="button-select-change-type">
        {label}
      </Button>

      <Button
        type="text"
        icon={secondaryIcon}
        disabled={disabled}
        size="small"
        className="third-button"
        data-cy="button-select-change-type"
      />
    </div>
  );
}

export default ChangeType;
