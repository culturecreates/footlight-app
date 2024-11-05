import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Table, Input } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { capitalizeFirstLetter } from '../../utils/stringManipulations';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import './draggableTable.css';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import Outlined from '../Button/Outlined';
import { useTranslation } from 'react-i18next';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function moveConcept(dragKey, dropKey, data) {
  let clonedData = deepClone(data);

  let dragParent = null;
  let dragItem = null;
  let dropParent = null;
  let dropIndex = -1;

  function findItemAndParent(key, items, parent = null) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.key === key) {
        return { item, parent, index: i };
      }

      if (item.children) {
        const result = findItemAndParent(key, item.children, item);
        if (result) return result;
      }
    }
    return null;
  }

  const dragResult = findItemAndParent(dragKey, clonedData);
  if (dragResult) {
    dragItem = dragResult.item;
    dragParent = dragResult.parent;
  }

  const dropResult = findItemAndParent(dropKey, clonedData);
  if (dropResult) {
    dropParent = dropResult.parent;
    dropIndex = dropResult.index;
  }

  if (dragItem && dropResult) {
    if (dragParent) {
      dragParent.children = dragParent.children.filter((item) => item.key !== dragKey);
    } else {
      clonedData = clonedData.filter((item) => item.key !== dragKey);
    }

    if (dropParent) {
      dropParent.children.splice(dropIndex + 1, 0, dragItem);
    } else {
      clonedData.splice(dropIndex + 1, 0, dragItem);
    }
  }

  return clonedData;
}

const type = 'DraggableBodyRow';
const DraggableBodyRow = ({ index, 'data-row-key': dataRowKey, moveRow, className, style, ...restProps }) => {
  const ref = useRef(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item) => {
      moveRow(item.dataRowKey, dataRowKey);
    },
  });
  const [, drag] = useDrag({
    type,
    item: {
      dataRowKey,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{
        cursor: 'move',
        ...style,
      }}
      {...restProps}
    />
  );
};

// Editable cell component
const EditableCell = ({ editable, children, dataIndex, record, handleSave, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState();
  const inputRef = useRef(null);

  const toggleEdit = () => {
    setEditing(!editing);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };

  const save = () => {
    handleSave({ ...record, [dataIndex]: value });
    setEditing(false);
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (!record) return;
    if (!record[dataIndex]) return;

    setValue(record[dataIndex]);
  }, [dataIndex, record]);

  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Input ref={inputRef} value={value} onChange={handleInputChange} onBlur={save} onPressEnter={save} />
      ) : (
        <div onClick={toggleEdit}>{children}</div>
      )}
    </td>
  );
};

const DraggableTable = ({ data, setData }) => {
  const [currentCalendarData] = useOutletContext();
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const { t } = useTranslation();

  const [transformedData, setTransformedData] = useState([]);

  const handleSave = (row) => {
    const newData = [...transformedData];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      newData[index] = { ...newData[index], ...row };
      setData(newData);
    }
  };

  const columns = calendarContentLanguage.map((language) => ({
    title: capitalizeFirstLetter(language),
    dataIndex: contentLanguageKeyMap[language],
    key: contentLanguageKeyMap[language],
    editable: true,
  }));

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      setData(moveConcept(dragIndex, hoverIndex, data));
    },
    [data],
  );

  const transformData = (data) => {
    if (!data) return data;
    const { name, children, ...rest } = data;
    const transformed = { ...rest, ...name };

    if (children && Array.isArray(children)) {
      transformed.children = children.map((child) => transformData(child));
    }

    return transformed;
  };

  useEffect(() => {
    if (!calendarContentLanguage) return;
    setTransformedData(data.map((item) => transformData(item)));
  }, [data, calendarContentLanguage]);

  const handleAdd = () => {
    const newKey = `new_${Date.now()}`;
    const newRow = {
      key: newKey,
      ...columns.reduce((acc, col) => {
        acc[col.dataIndex] = `Concept ${col.title}`;
        return acc;
      }, {}),
    };

    setTransformedData((prevData) => [...prevData, newRow]);
  };

  const components = {
    body: {
      row: DraggableBodyRow,
      cell: EditableCell,
    },
  };

  const modifiedColumns = columns.map((col) => ({
    ...col,
    ellipsis: true,
    onCell: (record) => ({
      record,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,
      handleSave,
    }),
  }));

  return (
    <div className="custom-table">
      <Outlined
        data-cy="button-taxonomy-add-item"
        label={t('dashboard.taxonomy.addNew.concepts.item')}
        onClick={handleAdd}>
        <PlusOutlined style={{ fontSize: '12px' }} />
      </Outlined>
      <DndProvider backend={HTML5Backend}>
        <Table
          columns={modifiedColumns}
          dataSource={transformedData}
          components={components}
          pagination={false}
          tableLayout="fixed"
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) => {
              let icon = null;
              if (record.children) {
                icon = expanded ? (
                  <div className="icon-container">
                    <MinusOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        return onExpand(record, e);
                      }}
                    />
                  </div>
                ) : (
                  <div className="icon-container">
                    <PlusOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        return onExpand(record, e);
                      }}
                    />
                  </div>
                );
              }
              return icon;
            },
          }}
          rowClassName="editable-row"
          onRow={(_, index) => {
            const attr = {
              index,
              moveRow,
            };
            return attr;
          }}
        />
      </DndProvider>
    </div>
  );
};

export default DraggableTable;
