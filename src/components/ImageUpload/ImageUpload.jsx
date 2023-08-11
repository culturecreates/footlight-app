import React, { useState } from 'react';
import './imageUpload.css';
import { message, Upload, Form } from 'antd';
import { LoadingOutlined, DownloadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Outlined from '../Button/Outlined';
import { useTranslation } from 'react-i18next';
import ImageCrop from '../ImageCrop';

function ImageUpload(props) {
  const { setImageCropOpen, imageCropOpen, form } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(props?.imageUrl ?? null);
  const [cropValues, setCropValues] = useState({
    large: {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    },
    thumbnail: {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    },
    original: {
      entityId: false,
      width: 0,
      height: 0,
    },
  });

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    console.log(e?.fileList);
    return e?.fileList;
  };
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
    reader.addEventListener('load', (event) => {
      const _loadedImageUrl = event.target.result;
      const image = document.createElement('img');
      image.src = _loadedImageUrl;
      image.addEventListener('load', () => {
        const { width, height } = image;
        setCropValues({
          ...cropValues,
          original: {
            height,
            width,
          },
        });
      });
    });
  };
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error(t('dashboard.events.addEditEvent.otherInformation.image.subHeading'));
    }
    return isJpgOrPng;
  };
  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
        setImageCropOpen(true);
      });
    }
  };

  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  const onRemove = () => {
    setImageUrl(false);
  };
  const uploadButton = (
    <div style={{ padding: 8 }}>
      {loading ? <LoadingOutlined /> : <></>}
      <span
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
        }}>
        <Outlined size="large" label={t('dashboard.events.addEditEvent.otherInformation.image.browse')} />
        <span style={{ color: '#646D7B', fontWeight: '400', fontSize: '16px' }}>
          {t('dashboard.events.addEditEvent.otherInformation.image.dragAndDrop')}
        </span>
      </span>
    </div>
  );

  return (
    <>
      <Form.Item name="dragger" valuePropName="fileList" getValueFromEvent={normFile}>
        <Upload.Dragger
          name="eventImage"
          accept='.png, .jpg, .jpeg"'
          className="upload-wrapper"
          multiple={false}
          customRequest={customRequest}
          disabled={props?.imageReadOnly}
          maxCount={1}
          onRemove={onRemove}
          defaultFileList={
            props?.imageUrl && [
              {
                uid: '1',
                name: 'Event image',
                status: 'done',
                url: props.imageUrl,
              },
            ]
          }
          listType="picture"
          beforeUpload={beforeUpload}
          showUploadList={{
            showPreviewIcon: !props?.imageReadOnly ? true : false,
            previewIcon: <EditOutlined style={{ color: '#1B3DE6' }} onClick={() => setImageCropOpen(true)} />,
            showDownloadIcon: props?.imageReadOnly ? true : false,
            downloadIcon: <DownloadOutlined style={{ color: '#1B3DE6' }} />,
            showRemoveIcon: imageUrl ? true : false,
            removeIcon: <DeleteOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }} />,
          }}
          onChange={handleChange}>
          {imageUrl && props?.preview ? (
            <img
              src={imageUrl}
              alt="avatar"
              style={{
                width: '423px',
                objectFit: 'cover',
              }}
            />
          ) : (
            uploadButton
          )}
        </Upload.Dragger>
      </Form.Item>
      <ImageCrop
        setOpen={setImageCropOpen}
        open={imageCropOpen}
        image={imageUrl}
        form={form}
        cropValues={cropValues}
        setCropValues={setCropValues}
        setImage={setImageUrl}
      />
    </>
  );
}

export default ImageUpload;
