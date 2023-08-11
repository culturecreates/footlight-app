import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './imageCrop.css';
import { Row, Col, Space, Radio } from 'antd';
import Cropper from 'react-easy-crop';
import CustomModal from '../Modal/Common/CustomModal';
import PrimaryButton from '../Button/Primary/Primary';
import TextButton from '../Button/Text/Text';
import getCroppedImg from '../../utils/getCroppedImg';

function ImageCrop(props) {
  const { image, open, setOpen, largeAspectRatio, thumbnailAspectRatio, form, cropValues, setCropValues, setImage } =
    props;
  const { t } = useTranslation();

  let ASPECT_RATIO_TYPE = {
    large: {
      value: largeAspectRatio ? largeAspectRatio : 16 / 9,
      type: 'LARGE',
    },
    thumbnail: {
      value: thumbnailAspectRatio ? thumbnailAspectRatio : 3 / 2,
      type: 'THUMBNAIL',
    },
  };

  const [crop, onCropChange] = useState({ x: 0, y: 0 });
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
      open={open}
      bodyStyle={{
        height: '600px',
      }}
      onCancel={() => setOpen(false)}
      title={<span className="quick-select-modal-title">{t('dashboard.events.addEditEvent.quickCreate.title')}</span>}
      footer={[
        <TextButton
          key="cancel"
          size="large"
          label={t('dashboard.events.addEditEvent.quickCreate.cancel')}
          onClick={() => setOpen(false)}
        />,
        <PrimaryButton
          key="add-dates"
          label={t('dashboard.events.addEditEvent.quickCreate.create')}
          onClick={() => saveCropHandler()}
        />,
      ]}>
      <div className="image-crop-wrapper">
        <Row gutter={[0, 10]}>
          <Col span={24}>
            <span className="quick-select-modal-sub-heading">
              {t('dashboard.events.addEditEvent.quickCreate.subHeading')}
            </span>
          </Col>
          <Col span={24}>
            <span className="quick-select-modal-sub-heading">
              {t('dashboard.events.addEditEvent.quickCreate.subHeading')}
            </span>
          </Col>
          <Col span={24}>
            <Radio.Group
              defaultValue={ASPECT_RATIO_TYPE.large.type}
              onChange={(event) => aspectRatioControl(event.target.value)}>
              <Space direction="vertical">
                <Radio value={ASPECT_RATIO_TYPE.large.type}>16:9 Ratio</Radio>
                <Radio value={ASPECT_RATIO_TYPE.thumbnail.type}>1:1 Ratio</Radio>
              </Space>
            </Radio.Group>
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
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropAreaChange={onCropAreaChange}
              />
            </div>
          </Col>
          <Col span={24}>
            <div className="controls">
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
            </div>
          </Col>
        </Row>
      </div>
    </CustomModal>
  );
}

export default ImageCrop;