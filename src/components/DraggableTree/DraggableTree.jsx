import React, { useState, useEffect } from 'react';
import { Form, Tree, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

const formatTreeData = (data, language) => {
  const formattedData = [];

  const traverse = (node, parentKey) => {
    const key = parentKey ? `${parentKey}-${node.id}` : `${node.id}`;

    const formattedNode = {
      key,
      title: node.name[language],
    };

    if (node.children && node.children.length > 0) {
      formattedNode.children = node.children.map((child) => traverse(child, key));
    }

    return formattedNode;
  };

  data?.concepts?.forEach((node) => {
    formattedData.push(traverse(node));
  });

  return formattedData;
};

const DraggableTree = ({ data }) => {
  const [engGData, setEngGData] = useState(formatTreeData(data, 'en'));
  const [frenchGData, setFrenchGData] = useState(formatTreeData(data, 'fr'));
  const [expandedKeys] = useState(['0-0', '0-0-0', '0-0-0-0']);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const { t } = useTranslation();

  const updateTreeData = (dragKey, dropKey, dropPos, language) => {
    const updateData = (treeData) => {
      const dragIndex = treeData.findIndex((item) => item.key === dragKey);
      const dropIndex = treeData.findIndex((item) => item.key === dropKey);

      if (dragIndex !== -1 && dropIndex !== -1) {
        const [draggedItem] = treeData.splice(dragIndex, 1);
        treeData.splice(dropPos === -1 ? dropIndex : dropIndex + 1, 0, draggedItem);
      }

      return treeData;
    };

    if (language === 'en') {
      setEngGData((prevData) => updateData([...prevData]));
    } else if (language === 'fr') {
      setFrenchGData((prevData) => updateData([...prevData]));
    }
  };

  const onDragEnter = (info) => {
    console.log(info);
  };

  const onDrop = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.dropPosition;

    if (dragKey.split('-').slice(0, -1).join('-') !== dropKey.split('-').slice(0, -1).join('-')) {
      const parentKey = dropKey.split('-').slice(0, -1).join('-');
      updateTreeData(dragKey, parentKey, 1, 'en');
      updateTreeData(dragKey, parentKey, 1, 'fr');
      return;
    }

    updateTreeData(dragKey, dropKey, dropPos, 'en');
    updateTreeData(dragKey, dropKey, dropPos, 'fr');
  };

  const handleClick = (node) => {
    setSelectedNode(node);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    setEngGData(formatTreeData(data, 'en'));
    setFrenchGData(formatTreeData(data, 'fr'));
  }, [data]);

  return (
    <>
      <Form.Item style={{ width: '50%' }}>
        <span className="tag-header">{t('dashboard.taxonomy.addNew.concepts.english')}</span>
        <Tree
          className="draggable-tree"
          defaultExpandedKeys={expandedKeys}
          draggable
          blockNode
          onDragEnter={onDragEnter}
          onDrop={onDrop}
          treeData={engGData}
          onSelect={(selectedKeys, { node }) => handleClick(node)}
        />
      </Form.Item>
      <Form.Item style={{ width: '50%' }}>
        <span className="tag-header">{t('dashboard.taxonomy.addNew.concepts.french')}</span>
        <Tree
          className="draggable-tree"
          defaultExpandedKeys={expandedKeys}
          draggable
          blockNode
          onDragEnter={onDragEnter}
          onDrop={onDrop}
          treeData={frenchGData}
          onSelect={(selectedKeys, { node }) => handleClick(node)}
        />
      </Form.Item>
      <Modal title="Node Details" open={modalVisible} onCancel={handleModalClose} footer={null}>
        {selectedNode && (
          <>
            <p>{`Key: ${selectedNode.key}`}</p>
            <p>{`Title: ${selectedNode.title}`}</p>
          </>
        )}
      </Modal>
    </>
  );
};

export default DraggableTree;
