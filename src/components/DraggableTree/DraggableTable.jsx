import React, { useCallback, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Table } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { capitalizeFirstLetter } from '../../utils/stringManipulations';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import './draggableTable.css';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import Outlined from '../Button/Outlined';
import { useTranslation } from 'react-i18next';
import { languageFallbackStatusCreator } from '../../utils/languageFallbackStatusCreator';
import { Dropdown, Menu } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { Confirm } from '../Modal/Confirm/Confirm';
import {
  cloneFallbackStatus,
  deepCopy,
  moveConcept,
  sanitizeData,
  transformLanguageKeys,
  updateNodeData,
} from '../../utils/draggableTableUtilFunctions';
import EditableCell from './EditableCell';
import DraggableBodyRow from './DraggableRow';

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
      okText: t('dashboard.taxonomy.addNew.concepts.delete'),
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
    title: t(`common.tab${capitalizeFirstLetter(language)}`),
    dataIndex: contentLanguageKeyMap[language],
    key: contentLanguageKeyMap[language],
    editable: true,
    ['data-cy']: `taxonomy-concept-row-more-btn-${language}`,
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
      <Menu.Item key="delete" onClick={() => handleDelete(record?.key)} data-cy="taxonomy-concept-row-delete-btn">
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
          }}
          data-cy="taxonomy-concept-row-more-btn-wrapper">
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
            onHeaderRow={() => {
              return {
                'data-cy': `taxonomy-concept-row-header`,
                className: 'custom-header-row',
              };
            }}
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
