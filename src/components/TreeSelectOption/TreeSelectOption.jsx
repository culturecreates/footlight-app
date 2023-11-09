import React from 'react';
import { TreeSelect } from 'antd';
import './treeSelectOption.css';

function TreeSelectOption(props) {
  const TITLE = 'title';
  const LABEL = 'label';
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
      showArrow={props?.showArrow ?? true}
    />
  );
}

export default TreeSelectOption;
