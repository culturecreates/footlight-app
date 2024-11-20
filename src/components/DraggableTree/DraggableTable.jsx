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
import { languageFallbackStatusCreator } from '../../utils/languageFallbackStatusCreator';
import LiteralBadge from '../Badge/LiteralBadge';
import { Dropdown, Menu } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { Confirm } from '../Modal/Confirm/Confirm';
import {
  cloneFallbackStatus,
  deepClone,
  deepCopy,
  sanitizeData,
  transformLanguageKeys,
  updateNodeData,
} from '../../utils/draggableTableUtilFunctions';

const { TextArea } = Input;

function moveConcept(dragKey, dropKey, data, dropToGap = false) {
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
    // Remove drag item from its original position
    if (dragParent) {
      dragParent.children = dragParent.children.filter((item) => item.key !== dragKey);
    } else {
      clonedData = clonedData.filter((item) => item.key !== dragKey);
    }

    if (dropToGap) {
      // Add drag item as a child of the drop item
      if (!dropResult.item.children) {
        dropResult.item.children = [];
      }
      dropResult.item.children.push(dragItem);
    } else {
      // Add drag item as a sibling at the drop index
      if (dropParent) {
        dropParent.children.splice(dropIndex, 0, dragItem);
      } else {
        clonedData.splice(dropIndex, 0, dragItem);
      }
    }
  }

  return clonedData;
}

const type = 'DraggableBodyRow';
const DraggableBodyRow = ({ 'data-row-key': dataRowKey, moveRow, className, numberOfParents, style, ...restProps }) => {
  const ref = useRef(null);
  const [isDroppingToGap, setIsDroppingToGap] = useState(false);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    hover: (_, monitor) => {
      setIsDroppingToGap(monitor.getDifferenceFromInitialOffset()?.x > 40);
    },
    collect: (monitor) => {
      const { dataRowKey: dragIndex } = monitor.getItem() || {};

      if (dragIndex === dataRowKey) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: `${isDroppingToGap ? ' drop-over-upward-in-gap' : ' drop-over-upward'}`,
      };
    },
    drop: (item, monitor) => {
      const dropToGap = monitor.getDifferenceFromInitialOffset()?.x > 40;
      moveRow(item.dataRowKey, dataRowKey, dropToGap);
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
      className={`${className} ${isOver ? dropClassName : ''} table-row`}
      style={{
        cursor: 'move',
        marginLeft: `${numberOfParents * 4}px`,
        ...style,
      }}
      {...restProps}
    />
  );
};

// Editable cell component
const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, fallbackStatus, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState();
  const inputRef = useRef(null);
  const { t } = useTranslation();

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

  let isFallbackPresent = false;
  let fallbackPromptText = '';
  const recordKey = contentLanguageKeyMap[title?.toUpperCase()];

  if (fallbackStatus && recordKey && fallbackStatus[recordKey]) {
    isFallbackPresent = fallbackStatus[recordKey]?.tagDisplayStatus;
    fallbackPromptText =
      fallbackStatus[recordKey]?.fallbackLiteralKey == '?'
        ? t('common.forms.languageLiterals.unKnownLanguagePromptText')
        : t('common.forms.languageLiterals.knownLanguagePromptText');
  }

  const fallbackComponent = isFallbackPresent ? (
    <LiteralBadge tagTitle={fallbackStatus[recordKey]?.fallbackLiteralKey} promptText={fallbackPromptText} />
  ) : (
    <></>
  );

  if (!editable) {
    return (
      <td {...restProps}>
        {children}
        {fallbackComponent}
      </td>
    );
  }

  return (
    <td {...restProps}>
      {editing ? (
        <TextArea
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={save}
          onPressEnter={save}
          autoSize
          autoComplete="off"
          style={{
            borderRadius: '4px',
            border: '1px solid #B6C1C9',
          }}
          size="large"
        />
      ) : (
        <div onClick={toggleEdit}>{children}</div>
      )}
      {fallbackComponent}
    </td>
  );
};

