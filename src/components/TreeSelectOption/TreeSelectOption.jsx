import React from 'react';
import { TreeSelect } from 'antd';
import './treeSelectOption.css';

function TreeSelectOption({ dropdownDataCy, dropdownRender, ...props }) {
  const TITLE = 'title';
  const LABEL = 'label';

  const renderDropdown = dropdownDataCy
    ? (originNode, dropdownProps) => {
        const content = dropdownRender ? dropdownRender(originNode, dropdownProps) : originNode;

        return React.isValidElement(content) ? React.cloneElement(content, { 'data-cy': dropdownDataCy }) : content;
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
