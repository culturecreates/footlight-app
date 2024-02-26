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
import LanguageFilter from './LanguageFilter';
import { Confirm } from '../Modal/Confirm/Confirm';

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
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { t } = useTranslation();
  const [treeData1, setTreeData1] = useState();
  const [treeData2, setTreeData2] = useState();
  const [forEditing, setForEditing] = useState();
  const [selectedNode, setSetSelectedNode] = useState();
  const [expandedKeys, setExpandedKeys] = useState();

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

  const combineBothTreeData = (dataFr, dataEn) => {
    const combinedData = [];

    for (let index = 0; index < dataFr.length; index++) {
      const elementFr = dataFr[index];
      const elementEn = dataEn[index];
      const savedElement = findItem(elementFr?.key);
      const combinedElement = {
        id: elementFr?.key,
        key: elementFr?.key,
        name: {
          en: elementFr.title?.props?.children[0]?.props?.children,
          fr: elementEn.title?.props?.children[0]?.props?.children,
        },
        ...(savedElement?.isNew && { isNew: savedElement?.isNew }),
        children: [],
      };

      if (elementFr?.children?.length > 0) {
        combinedElement.children = combineBothTreeData(elementFr.children, elementEn.children);
      }

      combinedData.push(combinedElement);
    }

    return combinedData;
  };

  const onDrop = ({ info, treeData, setTreeData, counterpartTreeData, setCounterpartTreeData, treeLanguage }) => {
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

    if (treeLanguage == contentLanguage.FRENCH) setData(combineBothTreeData(treeData, counterpartTreeData));
    else if (treeLanguage == contentLanguage.ENGLISH) setData(combineBothTreeData(counterpartTreeData, treeData));
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
      const updatedData = updateNodeInData(data, selectedNode?.key, updatedNode);
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
      return items.map((item) => {
        if (item.key === key) {
          return updatedNode;
        }
        if (item.children) {
          return {
            ...item,
            children: updateData(item.children),
          };
        }
        return item;
      });
    };

    const newData = updateData([...data]);
    return newData;
  };

  const handleDelete = () => {
    setAddNewPopup(false);
    Confirm({
      title: t('dashboard.taxonomy.addNew.concepts.deleteConceptHeading'),
      onAction: () => {
        if (forEditing && selectedNode) {
          const updatedData = deleteNodeFromData(data, selectedNode.key);
          setData(updatedData);
          setForEditing(false);
          setNewConceptName({ en: '', fr: '' });
          handleAddChildModalClose();
        } else {
          setDeleteDisplayFlag(false);
          setData(data);
        }
      },
      content: t('dashboard.taxonomy.addNew.concepts.deleteConceptMessage'),
      okText: t('dashboard.settings.addUser.leave'),
      cancelText: t('dashboard.events.deleteEvent.cancel'),
    });
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
      <LanguageFilter calendarContentLanguage={calendarContentLanguage}>
        <Form.Item style={{ width: '50%' }} key={contentLanguage.ENGLISH}>
          <span className="tag-header" data-cy="span-taxonomy-concept-english-title">
            {t('dashboard.taxonomy.addNew.concepts.english')}
          </span>
          <div className="tree-item">
            <Tree
              data-cy="tree-taxonomy-concept-english"
              className="draggable-tree"
              draggable
              blockNode
              expandedKeys={expandedKeys}
              onDrop={(info) =>
                onDrop({
                  info,
                  treeData: treeData1,
                  setTreeData: setTreeData1,
                  counterpartTreeData: treeData2,
                  setCounterpartTreeData: setTreeData2,
                  treeLanguage: contentLanguage.ENGLISH,
                })
              }
              onExpand={(key) => {
                setExpandedKeys(key);
              }}
              treeData={treeData2}
              onSelect={handleClick}
            />
          </div>
        </Form.Item>
      </LanguageFilter>

      <LanguageFilter calendarContentLanguage={calendarContentLanguage}>
        <Form.Item key={contentLanguage.FRENCH}>
          <span className="tag-header" data-cy="span-taxonomy-concept-french-title">
            {t('dashboard.taxonomy.addNew.concepts.french')}
          </span>
          <div className="tree-item" style={{ borderRight: 'solid 4px #eff2ff' }}>
            <Tree
              data-cy="tree-taxonomy-concept-french"
              className="draggable-tree"
              draggable
              blockNode
              expandedKeys={expandedKeys}
              onDrop={(info) =>
                onDrop({
                  info,
                  treeData: treeData2,
                  setTreeData: setTreeData2,
                  counterpartTreeData: treeData1,
                  setCounterpartTreeData: setTreeData1,
                  treeLanguage: contentLanguage.FRENCH,
                })
              }
              onExpand={(key) => {
                setExpandedKeys(key);
              }}
              treeData={treeData1}
              onSelect={handleClick}
              on
            />
          </div>
        </Form.Item>
      </LanguageFilter>

      <div className="addmodal">
        <CustomModal
          data-cy="modal-taxonomy-concept"
          open={addNewPopup}
          destroyOnClose
          afterClose={() => {
            setForEditing(false);
          }}
          centered
          title={
            <span className="quick-create-organization-modal-title" data-cy="span-taxonomy-concept-add-edit">
              {!forEditing ? t('dashboard.taxonomy.addNew.concepts.add') : t('dashboard.taxonomy.addNew.concepts.edit')}
            </span>
          }
          onCancel={() => handleAddChildModalClose()}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {deleteDisplayFlag && (
                <div key="delete-contaoner" className="delete-contaioner">
                  <Outlined
                    data-cy="button-taxonomy-concept-delete"
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
                  data-cy="button-taxonomy-concept-cancel"
                  key="cancel"
                  size="large"
                  label={t('dashboard.events.addEditEvent.quickCreate.cancel')}
                  onClick={() => handleAddChildModalClose()}
                />
                <PrimaryButton
                  data-cy="button-taxonomy-concept-edit"
                  key="add-dates"
                  label={
                    forEditing
                      ? t('dashboard.taxonomy.addNew.concepts.editBtn')
                      : t('dashboard.events.addEditEvent.quickCreate.create')
                  }
                  onClick={handleAddChild}
                />
              </div>
            </div>
          }>
          <div className="add-new-concept-wrapper">
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
                          } else
                            return Promise.reject(new Error(t('dashboard.taxonomy.addNew.validations.conceptName')));
                        },
                      }),
                    ]}>
                    <TextArea
                      data-cy="input-text-area-concept-name-french"
                      autoSize
                      autoComplete="off"
                      placeholder={t('dashboard.taxonomy.addNew.concepts.placeHolderFr')}
                      onChange={(e) => {
                        setNewConceptName({ ...newConceptName, fr: e.target.value });
                      }}
                      style={{
                        borderRadius: '4px',
                        border: `${
                          calendarContentLanguage === contentLanguage.BILINGUAL
                            ? '4px solid #E8E8E8'
                            : '1px solid #b6c1c9'
                        }`,
                        width: '423px',
                      }}
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
                          } else
                            return Promise.reject(new Error(t('dashboard.taxonomy.addNew.validations.conceptName')));
                        },
                      }),
                    ]}>
                    <TextArea
                      data-cy="input-text-area-concept-name-english"
                      autoSize
                      autoComplete="off"
                      onChange={(e) => {
                        setNewConceptName({ ...newConceptName, en: e.target.value });
                      }}
                      placeholder={t('dashboard.taxonomy.addNew.concepts.placeHolderEn')}
                      style={{
                        borderRadius: '4px',
                        border: `${
                          calendarContentLanguage === contentLanguage.BILINGUAL
                            ? '4px solid #E8E8E8'
                            : '1px solid #b6c1c9'
                        }`,
                        width: '423px',
                      }}
                      size="large"
                    />
                  </Form.Item>
                </BilingualInput>
              </ContentLanguageInput>
            </Form.Item>
          </div>
        </CustomModal>
      </div>
    </div>
  );
};

export default DraggableTree;
