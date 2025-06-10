import React, { useState, useEffect } from 'react';
import { TreeSelect } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTag from '../Tags/SortableTag/SortableTag';
import Tags from '../Tags/Common/Tags';
import './treeSelectOption.css';

const { SHOW_ALL } = TreeSelect;

function SortableTreeSelect({
  form,
  fieldName,
  draggable = false,
  dataCy,
  setShowDialog,
  treeData,
  treeCheckStrictly = false,
  treeCheckable = false,
  ...props
}) {
  const initialValue = props.value || [];
  const [selectedValues, setSelectedValues] = useState(initialValue.map((v) => (typeof v === 'object' ? v.value : v)));

  useEffect(() => {
    const flattened = (props.value || []).map((v) => (typeof v === 'object' ? v.value : v));
    setSelectedValues(flattened);
  }, [props.value]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = selectedValues.indexOf(active.id);
      const newIndex = selectedValues.indexOf(over.id);

      const reorderedValues = arrayMove(selectedValues, oldIndex, newIndex);
      setSelectedValues(reorderedValues);
      form.setFieldValue(fieldName, reorderedValues);
      setShowDialog(true);
    }
  };

  const handleChange = (values) => {
    const flattened = values.map((v) => (typeof v === 'object' ? v.value : v));
    const uniqueValues = [...new Set(flattened)];
    setSelectedValues(uniqueValues);
    form.setFieldValue(fieldName, uniqueValues);

    form.validateFields([fieldName]).catch((error) => {
      console.error('Validation error:', error);
    });

    setShowDialog(true);
  };

  const tagRender = (tagProps) => {
    const { label, closable, onClose, value } = tagProps;

    if (draggable) {
      return (
        <SortableTag
          dataCy={`${dataCy}-${label}`}
          key={value}
          tag={value}
          value={value}
          label={label}
          onClose={onClose}
          closable={closable}
          onRemove={() => {
            const updated = selectedValues.filter((v) => v !== value);
            setSelectedValues(updated);
            form.setFieldValue(fieldName, updated);
            handleChange(updated);
            setShowDialog(true);
          }}
        />
      );
    }

    return (
      <Tags
        closable={closable}
        onClose={onClose}
        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}
        data-cy={`${dataCy}-${label}`}>
        {label}
      </Tags>
    );
  };

  let strictCheckEnabled = treeCheckStrictly && treeCheckable;

  const markSelectedNodes = (data, selectedValues) => {
    return data.map((node) => {
      const isSelected = selectedValues.includes(node.key);

      return {
        ...node,
        className: isSelected ? 'custom-selected-node' : '',
        children: node.children ? markSelectedNodes(node.children, selectedValues) : undefined,
      };
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={selectedValues} strategy={horizontalListSortingStrategy}>
        <TreeSelect
          {...props}
          treeData={!strictCheckEnabled ? treeData : markSelectedNodes(treeData, selectedValues)}
          value={selectedValues}
          onChange={handleChange}
          getPopupContainer={(trigger) => trigger.parentNode}
          popupClassName={`tree-select-dropdown-wrapper ${
            strictCheckEnabled ? 'tree-select-dropdown-wrapper-strict' : ''
          }`}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          multiple
          showSearch
          allowClear
          showArrow={props?.showArrow ?? true}
          tagRender={props?.tagRender ?? tagRender}
          treeNodeFilterProp="title"
          treeNodeLabelProp="label"
          treeCheckStrictly={treeCheckStrictly}
          treeCheckable={treeCheckable}
          {...(strictCheckEnabled ? { showCheckedStrategy: SHOW_ALL } : {})}
        />
      </SortableContext>
    </DndContext>
  );
}

export default SortableTreeSelect;
