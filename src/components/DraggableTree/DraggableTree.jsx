import React, { useState, useEffect } from 'react';
import { Form, Tree, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import CustomModal from '../Modal/Common/CustomModal';
import PrimaryButton from '../../components/Button/Primary';
import { EditOutlined } from '@ant-design/icons';
import TextButton from '../../components/Button/Text';
import { useOutletContext } from 'react-router-dom';
import { contentLanguage } from '../../constants/contentLanguage';
import ContentLanguageInput from '../ContentLanguageInput';
import Outlined from '../../components/Button/Outlined';
import BilingualInput from '../BilingualInput';
import './draggableTree.css';

const DraggableTree = ({ data, setData, addNewPopup, setAddNewPopup, deleteDisplayFlag, setDeleteDisplayFlag }) => {
  const { TextArea } = Input;

  const [currentCalendarData] = useOutletContext();
  //   const timestampRef = useRef(Date.now()).current;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const [engGData, setEngGData] = useState([]);
  const [frenchGData, setFrenchGData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState(['0-0', '0-0-0', '0-0-0-0']);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newConceptName, setNewConceptName] = useState({});

  const { t } = useTranslation();

  const formatTreeData = (data, language) => {
    const formattedData = [];

    const traverse = (node, parentKey) => {
      const key = parentKey ? `${parentKey}-${node.id}` : `${node.id}`;

      const formattedNode = {
        key,
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{node.name[language]}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                editConceptHandler(node);
              }}>
              <EditOutlined style={{ fontSize: 16 }} />
            </span>
          </div>
        ),
      };

      if (node.children && node.children.length > 0) {
        formattedNode.children = node.children.map((child) => traverse(child, key));
      }

      return formattedNode;
    };

    data?.forEach((node) => {
      formattedData.push(traverse(node));
    });

    return formattedData;
  };

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
    setExpandedKeys(info.expandedKeys);
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
    console.log(selectedNode);
    setAddNewPopup(true);
  };

  const editConceptHandler = (node) => {
    console.log(node);
  };

  const handleAddChildModalClose = () => {
    setNewConceptName('');
    setAddNewPopup(false);
  };

  const handleAddChild = () => {
    const newChildNode = {
      id: Date.now(),
      name: { en: newConceptName, fr: newConceptName },
      children: [],
    };

    const updatedData = [...data];
    updatedData.push(newChildNode);
    setData(updatedData);

    handleAddChildModalClose();
  };

  //   const findNode = (data, key) => {
  //     for (let i = 0; i < data.length; i++) {
  //       if (data[i].key === key) {
  //         return data[i];
  //       }
  //       if (data[i].children) {
  //         const foundNode = findNode(data[i].children, key);
  //         if (foundNode) return foundNode;
  //       }
  //     }
  //     return null;
  //   };

  const handleDelete = () => {
    setDeleteDisplayFlag(false);
    setData(data);
  };

  useEffect(() => {
    setEngGData(formatTreeData(data, 'en'));
    setFrenchGData(formatTreeData(data, 'fr'));
  }, [data]);

  return (
    <div className="draggable-tree">
      <Form.Item style={{ width: '50%' }}>
        <span className="tag-header">{t('dashboard.taxonomy.addNew.concepts.english')}</span>
        <div className="tree-item">
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
        </div>
      </Form.Item>
      <Form.Item style={{ width: '50%' }}>
        <span className="tag-header">{t('dashboard.taxonomy.addNew.concepts.french')}</span>
        <div className="tree-item" style={{ borderRight: 'solid 4px #eff2ff' }}>
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
        </div>
      </Form.Item>

      <div className="addmodal">
        <CustomModal
          open={addNewPopup}
          destroyOnClose
          centered
          title={
            <span className="quick-create-organization-modal-title">{t('dashboard.taxonomy.addNew.concepts.add')}</span>
          }
          onCancel={() => handleAddChildModalClose()}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {deleteDisplayFlag && (
                <div key="delete-contaoner" className="delete-contaioner">
                  <Outlined
                    key="delete"
                    label={t('dashboard.settings.addUser.delete')}
                    onClick={() => handleDelete()}
                    style={{
                      border: '2px solid var(--content-alert-error, #f43131)',
                      background: 'var(--background-neutrals-transparent, rgba(255, 255, 255, 0))',
                      color: '#CE1111',
                    }}
                  />
                </div>
              )}
              <div style={{ flexGrow: 1 }}>
                <TextButton
                  key="cancel"
                  size="large"
                  label={t('dashboard.events.addEditEvent.quickCreate.cancel')}
                  onClick={() => handleAddChildModalClose()}
                />
                <PrimaryButton
                  key="add-dates"
                  label={t('dashboard.events.addEditEvent.quickCreate.create')}
                  onClick={handleAddChild}
                />
              </div>
            </div>
          }>
          <Form.Item label={t('dashboard.taxonomy.addNew.concepts.conceptName')}>
            <ContentLanguageInput calendarContentLanguage={calendarContentLanguage}>
              <BilingualInput fieldData={newConceptName}>
                <Form.Item
                  name="french"
                  key={contentLanguage.FRENCH}
                  dependencies={['english']}
                  //   rules={[
                  //     ({ getFieldValue }) => ({
                  //       validator(_, value) {
                  //         if (value || getFieldValue('english')) {
                  //           return Promise.resolve();
                  //         } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                  //       },
                  //     }),
                  //   ]}
                >
                  <TextArea
                    autoSize
                    autoComplete="off"
                    placeholder={t('dashboard.taxonomy.addNew.frDescriptionPlaceHolder')}
                    onChange={(e) => setNewConceptName(e.target.value)}
                    style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="english"
                  key={contentLanguage.ENGLISH}
                  dependencies={['french']}
                  //   rules={[
                  //     ({ getFieldValue }) => ({
                  //       validator(_, value) {
                  //         if (value || getFieldValue('french')) {
                  //           return Promise.resolve();
                  //         } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.')));
                  //       },
                  //     }),
                  //   ]}
                >
                  <TextArea
                    autoSize
                    autoComplete="off"
                    placeholder={t('dashboard.taxonomy.addNew.enDescriptionPlaceHolder')}
                    onChange={(e) => setNewConceptName(e.target.value)}
                    style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                    size="large"
                  />
                </Form.Item>
              </BilingualInput>
            </ContentLanguageInput>
          </Form.Item>
        </CustomModal>
      </div>
    </div>
  );
};

export default DraggableTree;
