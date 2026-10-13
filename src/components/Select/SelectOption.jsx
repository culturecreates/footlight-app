import React from 'react';
import './selectOption.css';
import { Select } from 'antd';

function SelectOption({ dropdownDataCy, dropdownRender, ...props }) {
  const renderDropdown = dropdownDataCy
    ? (originNode, dropdownProps) => {
        const content = dropdownRender ? dropdownRender(originNode, dropdownProps) : originNode;

        return React.isValidElement(content) ? React.cloneElement(content, { 'data-cy': dropdownDataCy }) : content;
      }
    : dropdownRender;
  return (
    <Select
      className="select-wrapper"
      size="large"
      {...props}
      popupClassName="select-wrapper-dropdown"
      getPopupContainer={(trigger) => trigger.parentNode}
      dropdownRender={renderDropdown}
    />
  );
}

export default SelectOption;
