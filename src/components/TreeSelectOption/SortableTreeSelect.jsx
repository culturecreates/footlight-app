import React, { useState } from 'react';
import { TreeSelect } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTag from '../Tags/SortableTag/SortableTag';
import Tags from '../Tags/Common/Tags';
import './treeSelectOption.css';

function SortableTreeSelect({ form, fieldName, draggable = false, dataCy, setShowDialog, ...props }) {
  const [selectedValues, setSelectedValues] = useState(props.value || []);
  const TITLE = 'title';
  const LABEL = 'label';

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = selectedValues.indexOf(active.id);
      const newIndex = selectedValues.indexOf(over.id);

      const reorderedValues = arrayMove(selectedValues, oldIndex, newIndex);
      setSelectedValues(reorderedValues);

      form.setFieldValue(fieldName, reorderedValues);
    }
    setShowDialog(true);
  };

  const handleChange = (values) => {
    const uniqueValues = [...new Set(values)];
    setSelectedValues(uniqueValues);

    form.setFieldValue(fieldName, uniqueValues);
    setShowDialog(true);
  };

  const tagRender = (props) => {
    const { label, closable, onClose, value } = props;
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
            form.setFieldValue(
              fieldName,
              selectedValues.filter((v) => v !== value),
            );
            handleChange(selectedValues.filter((v) => v !== value));
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

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={selectedValues} strategy={horizontalListSortingStrategy}>
        <TreeSelect
          {...props}
          value={selectedValues}
          onChange={handleChange}
          getPopupContainer={(trigger) => trigger.parentNode}
          popupClassName="tree-select-dropdown-wrapper"
          dropdownStyle={{
            maxHeight: 400,
            overflow: 'auto',
          }}
          multiple
          showSearch
          tagRender={props?.tagRender ?? tagRender}
          treeNodeFilterProp={TITLE}
          treeNodeLabelProp={LABEL}
          showArrow={props?.showArrow ?? true}
        />
      </SortableContext>
    </DndContext>
  );
}

export default SortableTreeSelect;
