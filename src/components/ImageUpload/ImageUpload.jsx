import React, { useState } from 'react';
import './imageUpload.css';
import { message, Upload, Form } from 'antd';
import { LoadingOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import Outlined from '../Button/Outlined';
import { useTranslation } from 'react-i18next';

function ImageUpload(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(props?.imageUrl ?? null);

  const normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };
  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      console.log(info);
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
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
        <Outlined label={t('dashboard.events.addEditEvent.otherInformation.image.browse')} />
        <span style={{ color: '#646D7B', fontWeight: '400', fontSize: '16px' }}>
          {t('dashboard.events.addEditEvent.otherInformation.image.dragAndDrop')}
        </span>
      </span>
    </div>
  );

  return (
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
              name: 'image',
              status: 'done',
              url: props.imageUrl,
            },
          ]
        }
        listType="picture"
        beforeUpload={beforeUpload}
        showUploadList={{
          showDownloadIcon: props?.imageReadOnly ? true : false,
          downloadIcon: <DownloadOutlined style={{ color: '#1B3DE6' }} />,
          showRemoveIcon: imageUrl ? true : false,
          removeIcon: <DeleteOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }} />,
        }}
        onChange={handleChange}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="avatar"
            style={{
              width: '423px',
              height: '173px',
            }}
          />
        ) : (
          uploadButton
        )}
      </Upload.Dragger>
    </Form.Item>
  );
}

export default ImageUpload;
