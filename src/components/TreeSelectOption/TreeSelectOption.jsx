import React from 'react';
import { TreeSelect } from 'antd';
import './treeSelectOption.css';

function TreeSelectOption(props) {
  const filterTreeNode = (inputValue, treeNode) => {
    if (treeNode?.title?.toLowerCase()?.includes(inputValue?.toLowerCase())) return true;
    else return false;
  };
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
      treeNodeFilterProp
      filterTreeNode={filterTreeNode}
      {...props}
    />
  );
}

export default TreeSelectOption;
