import React, { useState, useEffect } from 'react';
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

  const ASPECT_RATIO_TYPE = {
    large: {
      value: largeAspectRatio ? ratioChecker(largeAspectRatio) : 16 / 9,
      type: 'LARGE',
      initial:
        cropValues?.large?.height !== undefined &&
        cropValues?.large?.width !== undefined &&
        cropValues?.large?.x !== undefined &&
        cropValues?.large?.y !== undefined
          ? cropValues?.large
          : undefined,
    },
    thumbnail: {
      value: thumbnailAspectRatio ? ratioChecker(thumbnailAspectRatio) : 3 / 2,
      type: 'THUMBNAIL',
      initial:
        cropValues?.thumbnail?.height !== undefined &&
        cropValues?.thumbnail?.width !== undefined &&
        cropValues?.thumbnail?.x !== undefined &&
        cropValues?.thumbnail?.y !== undefined
          ? cropValues?.thumbnail
          : undefined,
    },
  };

  const [largeCrop, onLargeCropChange] = useState({ x: 0, y: 0 });
  const [thumbnailCrop, onThumbnailCropChange] = useState({ x: 0, y: 0 });

  const [largeZoom, onLargeZoomChange] = useState(1);
  const [thumbnailZoom, onThumbnailZoomChange] = useState(1);

  const [aspectRatioType, setAspectRatioType] = useState(ASPECT_RATIO_TYPE.large.type);
  const [initialLargeCroppedArea, setInitialLargeCroppedArea] = useState(undefined);
  const [initialThumbnailCroppedArea, setInitialThumbnailCroppedArea] = useState(undefined);

  const onCropAreaChange = (croppedArea, croppedAreaPixel) => {
    if (
      !isNaN(croppedAreaPixel?.x) &&
      !isNaN(croppedAreaPixel?.y) &&
      !isNaN(croppedAreaPixel?.height) &&
      !isNaN(croppedAreaPixel?.width)
    ) {
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
    }
  };

  const aspectRatioControl = (type) => {
    switch (type) {
      case ASPECT_RATIO_TYPE.large.type:
        setAspectRatioType(ASPECT_RATIO_TYPE.large.type);
        break;
      case ASPECT_RATIO_TYPE.thumbnail.type:
        setAspectRatioType(ASPECT_RATIO_TYPE.thumbnail.type);
        break;
      default:
        break;
    }
  };

  const saveCropHandler = () => {
    form.setFieldsValue({
      imageCrop: cropValues,
    });
    showCroppedImage();
    setInitialLargeCroppedArea(cropValues?.large);
    setInitialThumbnailCroppedArea(cropValues?.thumbnail);
  };

  const onCancel = () => {
    setOpen(false);
    let imageCrop = form.getFieldValue('imageCrop');
    if (imageCrop) {
      if (
        imageCrop?.large?.x !== undefined &&
        imageCrop?.large?.y !== undefined &&
        imageCrop?.large?.height !== undefined &&
        imageCrop?.large?.width !== undefined
      )
        setInitialLargeCroppedArea(imageCrop?.large);
      else setInitialLargeCroppedArea(undefined);
      if (
        imageCrop?.thumbnail?.x !== undefined &&
        imageCrop?.thumbnail?.y !== undefined &&
        imageCrop?.thumbnail?.height !== undefined &&
        imageCrop?.thumbnail?.width !== undefined
      )
        setInitialThumbnailCroppedArea(imageCrop?.thumbnail);
      else setInitialThumbnailCroppedArea(undefined);
      setCropValues(imageCrop);
    }
    setAspectRatioType(ASPECT_RATIO_TYPE.large.type);
    onLargeCropChange({ x: 0, y: 0 });
    onThumbnailCropChange({ x: 0, y: 0 });
  };

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(image, cropValues?.large, null);
      setImage(croppedImage);
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setInitialLargeCroppedArea(ASPECT_RATIO_TYPE.large.initial ?? undefined);
    setInitialThumbnailCroppedArea(ASPECT_RATIO_TYPE.thumbnail.initial ?? undefined);
  }, []);

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
          onClick={() => onCancel()}
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
              value={aspectRatioType}
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
            {aspectRatioType === ASPECT_RATIO_TYPE.large.type && (
              <div className="controls">
                <Button
                  type="text"
                  icon={<MinusOutlined color=" #646d7b" />}
                  onClick={() => onLargeZoomChange(largeZoom - 0.1)}
                />
                <input
                  type="range"
                  value={!isNaN(largeZoom) && largeZoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => onLargeZoomChange(e.target.value)}
                  className="zoom-range"
                />
                <Button
                  type="text"
                  icon={<PlusOutlined style={{ color: '#646d7b' }} />}
                  onClick={() => onLargeZoomChange(largeZoom + 0.1)}
                />
              </div>
            )}
            {aspectRatioType === ASPECT_RATIO_TYPE.thumbnail.type && (
              <div className="controls">
                <Button
                  type="text"
                  icon={<MinusOutlined color=" #646d7b" />}
                  onClick={() => onThumbnailZoomChange(thumbnailZoom - 0.1)}
                />
                <input
                  type="range"
                  value={!isNaN(thumbnailZoom) && thumbnailZoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => onThumbnailZoomChange(e.target.value)}
                  className="zoom-range"
                />
                <Button
                  type="text"
                  icon={<PlusOutlined style={{ color: '#646d7b' }} />}
                  onClick={() => onThumbnailZoomChange(thumbnailZoom + 0.1)}
                />
              </div>
            )}
          </Col>
          <Col span={24}>
            <div className="crop-container">
              {aspectRatioType === ASPECT_RATIO_TYPE.large.type && (
                <Cropper
                  classes={{
                    containerClassName: 'crop-area-container',
                  }}
                  showGrid={false}
                  image={image}
                  crop={largeCrop}
                  zoom={largeZoom}
                  aspect={ASPECT_RATIO_TYPE.large.value}
                  onCropChange={onLargeCropChange}
                  onZoomChange={onLargeZoomChange}
                  onCropComplete={onCropAreaChange}
                  initialCroppedAreaPixels={initialLargeCroppedArea}
                />
              )}
              {aspectRatioType === ASPECT_RATIO_TYPE.thumbnail.type && (
                <Cropper
                  classes={{
                    containerClassName: 'crop-area-container',
                  }}
                  showGrid={false}
                  image={image}
                  crop={thumbnailCrop}
                  zoom={thumbnailZoom}
                  aspect={ASPECT_RATIO_TYPE.thumbnail.value}
                  onCropChange={onThumbnailCropChange}
                  onZoomChange={onThumbnailZoomChange}
                  onCropComplete={onCropAreaChange}
                  initialCroppedAreaPixels={initialThumbnailCroppedArea}
                />
              )}
            </div>
          </Col>
        </Row>
      </div>
    </CustomModal>
  );
}

export default ImageCrop;
