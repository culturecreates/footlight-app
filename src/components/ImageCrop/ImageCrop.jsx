import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './imageCrop.css';
import { Row, Col, Space, Radio, Button } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import Cropper from 'react-easy-crop';
import CustomModal from '../Modal/Common/CustomModal';
import PrimaryButton from '../Button/Primary/Primary';
import TextButton from '../Button/Text/Text';
import getCroppedImg from '../../utils/getCroppedImg';
import { ratioChecker } from '../../utils/ratioChecker';

function ImageCrop(props) {
  const { image, open, setOpen, largeAspectRatio, thumbnailAspectRatio, form, cropValues, setCropValues, setImage } =
    props;
  const { t } = useTranslation();

  let ASPECT_RATIO_TYPE = {
    large: {
      value: largeAspectRatio ? ratioChecker(largeAspectRatio) : 16 / 9,
      type: 'LARGE',
    },
    thumbnail: {
      value: thumbnailAspectRatio ? ratioChecker(thumbnailAspectRatio) : 3 / 2,
      type: 'THUMBNAIL',
    },
  };
  const [crop, onCropChange] = useState(cropValues?.large);
  const [zoom, onZoomChange] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIO_TYPE.large.value);
  const [aspectRatioType, setAspectRatioType] = useState(ASPECT_RATIO_TYPE.large.type);

  const onCropAreaChange = (croppedArea, croppedAreaPixel) => {
    switch (aspectRatioType) {
      case ASPECT_RATIO_TYPE.large.type:
        setCropValues({
          ...cropValues,
          large: {
            x: croppedAreaPixel?.x,
            y: croppedAreaPixel?.y,
            height: croppedAreaPixel?.height,
            width: croppedAreaPixel?.width,
          },
        });
        break;
      case ASPECT_RATIO_TYPE.thumbnail.type:
        setCropValues({
          ...cropValues,
          thumbnail: {
            x: croppedAreaPixel?.x,
            y: croppedAreaPixel?.y,
            height: croppedAreaPixel?.height,
            width: croppedAreaPixel?.width,
          },
        });
        break;
      default:
        break;
    }
  };

  const aspectRatioControl = (type) => {
    switch (type) {
      case ASPECT_RATIO_TYPE.large.type:
        setAspectRatioType(ASPECT_RATIO_TYPE.large.type);
        setAspectRatio(ASPECT_RATIO_TYPE.large.value);
        break;
      case ASPECT_RATIO_TYPE.thumbnail.type:
        setAspectRatioType(ASPECT_RATIO_TYPE.thumbnail.type);
        setAspectRatio(ASPECT_RATIO_TYPE.thumbnail.value);
        break;
      default:
        break;
    }
  };

  const saveCropHandler = () => {
    form.setFieldsValue({
      imageCrop: cropValues,
    });
    setOpen(false);
    showCroppedImage();
  };

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(image, cropValues?.large, null);
      setImage(croppedImage);
    } catch (e) {
      console.error(e);
    }
  }, [cropValues?.large]);

  return (
    <CustomModal
      width={500}
      centered
      open={open}
      bodyStyle={{
        height: '600px',
      }}
      onCancel={() => setOpen(false)}
      title={
        <span className="quick-select-modal-title">
          {t('dashboard.events.addEditEvent.otherInformation.image.crop.title')}
        </span>
      }
      footer={[
        <TextButton
          key="cancel"
          size="large"
          label={t('dashboard.events.addEditEvent.otherInformation.image.crop.cancel')}
          onClick={() => setOpen(false)}
        />,
        <PrimaryButton
          key="add-dates"
          label={t('dashboard.events.addEditEvent.otherInformation.image.crop.save')}
          onClick={() => saveCropHandler()}
        />,
      ]}>
      <div className="image-crop-wrapper">
        <Row gutter={[0, 18]}>
          <Col span={24}>
            <span className="quick-select-modal-sub-heading">
              {t('dashboard.events.addEditEvent.otherInformation.image.crop.subHeading')}
            </span>
          </Col>
          <Col span={24}>
            <span className="quick-select-modal-sub-heading" style={{ fontWeight: 700, color: '#222732' }}>
              {t('dashboard.events.addEditEvent.otherInformation.image.crop.savedFrameSize')}
            </span>
          </Col>
          <Col span={24}>
            <Radio.Group
              defaultValue={ASPECT_RATIO_TYPE.large.type}
              onChange={(event) => aspectRatioControl(event.target.value)}
              style={{ color: '#222732' }}>
              <Space direction="vertical">
                <Radio value={ASPECT_RATIO_TYPE.large.type}>
                  {largeAspectRatio} {t('dashboard.events.addEditEvent.otherInformation.image.crop.ratio')}
                </Radio>
                <Radio value={ASPECT_RATIO_TYPE.thumbnail.type}>
                  {thumbnailAspectRatio} {t('dashboard.events.addEditEvent.otherInformation.image.crop.ratio')}
                </Radio>
              </Space>
            </Radio.Group>
          </Col>
          <Col span={24}>
            <div className="controls">
              <Button type="text" icon={<MinusOutlined color=" #646d7b" />} onClick={() => onZoomChange(zoom - 0.1)} />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => {
                  onZoomChange(e.target.value);
                }}
                className="zoom-range"
              />
              <Button
                type="text"
                icon={<PlusOutlined style={{ color: '#646d7b' }} />}
                onClick={() => onZoomChange(zoom + 0.1)}
              />
            </div>
          </Col>
          <Col span={24}>
            <div className="crop-container">
              <Cropper
                classes={{
                  containerClassName: 'crop-area-container',
                }}
                showGrid={false}
                image={image}
                crop={crop}
                initialCroppedAreaPixels={cropValues?.large}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropAreaChange={onCropAreaChange}
              />
            </div>
          </Col>
        </Row>
      </div>
    </CustomModal>
  );
}

export default ImageCrop;
