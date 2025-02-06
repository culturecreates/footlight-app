import { DownloadOutlined, DeleteOutlined, HolderOutlined, MoreOutlined } from '@ant-design/icons';
import { Dropdown, Upload, message, Space } from 'antd';
import update from 'immutability-helper';
import React, { useCallback, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import Outlined from '../Button/Outlined';
const type = 'DragableUploadList';
import './multipleImageUpload.css';
import { getWidthFromAspectRatio } from '../../utils/getWidthFromAspectRatio';
import { useOutletContext } from 'react-router-dom';
import { IMAGE_ACTIONS, imageUploadOptions } from '../../constants/imageUploadOptions';
import ImageCredits from '../Modal/ImageCredit';
import Credit from '../Tags/Credit';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';

const DragableUploadListItem = ({
  moveRow,
  file,
  fileList,
  actions,
  width,
  setSelectedField,
  setImageOptionsModalOpen,
  setSelectedImageOptions,
  t,
  setSelectedUID,
  form,
}) => {
  const ref = useRef(null);

  const index = fileList.indexOf(file);
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
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: {
      index,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  return (
    <div
      ref={ref}
      className={`ant-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
      style={{
        cursor: 'grab',
      }}>
      <span className="image-footer">
        <span className="image-contents">
          <span className="image-actions">
            <span
              onClick={actions?.download}
              data-cy="span-download-image"
              style={{
                cursor: 'grab',
              }}>
              <HolderOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '22px' }} />
            </span>
          </span>
          <img
            className="image-thumbnail"
            src={file?.url ?? file?.thumbUrl}
            style={{
              width: width ? `${width}px` : 'auto',
              minWidth: width ? `${width}px` : 'none',
            }}
          />
          <span className="image-name-wrapper" data-cy="span-multiple-image-name-wrapper">
            <a
              className="image-name"
              target="_blank"
              rel="noopener noreferrer"
              href={file?.url}
              data-cy="anchor-image-link">
              {file?.name}
            </a>
            <span className="image-credits" data-cy="span-multiple-image-credits">
              {file?.imageOptions &&
                Object.entries(file?.imageOptions).map(([key, value]) => {
                  if (
                    value &&
                    typeof value === 'object' &&
                    Object.values(value).some((langValue) => langValue && langValue !== '')
                  ) {
                    return (
                      <Credit key={key} data-cy={`span-image-credit-${key}`}>
                        {t(`dashboard.events.addEditEvent.otherInformation.image.modalTexts.${key}.${key}`)}
                      </Credit>
                    );
                  }
                  return null;
                })}
            </span>
          </span>
        </span>
        <span className="image-actions">
          {file?.url && (
            <Dropdown
              overlayStyle={{ width: '200px' }}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              menu={{
                items: imageUploadOptions({
                  credits: file.imageOptions?.credit,
                  altText: file.imageOptions?.altText,
                  caption: file.imageOptions?.caption,
                }),
                onClick: ({ key }) => {
                  switch (key) {
                    case IMAGE_ACTIONS.CROP:
                      actions.preview();
                      break;

                    case IMAGE_ACTIONS.CREDIT:
                    case IMAGE_ACTIONS.ALT_TEXT:
                    case IMAGE_ACTIONS.CAPTION:
                      form.setFieldsValue({
                        credit: file.imageOptions?.credit,
                        altText: file.imageOptions?.altText,
                        caption: file.imageOptions?.caption,
                      });
                      setSelectedImageOptions(file.imageOptions);

                      setSelectedField(key);
                      setSelectedUID(file.uid);
                      setImageOptionsModalOpen(true);
                      break;

                    case IMAGE_ACTIONS.DELETE:
                      actions.remove();
                      break;

                    default:
                      break;
                  }
                },
              }}
              trigger={['click']}>
              <Space>
                <MoreOutlined
                  className="image-options-more-icon"
                  style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }}
                  data-cy="span-image-options-icon"
                />
              </Space>
            </Dropdown>
          )}
        </span>
      </span>
    </div>
  );
};

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
  reader.addEventListener('load', (event) => {
    const _loadedImageUrl = event.target.result;
    const image = document.createElement('img');
    image.src = _loadedImageUrl;
  });
};

const generateImageObject = (image) => {
  if (!image) return {};

  return {
    uid: image?.original?.entityId,
    name: image?.original?.entityId,
    status: 'done',
    url: image?.original?.uri,
    cropValues: {
      large: {
        x: image?.large?.xCoordinate ?? undefined,
        y: image?.large?.yCoordinate ?? undefined,
        height: image?.large?.height ?? undefined,
        width: image?.large?.width ?? undefined,
      },
      original: {
        entityId: image?.original?.entityId ?? null,
        height: image?.original?.height ?? undefined,
        width: image?.original?.width ?? undefined,
      },
      thumbnail: {
        x: image?.thumbnail?.xCoordinate ?? undefined,
        y: image?.thumbnail?.yCoordinate ?? undefined,
        height: image?.thumbnail?.height ?? undefined,
        width: image?.thumbnail?.width ?? undefined,
      },
    },
    imageOptions: {
      credit:
        image?.creditText ??
        Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
          acc[contentLanguageKeyMap[lang]] = '';
          return acc;
        }, {}),
      altText:
        image?.description ??
        Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
          acc[contentLanguageKeyMap[lang]] = '';
          return acc;
        }, {}),
      caption:
        image?.caption ??
        Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
          acc[contentLanguageKeyMap[lang]] = '';
          return acc;
        }, {}),
    },
  };
};

const MultipleImageUpload = (props) => {
  const { eventImageData, form, imageReadOnly, setShowDialog } = props;
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();

  const [fileList, setFileList] = useState(
    eventImageData?.length > 0 ? eventImageData?.map(generateImageObject)?.flat() : [],
  );
  const [imageOptionsModalOpen, setImageOptionsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedImageOptions, setSelectedImageOptions] = useState({
    credit: Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
      acc[contentLanguageKeyMap[lang]] = '';
      return acc;
    }, {}),
    altText: Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
      acc[contentLanguageKeyMap[lang]] = '';
      return acc;
    }, {}),
    caption: Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
      acc[contentLanguageKeyMap[lang]] = '';
      return acc;
    }, {}),
  });
  const [selectedUID, setSelectedUID] = useState(null);

  let aspectRatio;
  let width;

  if (currentCalendarData?.imageConfig[0]?.thumbnail?.aspectRatio) {
    aspectRatio = currentCalendarData.imageConfig[0]?.large.aspectRatio;
    width = getWidthFromAspectRatio(aspectRatio, 48);
  }

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = fileList[dragIndex];
      let newFileList = update(fileList, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRow],
        ],
      });
      setFileList(newFileList);
      form.setFieldsValue({
        multipleImagesCrop: newFileList,
      });
    },
    [fileList],
  );
  const onChange = ({ fileList: newFileList }) => {
    let fileList = newFileList;
    newFileList?.forEach((_, index) => {
      if (newFileList[index].originFileObj) {
        getBase64(newFileList[index].originFileObj, (url) => {
          fileList[index].url = url;
          if (!fileList[index].cropValues)
            fileList[index].cropValues = {
              large: {
                x: undefined,
                y: undefined,
                height: undefined,
                width: undefined,
              },
              original: {
                entityId: null,
                height: undefined,
                width: undefined,
              },
              thumbnail: {
                x: undefined,
                y: undefined,
                height: undefined,
                width: undefined,
              },
            };
          if (!fileList[index].imageOptions)
            fileList[index].imageOptions = {
              credit: Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
                acc[contentLanguageKeyMap[lang]] = '';
                return acc;
              }, {}),
              altText: Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
                acc[contentLanguageKeyMap[lang]] = '';
                return acc;
              }, {}),
              caption: Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
                acc[contentLanguageKeyMap[lang]] = '';
                return acc;
              }, {}),
            };
          fileList[index].status = 'done';
        });
      }
    });
    setFileList(fileList);
    form.setFieldsValue({
      multipleImagesCrop: newFileList,
    });
    if (setShowDialog) setShowDialog(true);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error(t('dashboard.events.addEditEvent.otherInformation.image.subHeading'));
    }
    return isJpgOrPng;
  };

  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };
  return (
    <div className="multiple-image-upload-wrapper">
      <DndProvider backend={HTML5Backend}>
        <Upload
          fileList={fileList}
          listType="picture"
          onChange={onChange}
          className="multiple-image-upload"
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          showUploadList={{
            showRemoveIcon: imageReadOnly ? false : true,
            removeIcon: <DeleteOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }} />,
          }}
          multiple
          itemRender={(originNode, file, currFileList, actions) =>
            !imageReadOnly ? (
              <DragableUploadListItem
                originNode={originNode}
                file={file}
                fileList={currFileList}
                moveRow={moveRow}
                actions={actions}
                width={width}
                setSelectedField={setSelectedField}
                setImageOptionsModalOpen={setImageOptionsModalOpen}
                setSelectedImageOptions={setSelectedImageOptions}
                t={t}
                selectedUID={selectedUID}
                setSelectedUID={setSelectedUID}
                form={form}
              />
            ) : (
              <span className="image-footer">
                <span className="image-contents">
                  <img
                    className="image-thumbnail"
                    src={file?.url ?? file?.thumbUrl}
                    style={{
                      width: width ? `${width}px` : 'auto',
                      minWidth: width ? `${width}px` : 'none',
                    }}
                  />
                  <span className="image-name-wrapper" data-cy="span-multiple-image-name-wrapper-read-only">
                    <a
                      className="image-name"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={file?.url}
                      data-cy="anchor-image-link">
                      {file?.name}
                    </a>
                    <span className="image-credits" data-cy="span-maultiple-image-credits-read-only">
                      {file?.imageOptions &&
                        Object.entries(file?.imageOptions).map(([key, value]) => {
                          if (
                            value &&
                            typeof value === 'object' &&
                            Object.values(value).some((langValue) => langValue && langValue !== '')
                          ) {
                            return (
                              <Credit key={key} data-cy={`span-image-credit-${key}`}>
                                {t(`dashboard.events.addEditEvent.otherInformation.image.modalTexts.${key}.${key}`)}
                              </Credit>
                            );
                          }
                          return null;
                        })}
                    </span>
                  </span>
                </span>
                <span className="image-actions">
                  <span onClick={actions?.download} data-cy="span-download-image">
                    <DownloadOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }} />
                  </span>
                </span>
              </span>
            )
          }>
          {!imageReadOnly && (
            <div style={{ padding: 8 }} className="upload-box">
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}>
                <Outlined size="large" label={t('dashboard.events.addEditEvent.otherInformation.image.browse')} />

                <span className="upload-helper-text">
                  {t('dashboard.events.addEditEvent.otherInformation.image.dragAndDrop')}
                </span>
              </span>
            </div>
          )}
        </Upload>
      </DndProvider>
      <ImageCredits
        open={imageOptionsModalOpen}
        selectedField={selectedField}
        setOpen={setImageOptionsModalOpen}
        form={form}
        isImageGallery={true}
        setImageOptions={setSelectedImageOptions}
        imageOptions={selectedImageOptions}
        fileList={fileList}
        setFileList={setFileList}
        selectedUID={selectedUID}
        setSelectedUID={setSelectedUID}
        calendarContentLanguage={currentCalendarData?.contentLanguage}
      />
    </div>
  );
};
export default MultipleImageUpload;
