import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import '../Common/tags.css';

function SortableTag({ label, value, closable, onClose, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: value,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
  };

  return (
    <Tag
      ref={setNodeRef}
      style={style}
      closable={closable}
      {...attributes}
      className="tags-wrapper"
      data-cy={`tag-event-type-${label}`}
      closeIcon={
        <CloseCircleOutlined
          style={{ color: '#1b3de6', fontSize: '12px' }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onRemove();
          }}
        />
      }
      color={'#EFF2FF'}>
      <span {...listeners}>{label}</span>
    </Tag>
  );
}

export default SortableTag;
