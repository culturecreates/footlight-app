import React, { useState, useEffect } from 'react';
import { Form, Tree, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import CustomModal from '../Modal/Common/CustomModal';
import PrimaryButton from '../Button/Primary';
import { EditOutlined } from '@ant-design/icons';
import TextButton from '../Button/Text';
import { useOutletContext } from 'react-router-dom';
import { contentLanguage, contentLanguageKeyMap } from '../../constants/contentLanguage';
import Outlined from '../Button/Outlined';
import './draggableTree.css';
import { Confirm } from '../Modal/Confirm/Confirm';
import FormItem from 'antd/es/form/FormItem';
import { capitalizeFirstLetter } from '../../utils/stringManipulations';
import { contentLanguageBilingual } from '../../utils/bilingual';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/reducer/userSlice';
import CreateMultiLingualFormItems from '../../layout/CreateMultiLingualFormItems/CreateMultiLingualFormItems';
import { placeHolderCollectionCreator } from '../../utils/MultiLingualFormItemSupportFunctions';

const DraggableTree = ({
  data,
  setData,
  addNewPopup,
  setAddNewPopup,
  deleteDisplayFlag,
  setDeleteDisplayFlag,
  setEmptyConceptName,
  form,
}) => {
  const { TextArea } = Input;

  const [currentCalendarData] = useOutletContext();
  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { user } = useSelector(getUserDetails);
  const { t } = useTranslation();
  const [treeDataCollection, setTreeDataCollection] = useState({});
  const [forEditing, setForEditing] = useState();
  const [selectedNode, setSetSelectedNode] = useState();
  const [expandedKeys, setExpandedKeys] = useState();
  const [newConceptName, setNewConceptName] = useState();

  const generateFormattedData = (data, language) => {
    const treeData = data.map((item) => {
      let conceptNameCollection = {};
      calendarContentLanguage.forEach((lang) => {
        const conceptNameInCurrentLanguage = item?.name[contentLanguageKeyMap[lang]];
        if (conceptNameInCurrentLanguage) {
          conceptNameCollection[contentLanguageKeyMap[lang]] = conceptNameInCurrentLanguage;
        }
      });
      const requiredLanguageKey = contentLanguageKeyMap[language];
      const card = {
        key: item.key,
        name: contentLanguageBilingual({
          requiredLanguageKey,
          data: item?.name,
          interfaceLanguage: user.interfaceLanguage,
          calendarContentLanguage,
        }),
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="draggable-tree-concept-label grabbable">
              {contentLanguageBilingual({
                requiredLanguageKey,
                data: item?.name,
                interfaceLanguage: user.interfaceLanguage,
                calendarContentLanguage,
              })}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setNewConceptName(conceptNameCollection);
                setSetSelectedNode(item);
                editConceptHandler(item);
              }}>
              <EditOutlined style={{ fontSize: 16 }} />
            </span>
          </div>
        ),
        children: item.children ? generateFormattedData(item.children, language) : undefined,
      };
      return card;
    });
    return treeData;
  };

  useEffect(() => {
    console.log(treeDataCollection);
  }, [treeDataCollection]);

  const combineBothTreeData = (dataSets) => {
    const combinedData = [];
    const dataSetKeyCollection = Object.keys(dataSets);
    const firstTree = dataSets[dataSetKeyCollection[0]];

    for (let index = 0; index < dataSets[dataSetKeyCollection[0]]?.length; index++) {
      let combinedNames = {};
      let combinedElement = {
        id: firstTree[index]?.key,
        key: firstTree[index]?.key,
        name: {},
        children: [],
      };

      dataSetKeyCollection.forEach((conceptLanguageKey) => {
        combinedNames[contentLanguageKeyMap[conceptLanguageKey]] = dataSets[conceptLanguageKey]?.[index]?.name;
      });

      combinedElement = { ...combinedElement, name: combinedNames };

      if (firstTree[index]?.children?.length > 0) {
        let childDataSets = {};
        dataSetKeyCollection.forEach((conceptLanguageKey) => {
          childDataSets[conceptLanguageKey] = dataSets[conceptLanguageKey]?.[index]?.children;
        });
        combinedElement.children = combineBothTreeData(childDataSets);
      }

      const savedElement = findItem(combinedElement.key);
      if (savedElement?.isNew) {
        combinedElement.isNew = savedElement.isNew;
      }
      combinedData.push(combinedElement);
    }
    return combinedData;
  };

  const onDrop = ({ info }) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    let modifiedDataCollection = {};

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

    calendarContentLanguage.forEach((language) => {
      let dragObj;
      loop(treeDataCollection[language], dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });

      if (!info.dropToGap) {
        loop(treeDataCollection[language], dropKey, (item) => {
          item.children = item.children || [];
          item.children.unshift(dragObj);
        });
      } else if ((info.node.children || []).length > 0 && info.node.expanded && dropPosition === 1) {
        loop(treeDataCollection[language], dropKey, (item) => {
          item.children = item.children || [];
          item.children.unshift(dragObj);
        });
      } else {
        let ar = [];
        let i;
        loop(treeDataCollection[language], dropKey, (_item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      }
      modifiedDataCollection[language] = [...treeDataCollection[language]];
    });

    setData(combineBothTreeData(modifiedDataCollection));
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

  const editConceptHandler = (node) => {
    if (node) {
      let conceptNameCollection = {};
      calendarContentLanguage.forEach((language) => {
        conceptNameCollection[contentLanguageKeyMap[language]] = node?.name[contentLanguageKeyMap[language]];
      });
      form.setFieldValue('conceptName', conceptNameCollection);
      setAddNewPopup(true);
      setDeleteDisplayFlag(true);
      setForEditing(true);
    }
  };

  const handleAddChildModalClose = () => {
    setEmptyConceptName();
    let conceptNameCollection = {};
    calendarContentLanguage.forEach((language) => {
      conceptNameCollection[contentLanguageKeyMap[language]] = '';
    });
    form.setFieldValue('conceptName', conceptNameCollection);
    setSetSelectedNode();
    setAddNewPopup(false);
  };

  const handleAddChild = () => {
    const conceptNameCollection = form.getFieldValue('conceptName') || {};

    if (forEditing) {
      const updatedNode = {
        ...selectedNode,
        name: conceptNameCollection,
      };
      const updatedData = updateNodeInData(data, selectedNode?.key, updatedNode);
      setData(updatedData);
      setForEditing(false);
    } else {
      const newChildNode = {
        key: Date.now().toString(),
        id: Date.now().toString(),
        name: conceptNameCollection,
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
    setEmptyConceptName();
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
          setEmptyConceptName();
          handleAddChildModalClose();
        } else {
          setDeleteDisplayFlag(false);
          setData(data);
        }
      },
      content: t('dashboard.taxonomy.addNew.concepts.deleteConceptMessage'),
      okText: t('dashboard.settings.addUser.delete'),
      cancelText: t('dashboard.events.deleteEvent.cancel'),
    });
  };

  const deepCopy = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(deepCopy);
    }
    const copiedObj = {};
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copiedObj[key] = deepCopy(obj[key]);
      }
    }
    return copiedObj;
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

  useEffect(() => {
    if (!calendarContentLanguage) return;
    let t = {};
    calendarContentLanguage.forEach((language) => {
      t[language] = generateFormattedData(data, language);
    });
    setTreeDataCollection(t);
  }, [data, calendarContentLanguage]);

  return (
    <div className="draggable-tree">
      {calendarContentLanguage.map((language) => {
        return (
          <FormItem key={language}>
            <span className="tag-header" data-cy={`span-taxonomy-concept-${language.toLowerCase()}-title`}>
              {t(`common.tab${capitalizeFirstLetter(language)}`)}
            </span>

            <div className="tree-item">
              <Tree
                data-cy={`tree-taxonomy-concept-${language.toLowerCase()}`}
                className="draggable-tree"
                draggable
                blockNode
                expandedKeys={expandedKeys}
                onDrop={(info) =>
                  onDrop({
                    info,
                    treeData: treeDataCollection[language],
                    treeLanguage: contentLanguage.ENGLISH,
                  })
                }
                onExpand={(key) => {
                  setExpandedKeys(key);
                }}
                treeData={treeDataCollection[language]}
              />
            </div>
          </FormItem>
        );
      })}

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
              <CreateMultiLingualFormItems
                calendarContentLanguage={calendarContentLanguage}
                form={form}
                name="conceptName"
                data={newConceptName}
                required={true}
                validations={t('dashboard.taxonomy.addNew.validations.name')}
                dataCy="input-text-area-taxonomy-name-"
                placeholder={placeHolderCollectionCreator({
                  calendarContentLanguage,
                  placeholderBase: 'dashboard.taxonomy.addNew.concepts.placeHolder',
                  t,
                })}>
                <TextArea
                  autoSize
                  autoComplete="off"
                  style={{
                    borderRadius: '4px',
                    border: `${calendarContentLanguage?.length > 1 ? '1px solid #B6C1C9' : '1px solid #b6c1c9'}`,
                    width: '100%',
                  }}
                  size="large"
                />
              </CreateMultiLingualFormItems>
            </Form.Item>
          </div>
        </CustomModal>
      </div>
    </div>
  );
};

export default DraggableTree;
