import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
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

const DragableUploadListItem = ({ moveRow, file, fileList, actions, width }) => {
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
  // const errorNode = <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>;
  return (
    <div
      ref={ref}
      className={`ant-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
      style={{
        cursor: 'grab',
      }}>
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
          <a
            className="image-name"
            target="_blank"
            rel="noopener noreferrer"
            href={file?.url}
            data-cy="anchor-image-link">
            {file?.name}
          </a>
        </span>
        <span className="image-actions">
          <span onClick={actions?.remove} data-cy="span-download-image">
            <DeleteOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }} />
          </span>
        </span>
      </span>
      {/* {file.status === 'error' ? errorNode : originNode} */}
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
const MultipleImageUpload = (props) => {
  const { eventImageData, form, imageReadOnly } = props;
  const { t } = useTranslation();
  const [currentCalendarData] = useOutletContext();

  const [fileList, setFileList] = useState(
    eventImageData?.length > 0
      ? eventImageData?.map((image) => {
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
          };
        })
      : [],
  );

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
          fileList[index].status = 'done';
        });
      }
    });
    setFileList(fileList);
    form.setFieldsValue({
      multipleImagesCrop: newFileList,
    });
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
                  <a
                    className="image-name"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={file?.url}
                    data-cy="anchor-image-link">
                    {file?.name}
                  </a>
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
    </div>
  );
};
export default MultipleImageUpload;
