import React, { useState } from 'react';
import './imageUpload.css';
import { message, Upload, Form } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

function ImageUpload() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();

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
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}>
        Upload
      </div>
    </div>
  );
  return (
    <Form.Item name="dragger" valuePropName="fileList" getValueFromEvent={normFile}>
      <Upload.Dragger
        name="eventImage"
        accept='.png, .jpg, .jpeg"'
        multiple={false}
        customRequest={customRequest}
        showUploadList={true}
        maxCount={1}
        listType="picture"
        beforeUpload={beforeUpload}
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
