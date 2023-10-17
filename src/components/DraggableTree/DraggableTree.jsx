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

const DraggableTree = ({
  data,
  setData,
  addNewPopup,
  setAddNewPopup,
  deleteDisplayFlag,
  setDeleteDisplayFlag,
  newConceptName,
  setNewConceptName,
  form,
}) => {
  const { TextArea } = Input;

  const [currentCalendarData] = useOutletContext();
  //   const timestampRef = useRef(Date.now()).current;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { t } = useTranslation();
  const [treeData1, setTreeData1] = useState();
  const [treeData2, setTreeData2] = useState();
  const [forEditing, setForEditing] = useState();
  const [selectedNode, setSetSelectedNode] = useState();

  const generateFormattedData = (data, isTree1) => {
    return data.map((item) => ({
      key: item.key,
      title: isTree1 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{item.name?.fr}</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setNewConceptName({ en: item.name?.en, fr: item.name?.fr });
              setSetSelectedNode(item);
              editConceptHandler(item);
            }}>
            <EditOutlined style={{ fontSize: 16 }} />
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{item.name?.en}</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setSetSelectedNode(item);
              setNewConceptName({ en: item.name?.en, fr: item.name?.fr });
              editConceptHandler(item);
            }}>
            <EditOutlined style={{ fontSize: 16 }} />
          </span>
        </div>
      ),
      children: item.children ? generateFormattedData(item.children, isTree1) : undefined,
    }));
  };

  const onDrop = (info, treeData, setTreeData, counterpartTreeData, setCounterpartTreeData) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    };

    let dragObj;
    loop(treeData, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      loop(treeData, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else if ((info.node.children || []).length > 0 && info.node.expanded && dropPosition === 1) {
      loop(treeData, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else {
      let ar = [];
      let i;
      loop(treeData, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    let dragObj2;
    loop(counterpartTreeData, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj2 = item;
    });
    if (!info.dropToGap) {
      loop(counterpartTreeData, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj2);
      });
    } else if ((info.node.children || []).length > 0 && info.node.expanded && dropPosition === 1) {
      loop(counterpartTreeData, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj2);
      });
    } else {
      let ar = [];
      let i;
      loop(counterpartTreeData, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj2);
      } else {
        ar.splice(i + 1, 0, dragObj2);
      }
    }

    setTreeData([...treeData]);
    setCounterpartTreeData([...counterpartTreeData]);
  };

  const findItem = (key) => {
    const helper = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          return items[i];
        }
        if (items[i].children) {
          const foundItem = helper(items[i].children);
          if (foundItem) {
            return foundItem;
          }
        }
      }
      return null;
    };

    return helper(data);
  };

  const handleClick = (selectedKeys, e) => {
    const currentNode = findItem(e.node.key);
    setDeleteDisplayFlag(false);
    if (e.selected) {
      setSetSelectedNode(currentNode);
      setNewConceptName({ en: '', fr: '' });
      form.setFieldsValue({
        frenchconcept: '',
        englishconcept: '',
      });
      setAddNewPopup(true);
    } else setSetSelectedNode();
  };

  const editConceptHandler = (node) => {
    if (node) {
      form.setFieldsValue({
        frenchconcept: node?.name?.fr,
        englishconcept: node?.name?.enƒ,
      });
      setAddNewPopup(true);
      setDeleteDisplayFlag(true);
      setForEditing(true);
    }
  };

  const handleAddChildModalClose = () => {
    setNewConceptName({ en: '', fr: '' });
    form.setFieldsValue({
      frenchconcept: '',
      englishconcept: '',
    });
    setSetSelectedNode();
    setAddNewPopup(false);
  };

  const handleAddChild = () => {
    if (forEditing) {
      const updatedNode = {
        ...selectedNode,
        name: { en: newConceptName?.en, fr: newConceptName?.fr },
      };

      const updatedData = updateNodeInData(data, selectedNode.key, updatedNode);
      setData(updatedData);
      setForEditing(false);
    } else {
      const newChildNode = {
        key: Date.now().toString(),
        id: Date.now().toString(),
        name: { en: newConceptName?.en, fr: newConceptName?.fr },
        children: [],
        isNew: true,
      };
      if (selectedNode) {
        const updatedData = updateNodeInData(data, selectedNode.key, {
          ...selectedNode,
          children: [...(selectedNode.children || []), newChildNode],
        });
        setData(updatedData);
      } else {
        const updatedData = [...data, newChildNode];
        setData(updatedData);
      }
    }
    setNewConceptName({ en: '', fr: '' });
    handleAddChildModalClose();
    setSetSelectedNode();
  };

  const updateNodeInData = (data, key, updatedNode) => {
    const updateData = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          items[i] = updatedNode;
          return data;
        }
        if (items[i].children) {
          updateData(items[i].children);
        }
      }
    };

    const newData = [...data];
    updateData(newData);
    return newData;
  };

  const handleDelete = () => {
    if (forEditing && selectedNode) {
      const updatedData = deleteNodeFromData(data, selectedNode.key);
      setData(updatedData);

      setNewConceptName({ en: '', fr: '' });
      handleAddChildModalClose();
    } else {
      setDeleteDisplayFlag(false);
      setData(data);
    }
  };

  const deleteNodeFromData = (data, key) => {
    const deleteData = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          items.splice(i, 1);
          return data;
        }
        if (items[i].children) {
          deleteData(items[i].children);
        }
      }
    };

    const newData = [...data];
    deleteData(newData);
    return newData;
  };

  useEffect(() => {
    setTreeData1(generateFormattedData(data, true));
    setTreeData2(generateFormattedData(data, false));
  }, [data]);

  return (
    <div className="draggable-tree">
      <Form.Item style={{ width: '50%' }}>
        <span className="tag-header">{t('dashboard.taxonomy.addNew.concepts.english')}</span>
        <div className="tree-item">
          <Tree
            className="draggable-tree"
            draggable
            blockNode
            onDrop={(info) => onDrop(info, treeData1, setTreeData1, treeData2, setTreeData2)}
            treeData={treeData1}
            onSelect={handleClick}
          />
        </div>
      </Form.Item>
      <Form.Item style={{ width: '50%' }}>
        <span className="tag-header">{t('dashboard.taxonomy.addNew.concepts.french')}</span>
        <div className="tree-item" style={{ borderRight: 'solid 4px #eff2ff' }}>
          <Tree
            className="draggable-tree"
            draggable
            blockNode
            onDrop={(info) => onDrop(info, treeData2, setTreeData2, treeData1, setTreeData1)}
            treeData={treeData2}
            onSelect={handleClick}
            on
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
                  name="frenchconcept"
                  key={contentLanguage.FRENCH}
                  dependencies={['english']}
                  initialValue={newConceptName?.fr}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value || getFieldValue('englishconcept')) {
                          return Promise.resolve();
                        } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.validations.conceptName')));
                      },
                    }),
                  ]}>
                  <TextArea
                    autoSize
                    autoComplete="off"
                    placeholder={t('dashboard.taxonomy.addNew.frDescriptionPlaceHolder')}
                    onChange={(e) => {
                      setNewConceptName({ ...newConceptName, fr: e.target.value });
                    }}
                    style={{ borderRadius: '4px', border: '4px solid #E8E8E8', width: '423px' }}
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="englishconcept"
                  key={contentLanguage.ENGLISH}
                  dependencies={['french']}
                  initialValue={newConceptName?.en}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value || getFieldValue('frenchconcept')) {
                          return Promise.resolve();
                        } else return Promise.reject(new Error(t('dashboard.taxonomy.addNew.validations.conceptName')));
                      },
                    }),
                  ]}>
                  <TextArea
                    autoSize
                    autoComplete="off"
                    onChange={(e) => {
                      setNewConceptName({ ...newConceptName, en: e.target.value });
                    }}
                    placeholder={t('dashboard.taxonomy.addNew.enDescriptionPlaceHolder')}
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
