import React, { useState } from 'react';
import './imageUpload.css';
import { message, Upload, Form, Dropdown, Space } from 'antd';
import { LoadingOutlined, DownloadOutlined, DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import Outlined from '../Button/Outlined';
import { useTranslation } from 'react-i18next';
import { ImageCrop } from '../ImageCrop';
import { useOutletContext } from 'react-router-dom';
import { getWidthFromAspectRatio } from '../../utils/getWidthFromAspectRatio';
import { IMAGE_ACTIONS, mainImageUploadOptions } from '../../constants/imageUploadOptions';
import ImageCredits from '../Modal/ImageCredit';
import Credit from '../Tags/Credit';
import { contentLanguageKeyMap } from '../../constants/contentLanguage';

function ImageUpload(props) {
  const {
    setImageCropOpen,
    imageCropOpen,
    form,
    eventImageData,
    largeAspectRatio,
    thumbnailAspectRatio,
    isCrop,
    preview,
    originalImageUrl,
    formName,
    isCalendarLogo,
    thumbnailImage,
  } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(props?.imageUrl ?? null);
  const [originalImage, setOriginalImage] = useState(originalImageUrl ?? null);
  const [imageOptionsModalOpen, setImageOptionsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [imageOptions, setImageOptions] = useState({
    credit:
      eventImageData?.creditText ??
      Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
        acc[contentLanguageKeyMap[lang]] = '';
        return acc;
      }, {}),
    altText:
      eventImageData?.description ??
      Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
        acc[contentLanguageKeyMap[lang]] = '';
        return acc;
      }, {}),
    caption:
      eventImageData?.caption ??
      Object.keys(contentLanguageKeyMap).reduce((acc, lang) => {
        acc[contentLanguageKeyMap[lang]] = '';
        return acc;
      }, {}),
  });
  const [currentCalendarData] = useOutletContext();

  const [cropValues, setCropValues] = useState({
    large: {
      x: eventImageData?.large?.xCoordinate ?? undefined,
      y: eventImageData?.large?.yCoordinate ?? undefined,
      height: eventImageData?.large?.height ?? undefined,
      width: eventImageData?.large?.width ?? undefined,
    },
    original: {
      entityId: eventImageData?.original?.entityId ?? null,
      height: eventImageData?.original?.height ?? undefined,
      width: eventImageData?.original?.width ?? undefined,
    },
    thumbnail: {
      x: eventImageData?.thumbnail?.xCoordinate ?? undefined,
      y: eventImageData?.thumbnail?.yCoordinate ?? undefined,
      height: eventImageData?.thumbnail?.height ?? undefined,
      width: eventImageData?.thumbnail?.width ?? undefined,
    },
  });

  let aspectRatio;
  let width;
  if (!isCalendarLogo && currentCalendarData?.imageConfig[0]?.thumbnail?.aspectRatio) {
    aspectRatio = currentCalendarData.imageConfig[0]?.large.aspectRatio;
    width = getWidthFromAspectRatio(aspectRatio, 48);
  }

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
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
      setCropValues({
        large: undefined,
        thumbnail: undefined,
        original: undefined,
      });
      setImageOptions({
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
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
        setOriginalImage(url);
        if (isCrop) setImageCropOpen(true);
      });
    }
  };

  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  const onRemove = () => {
    form.setFieldsValue({
      imageCrop: null,
    });
    form.setFieldsValue({
      mainImageOptions: null,
    });
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

        <span className="upload-helper-text">
          {t('dashboard.events.addEditEvent.otherInformation.image.dragAndDrop')}
        </span>
      </span>
    </div>
  );
  return (
    <>
      <Form.Item name={formName ?? 'dragger'} valuePropName="fileList" getValueFromEvent={normFile}>
        <Upload.Dragger
          data-cy="antd-image-upload"
          accept='.png, .jpg, .jpeg"'
          className="upload-wrapper"
          multiple={false}
          customRequest={customRequest}
          disabled={props?.imageReadOnly}
          maxCount={1}
          onRemove={onRemove}
          itemRender={(reactNode, file, fileList, actions) => {
            if (imageUrl || (file?.url ?? file?.thumbUrl))
              return (
                <span className="image-footer">
                  <span className="image-contents">
                    <img
                      className="image-thumbnail"
                      style={{
                        width: width ? `${width}px` : 'auto',
                        minWidth: width ? `${width}px` : 'none',
                      }}
                      src={imageUrl || (file?.url ?? file?.thumbUrl)}
                    />
                    <span className="image-name-wrapper" data-cy="span-image-name-wrapper">
                      <a
                        className="image-name"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={file?.url ?? imageUrl}
                        data-cy="anchor-image-link">
                        {file?.name}
                      </a>
                      <span className="image-credits" data-cy="span-image-credits">
                        {imageOptions &&
                          Object.entries(imageOptions).map(([key, value]) => {
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
                    {props?.imageReadOnly && (
                      <span onClick={actions?.download} data-cy="span-download-image">
                        <DownloadOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }} />
                      </span>
                    )}
                    {!props?.imageReadOnly && imageUrl && !isCrop && (
                      <span onClick={actions?.remove} data-cy="span-remove-image">
                        <DeleteOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }} />
                      </span>
                    )}
                    {!props?.imageReadOnly && (props?.imageUrl || imageUrl) && isCrop && (
                      <Dropdown
                        overlayStyle={{ width: '200px' }}
                        menu={{
                          items: mainImageUploadOptions({
                            credits: imageOptions.credit,
                            altText: imageOptions.altText,
                            caption: imageOptions.caption,
                          }),
                          onClick: ({ key }) => {
                            if ([IMAGE_ACTIONS.CREDIT, IMAGE_ACTIONS.ALT_TEXT, IMAGE_ACTIONS.CAPTION].includes(key)) {
                              setImageOptionsModalOpen(true);
                              form.setFieldsValue({
                                credit: imageOptions?.credit,
                                altText: imageOptions?.altText,
                                caption: imageOptions?.caption,
                              });
                              setSelectedField(key);
                            } else {
                              switch (key) {
                                case IMAGE_ACTIONS.CROP:
                                  actions.preview();
                                  break;
                                case IMAGE_ACTIONS.DELETE:
                                  actions.remove();
                                  break;
                                default:
                                  break;
                              }
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
              );
          }}
          defaultFileList={
            props?.imageUrl && [
              {
                uid: eventImageData?.original?.entityId,
                name: eventImageData?.original?.entityId,
                status: 'done',
                url: props.imageUrl,
                ...(thumbnailImage && { thumbUrl: thumbnailImage }),
              },
            ]
          }
          listType="picture"
          beforeUpload={beforeUpload}
          onPreview={() => setImageCropOpen(true)}
          showUploadList={{
            showPreviewIcon: !props?.imageReadOnly ? true : false,
            previewIcon: <EditOutlined style={{ color: '#1B3DE6' }} />,
            showDownloadIcon: props?.imageReadOnly ? true : false,
            downloadIcon: <DownloadOutlined style={{ color: '#1B3DE6' }} />,
            showRemoveIcon: imageUrl ? true : false,
            removeIcon: <DeleteOutlined style={{ color: '#1B3DE6', fontWeight: '600', fontSize: '16px' }} />,
          }}
          onChange={handleChange}>
          {imageUrl && preview ? (
            <img
              src={imageUrl}
              alt="avatar"
              style={{
                maxWidth: '423px',
                width: '100%',
              }}
            />
          ) : (
            uploadButton
          )}
        </Upload.Dragger>
      </Form.Item>

      {isCrop && imageCropOpen && (
        <ImageCrop
          setOpen={setImageCropOpen}
          open={imageCropOpen}
          image={originalImage}
          form={form}
          cropValues={cropValues}
          setCropValues={setCropValues}
          setImage={setImageUrl}
          largeAspectRatio={largeAspectRatio}
          thumbnailAspectRatio={thumbnailAspectRatio}
        />
      )}
      {currentCalendarData?.contentLanguage && (
        <ImageCredits
          open={imageOptionsModalOpen}
          selectedField={selectedField}
          setOpen={setImageOptionsModalOpen}
          form={form}
          isImageGallery={false}
          setImageOptions={setImageOptions}
          imageOptions={imageOptions}
          calendarContentLanguage={currentCalendarData?.contentLanguage}
        />
      )}
    </>
  );
}

export default ImageUpload;
