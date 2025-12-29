import React, { useCallback, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Table } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { capitalizeFirstLetter } from '../../utils/stringManipulations';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';
import './draggableTable.css';
import { PlusOutlined, MinusOutlined, StarFilled } from '@ant-design/icons';
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

const DraggableTable = ({
  data,
  setData,
  fallbackStatus,
  setFallbackStatus,
  transformedData,
  setTransformedData,
  onBeforeDelete,
}) => {
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

  const markNodeAsDefault = (data, key, defaultValue) => {
    const newData = deepCopy(data);

    const traverse = (items) => {
      for (let item of items) {
        item.isDefault = false;

        if (item.key === key) {
          item.isDefault = !defaultValue;
        }

        if (item.children) {
          traverse(item.children);
        }
      }
    };

    traverse(newData);
    return newData;
  };

  const setAsDefault = (key, isDefault) => {
    const updatedData = markNodeAsDefault(transformedData, key, isDefault);
    const sanitizedData = sanitizeData(updatedData, fallbackStatus);
    const filteredConceptData = transformLanguageKeys(sanitizedData);
    setData(filteredConceptData);
  };

  const handleDelete = (key) => {
    if (onBeforeDelete) {
      const shouldProceed = onBeforeDelete(key);
      if (shouldProceed === false) {
        return;
      }
    }

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
    ['data-cy']: `taxonomy-concept-row-more-btn`,
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
      isDefault: false,
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

  const menu = (record) => {
    const { key, isDefault } = record;

    const menuItems = [
      {
        key: 'delete',
        onClick: () => handleDelete(key),
        label: t('dashboard.taxonomy.addNew.concepts.delete'),
        'data-cy': 'taxonomy-concept-row-delete-btn',
      },
      {
        key: 'toggleDefault',
        onClick: () => setAsDefault(key, isDefault),
        label: !isDefault
          ? t('dashboard.taxonomy.addNew.concepts.setDefault')
          : t('dashboard.taxonomy.addNew.concepts.clearDefault'),
        'data-cy': 'taxonomy-concept-row-default-btn',
      },
    ];

    return (
      <Menu>
        {menuItems.map(({ key, onClick, label, ...dataAttrs }) => (
          <Menu.Item key={key} onClick={onClick} {...dataAttrs}>
            {label}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

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
          lanKey: col?.key,
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
                const defaultIcon = record?.isDefault ? (
                  <div className="default-star" data-cy="row-default-indicator">
                    <StarFilled style={{ color: '#0F0E98', fontSize: 16 }} />
                  </div>
                ) : null;
                if (!record.children || record.children.length === 0) return defaultIcon;

                const isDefault = record?.isDefault;
                const containerStyle = isDefault ? { display: 'flex' } : {};
                const iconStyle = { fontSize: 16, display: 'grid', placeContent: 'center' };

                return (
                  <div
                    className="icon-container expand-icon-container"
                    style={containerStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      return onExpand(record, e);
                    }}>
                    {expanded ? <MinusOutlined style={iconStyle} /> : <PlusOutlined style={iconStyle} />}
                    {defaultIcon}
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
