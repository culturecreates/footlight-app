import { Popover } from 'antd';
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import './colorPicker.css';

const ColorPicker = (props) => {
  const { color, setColor, ...rest } = props;
  const [popoverVisible, setPopoverVisible] = useState(false);

  const handleColorPickerClick = () => {
    setPopoverVisible(!popoverVisible);
  };

  const handlePopoverVisibleChange = (visible) => {
    setPopoverVisible(visible);
  };

  return (
    <Popover
      content={
        <>
          <HexColorPicker {...rest} color={color} onChange={setColor} />
        </>
      }
      trigger="click"
      open={popoverVisible}
      onOpenChange={handlePopoverVisibleChange}>
      <div className="color-picker-icon" style={{ backgroundColor: color }} onClick={handleColorPickerClick}></div>
    </Popover>
  );
};

export default ColorPicker;
