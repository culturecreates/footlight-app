import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CustomModal from '../Modal/Common/CustomModal';
import PrimaryButton from '../Button/Primary/Primary';
import TextButton from '../Button/Text/Text';
import getCroppedImg from '../../utils/getCroppedImg';

function ProfileImageCrop({ image, open, setOpen, onSave }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (_, pixelCrop) => {
    setCroppedAreaPixels(pixelCrop);
  };

  const handleSave = async () => {
    try {
      const blobUrl = await getCroppedImg(image, croppedAreaPixels, null);
      onSave(blobUrl);
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <CustomModal
      width={500}
      centered
      open={open}
      bodyStyle={{ height: '600px' }}
      onCancel={handleCancel}
      title={
        <span className="quick-select-modal-title" data-cy="span-profile-image-crop-heading">
          {t('dashboard.events.addEditEvent.otherInformation.image.crop.title')}
        </span>
      }
      footer={[
        <TextButton
          key="cancel"
          size="large"
          label={t('dashboard.events.addEditEvent.otherInformation.image.crop.cancel')}
          onClick={handleCancel}
          data-cy="button-profile-image-crop-cancel"
        />,
        <PrimaryButton
          key="save"
          label={t('dashboard.events.addEditEvent.otherInformation.image.crop.save')}
          onClick={handleSave}
          data-cy="button-profile-image-crop-save"
        />,
      ]}>
      <div className="image-crop-wrapper">
        <div className="crop-area-container" style={{ position: 'relative', height: 350, background: '#333' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="controls" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            icon={<MinusOutlined />}
            onClick={() => setZoom((z) => Math.max(1, parseFloat((z - 0.1).toFixed(1))))}
            data-cy="button-profile-image-zoom-out"
          />
          <input
            type="range"
            className="zoom-range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ flex: 1 }}
            data-cy="input-profile-image-zoom"
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => setZoom((z) => Math.min(3, parseFloat((z + 0.1).toFixed(1))))}
            data-cy="button-profile-image-zoom-in"
          />
        </div>
      </div>
    </CustomModal>
  );
}

export default ProfileImageCrop;
