import React from 'react';
import { TreeSelect } from 'antd';
import './treeSelectOption.css';

const addDropdownDataCy = (content, dataCy) => {
  if (!React.isValidElement(content)) return content;

  if (typeof content.type === 'string') {
    return React.cloneElement(content, { 'data-cy': dataCy });
  }

  return <div data-cy={dataCy}>{content}</div>;
};

function TreeSelectOption({ dropdownDataCy, dropdownRender, ...props }) {
  const TITLE = 'title';
  const LABEL = 'label';

  const renderDropdown = dropdownDataCy
    ? (originNode, dropdownProps) => {
        const content = dropdownRender ? dropdownRender(originNode, dropdownProps) : originNode;

        return addDropdownDataCy(content, dropdownDataCy);
      }
    : dropdownRender;

  return (
    <TreeSelect
      getPopupContainer={(trigger) => trigger.parentNode}
      popupClassName="tree-select-dropdown-wrapper"
      dropdownStyle={{
        maxHeight: 400,
        overflow: 'auto',
      }}
      multiple
      showSearch
      treeNodeFilterProp={TITLE}
      treeNodeLabelProp={LABEL}
      {...props}
      dropdownRender={renderDropdown}
      showArrow={props?.showArrow ?? true}
    />
  );
}

export default TreeSelectOption;
