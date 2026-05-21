import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Dropdown, Space, Upload } from 'antd';
import { DownloadOutlined, MoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './profileImageUpload.css';
import { beforeUpload } from '../../utils/beforeImageUpload';
import { IMAGE_ACTIONS } from '../../constants/imageUploadOptions';
import Outlined from '../Button/Outlined';
import LoadingIndicator from '../LoadingIndicator';
import ProfileImageCrop from './ProfileImageCrop';

const ProfileImageUpload = forwardRef(function ProfileImageUpload(
  { imageUrl, readOnly, onImageChange, onOriginalChange },
  ref,
) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [originalBase64, setOriginalBase64] = useState(null);
  const [croppedBlobUrl, setCroppedBlobUrl] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const hiddenFileInputRef = useRef(null);

  const displayUrl = isDeleted ? null : croppedBlobUrl || imageUrl || null;

  const notifyImageChange = (state) => {
    if (typeof onImageChange === 'function') onImageChange(state);
  };

  const notifyOriginalChange = (hasOriginal) => {
    if (typeof onOriginalChange === 'function') onOriginalChange(hasOriginal);
  };

  const handleFileSelect = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setLoading(false);
      setOriginalBase64(e.target.result);
      notifyOriginalChange(true);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleBeforeUpload = async (file) => {
    const processed = await beforeUpload(file, [], setLoading);
    if (processed === Upload.LIST_IGNORE) return Upload.LIST_IGNORE;
    handleFileSelect(processed || file);
    return false;
  };

  const handleHiddenInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const processed = await beforeUpload(file, [], setLoading);
    if (processed !== Upload.LIST_IGNORE) {
      handleFileSelect(processed || file);
    }
    e.target.value = '';
  };

  const handleCropSave = (blobUrl) => {
    setCroppedBlobUrl(blobUrl);
    setIsDeleted(false);
    notifyImageChange({ croppedBlobUrl: blobUrl, isDeleted: false });
  };

  const handleDelete = () => {
    setCroppedBlobUrl(null);
    setOriginalBase64(null);
    setIsDeleted(true);
    notifyOriginalChange(false);
    notifyImageChange({ croppedBlobUrl: null, isDeleted: true });
  };

  const handleDownload = async () => {
    if (!displayUrl) return;
    try {
      const response = await fetch(displayUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'profile-image.jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (e) {
      console.error('Profile image download failed:', e);
    }
  };

  useImperativeHandle(ref, () => ({
    triggerUpload: () => hiddenFileInputRef.current?.click(),
    triggerReCrop: () => {
      if (originalBase64) setCropOpen(true);
    },
    triggerDelete: handleDelete,
  }));

  const dropdownItems = [
    ...(originalBase64
      ? [
          {
            key: IMAGE_ACTIONS.CROP,
            label: t('dashboard.events.addEditEvent.otherInformation.image.options.cropImage'),
          },
        ]
      : []),
    {
      key: IMAGE_ACTIONS.DOWNLOAD,
      label: t('dashboard.events.addEditEvent.otherInformation.image.options.downloadOriginalImage'),
    },
    {
      key: IMAGE_ACTIONS.DELETE,
      label: t('dashboard.events.addEditEvent.otherInformation.image.options.deleteImage'),
    },
  ];

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case IMAGE_ACTIONS.CROP:
        if (originalBase64) setCropOpen(true);
        break;
      case IMAGE_ACTIONS.DOWNLOAD:
        handleDownload();
        break;
      case IMAGE_ACTIONS.DELETE:
        handleDelete();
        break;
      default:
        break;
    }
  };

  const uploadButton = (
    <div style={{ padding: 8 }}>
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
  );

  if (readOnly) {
    if (!displayUrl) return null;
    return (
      <div className="profile-image-upload">
        <img src={displayUrl} alt="profile" style={{ maxWidth: '423px', width: '100%' }} />
        <div className="image-footer" data-cy="profile-image-footer-readonly">
          <span className="image-contents">
            <img
              className="image-thumbnail"
              src={displayUrl}
              style={{ width: 48, height: 48, objectFit: 'cover' }}
              alt="profile thumbnail"
            />
            <span className="image-name-wrapper">
              <span className="image-name" data-cy="span-profile-image-name-readonly">
                profile-image.jpg
              </span>
            </span>
          </span>
          <span className="image-actions">
            <DownloadOutlined
              className="image-options-more-icon"
              style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px', padding: 4, cursor: 'pointer' }}
              onClick={handleDownload}
              data-cy="icon-profile-image-download-readonly"
            />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-image-upload">
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handleHiddenInputChange}
      />

      <Upload.Dragger
        accept='.png, .jpg, .jpeg"'
        className="upload-wrapper"
        multiple={false}
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        data-cy="profile-image-upload-dragger">
        {loading ? (
          <LoadingIndicator />
        ) : displayUrl ? (
          <img src={displayUrl} alt="profile" style={{ maxWidth: '423px', width: '100%' }} />
        ) : (
          uploadButton
        )}
      </Upload.Dragger>

      {displayUrl && (
        <div className="image-footer" data-cy="profile-image-footer">
          <span className="image-contents">
            <img
              className="image-thumbnail"
              src={displayUrl}
              style={{ width: 48, height: 48, objectFit: 'cover' }}
              alt="profile thumbnail"
            />
            <span className="image-name-wrapper">
              <span className="image-name" data-cy="span-profile-image-name">
                profile-image.jpg
              </span>
            </span>
          </span>
          <span className="image-actions">
            <Dropdown
              overlayStyle={{ width: '200px' }}
              menu={{ items: dropdownItems, onClick: handleMenuClick }}
              trigger={['click']}>
              <Space>
                <MoreOutlined
                  className="image-options-more-icon"
                  style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px', padding: 4 }}
                  data-cy="span-profile-image-options-icon"
                />
              </Space>
            </Dropdown>
          </span>
        </div>
      )}

      {originalBase64 && cropOpen && (
        <ProfileImageCrop image={originalBase64} open={cropOpen} setOpen={setCropOpen} onSave={handleCropSave} />
      )}
    </div>
  );
});

export default ProfileImageUpload;