const DraggableTable = ({ data, setData, fallbackStatus, setFallbackStatus, transformedData, setTransformedData }) => {
  const [currentCalendarData] = useOutletContext();
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const { t } = useTranslation();

  const [transformationComplete, setTransformationComplete] = useState(false);

  const handleSave = (row, data = transformedData, columnKey) => {
    const fallbackStatusCloned = cloneFallbackStatus(fallbackStatus, row, columnKey);
    const updatedData = updateNodeData(data, row);
    const sanitizedData = sanitizeData(updatedData, fallbackStatusCloned);
    const transformedData = transformLanguageKeys(sanitizedData);

    setData(transformedData);
  };

  const handleDelete = (key) => {
    Confirm({
      title: t('dashboard.taxonomy.addNew.concepts.deleteConceptHeading'),
      onAction: () => {
        const updatedData = deleteNodeFromData(transformedData, key);
        const sanitizedData = sanitizeData(updatedData, fallbackStatus);
        const filteredConceptData = transformLanguageKeys(sanitizedData);
        setData(filteredConceptData);
      },
      content: t('dashboard.taxonomy.addNew.concepts.deleteConceptMessage'),
      okText: t('dashboard.settings.addUser.delete'),
      cancelText: t('dashboard.events.deleteEvent.cancel'),
    });
  };

  const deleteNodeFromData = (data, key) => {
    const deleteData = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          items.splice(i, 1);
          return;
        }
        if (items[i].children) {
          deleteData(items[i].children);
        }
      }
    };

    // Create a deep copy of the data to avoid mutating the original array
    const newData = deepCopy(data);
    deleteData(newData);
    return newData;
  };

  const columns = calendarContentLanguage.map((language) => ({
    title: capitalizeFirstLetter(language),
    dataIndex: contentLanguageKeyMap[language],
    key: contentLanguageKeyMap[language],
    editable: true,
  }));

  const moveRow = useCallback(
    (dragIndex, hoverIndex, dropToGap) => {
      setData(moveConcept(dragIndex, hoverIndex, data, dropToGap));
    },
    [data],
  );

  const transformData = (data, parentCount = 0) => {
    if (!data) return data;
    const { name, children, ...rest } = data;
    const languageFallbacks = languageFallbackStatusCreator({
      calendarContentLanguage,
      languageFallbacks: currentCalendarData?.languageFallbacks,
      fieldData: name,
      isFieldsDirty: {},
    });
    const fallbackKeys = Object.keys(languageFallbacks);
    let extractedFallbackValues = {};
    fallbackKeys.forEach((lanKey) => {
      if (languageFallbacks[lanKey]?.tagDisplayStatus)
        extractedFallbackValues[lanKey] = languageFallbacks[lanKey].fallbackLiteralValue;
    });

    const transformed = {
      ...rest,
      ...name,
      ...extractedFallbackValues,
      numberOfParents: parentCount,
    };

    setFallbackStatus((prev) => ({ ...prev, [transformed.key]: languageFallbacks }));

    if (children && Array.isArray(children)) {
      transformed.children = children.map((child) => transformData(child, parentCount + 1));
    }

    return transformed;
  };

  useEffect(() => {
    if (!calendarContentLanguage || !data) return;
    setTransformedData(data.map((item) => transformData(item, 0)));
    setTransformationComplete(true);
  }, [data, calendarContentLanguage]);

  const handleAdd = () => {
    const newKey = `new_${Date.now()}`;
    const newRow = {
      key: newKey,
      isNew: true,
      ...columns.reduce((acc, col) => {
        acc[col.dataIndex] = `Concept ${col.title}`;
        return acc;
      }, {}),
    };

    const newConceptData = [...transformedData, newRow];
    setTransformedData(newConceptData);
    const sanitizedData = sanitizeData(newConceptData, fallbackStatus);
    const filteredConceptData = transformLanguageKeys(sanitizedData);
    setData(filteredConceptData);
  };

  const components = {
    body: {
      row: DraggableBodyRow,
      cell: EditableCell,
    },
  };

  const menu = (record) => (
    <Menu>
      <Menu.Item key="delete" onClick={() => handleDelete(record?.key)}>
        {t('dashboard.taxonomy.addNew.concepts.delete')}
      </Menu.Item>
    </Menu>
  );

  const modifiedColumns = [
    ...columns.map((col) => ({
      ...col,
      ellipsis: true,
      onCell: (record) => {
        return {
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: (row, data) => handleSave(row, data, col.dataIndex),
          fallbackStatus: fallbackStatus[record.key],
        };
      },
    })),
    {
      title: '',
      dataIndex: 'actions',
      width: 30,
      key: 'actions',
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
          <Dropdown overlay={menu(record)} trigger={['click']}>
            <MoreOutlined style={{ cursor: 'pointer', fontSize: '18px' }} />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    transformationComplete && (
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
            indentSize={20}
            expandable={{
              expandIcon: ({ expanded, onExpand, record }) => {
                if (!record.children || record.children.length === 0) return null;
                return expanded ? (
                  <div
                    className="icon-container"
                    onClick={(e) => {
                      e.stopPropagation();
                      return onExpand(record, e);
                    }}>
                    <MinusOutlined />
                  </div>
                ) : (
                  <div
                    className="icon-container"
                    onClick={(e) => {
                      e.stopPropagation();
                      return onExpand(record, e);
                    }}>
                    <PlusOutlined />
                  </div>
                );
              },
            }}
            rowClassName="editable-row"
            onRow={(record, index) => {
              const attr = {
                index,
                moveRow,
                fallbackStatus,
                numberOfParents: record.numberOfParents,
              };
              return attr;
            }}
          />
        </DndProvider>
      </div>
    )
  );
};

export default DraggableTable;
