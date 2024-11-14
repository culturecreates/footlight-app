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

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

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
const DraggableBodyRow = ({
  'data-row-key': dataRowKey,
  moveRow,
  className,
  numberOfParents,
  style,
  // eslint-disable-next-line no-unused-vars
  fallbackStatus,
  ...restProps
}) => {
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
    <span className="fallback-tag">
      <LiteralBadge tagTitle={fallbackStatus[recordKey]?.fallbackLiteralKey} promptText={fallbackPromptText} />
    </span>
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
        <Input ref={inputRef} value={value} onChange={handleInputChange} onBlur={save} onPressEnter={save} />
      ) : (
        <div onClick={toggleEdit}>{children}</div>
      )}
      {fallbackComponent}
    </td>
  );
};

const DraggableTable = ({ data, setData }) => {
  const [currentCalendarData] = useOutletContext();
  const calendarContentLanguage = currentCalendarData?.contentLanguage;
  const { t } = useTranslation();

  const [transformedData, setTransformedData] = useState([]);
  const [fallbackStatus, setFallbackStatus] = useState({});
  const [transformationComplete, setTransformationComplete] = useState(false);

  const handleSave = (row, data = transformedData, columnKey) => {
    let fallbackStatusCloned = { ...fallbackStatus };
    // Check if the row key exists in fallbackStatus
    let rowsfallbackInfo = fallbackStatusCloned[row.key];

    if (rowsfallbackInfo) {
      // eslint-disable-next-line no-unused-vars
      const { [columnKey]: _, ...updatedFallbackRowInfo } = rowsfallbackInfo;
      fallbackStatusCloned[row.key] = updatedFallbackRowInfo;
    }

    const updateNode = (nodes) => {
      return nodes.map((node) => {
        if (node.key === row.key) {
          // Update the node if the keys match
          return { ...node, ...row };
        }
        // Recursively check children if the node has any
        if (node.children && node.children.length > 0) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    const newData = updateNode(data);

    // Iterate through newData to check and update items based on fallbackInfo
    newData.forEach((item) => {
      const fallbackInfo = fallbackStatusCloned[item.key];
      if (fallbackInfo) {
        Object.entries(fallbackInfo).forEach(([key, value]) => {
          // Check if tagDisplayStatus is true and the key exists in item, then delete it
          if (value.tagDisplayStatus === true && key in item) {
            delete item[key];
          }
        });
      }
    });

    // Iterate through newData to check and update items based on fallbackInfo and contentlanguagekeymap
    newData.forEach((item) => {
      const fallbackInfo = fallbackStatusCloned[item.key];

      // Remove keys based on fallbackInfo conditions
      if (fallbackInfo) {
        Object.entries(fallbackInfo).forEach(([key, value]) => {
          if (value.tagDisplayStatus === true && key in item) {
            delete item[key];
          }
        });
      }

      // Create a name object with common language keys and remove them from item
      const name = {};
      Object.values(contentLanguageKeyMap).forEach((langKey) => {
        if (langKey in item) {
          name[langKey] = item[langKey];
          delete item[langKey]; // Remove the language key from item
        }
      });

      // Assign the name object to item if it has any language keys
      if (Object.keys(name).length > 0) {
        item.name = name;
      }
    });

    setData(newData);
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
  }));

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
