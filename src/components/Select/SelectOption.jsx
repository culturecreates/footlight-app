import React from 'react';
import './selectOption.css';
import { Select } from 'antd';

const addDropdownDataCy = (content, dataCy) => {
  if (!React.isValidElement(content)) return content;

  if (typeof content.type === 'string') {
    return React.cloneElement(content, { 'data-cy': dataCy });
  }

  return <div data-cy={dataCy}>{content}</div>;
};

function SelectOption({ dropdownDataCy, dropdownRender, ...props }) {
  const renderDropdown = dropdownDataCy
    ? (originNode, dropdownProps) => {
        const content = dropdownRender ? dropdownRender(originNode, dropdownProps) : originNode;

        return addDropdownDataCy(content, dropdownDataCy);
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
