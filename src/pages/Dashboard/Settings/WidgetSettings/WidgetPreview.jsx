import { Col, Grid } from 'antd';
import React from 'react';
import Outlined from '../../../../components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import CustomModal from '../../../../components/Modal/Common/CustomModal';
import './css/widgetPreview.css';
import LoadingIndicator from '../../../../components/LoadingIndicator';

const { useBreakpoint } = Grid;

const WidgetPreview = ({
  form,
  notify,
  previewModal,
  handleUpdate,
  isMaskVisible,
  mobileWidgetUrl,
  setPreviewModal,
  showMobileIframe,
  fullscreenWidgetUrl,
  isLoading,
}) => {
  const screens = useBreakpoint();
  const { t } = useTranslation();

  const localePath = 'dashboard.settings.widgetSettings';

  const handleMobileIframeClick = () => {
    handleUpdate();
  };

  return (
    <Col flex={'448px'} style={{ display: `${!screens.xl ? 'none' : 'block'}` }}>
      <div className="preview-section-wrapper">
        <div className="preview-section-wrapper-header">
          <span>{t(`${localePath}.previewMobile`)}</span>
          <Outlined
            size="large"
            label={t(`${localePath}.previewDesktop`)}
            data-cy="button-preview"
            onClick={() => {
              form
                .validateFields(['width', 'height', 'limit', 'color'])
                .then(() => {
                  handleUpdate();
                  setPreviewModal(true);
                })
                .catch((error) => {
                  error?.errorFields?.map((e, index) => {
                    notify({
                      index,
                      messageText: e.errors[0] != ' ' ? e.errors[0] : t(`${localePath}.validation.color`),
                    });
                  });
                });
            }}
          />
        </div>
        <CustomModal
          open={previewModal}
          centered
          className="widget-settings-page-iframe-modal"
          width={form.getFieldValue('width') ? `${form.getFieldValue('width')}px` : '1000px'}
          height={form.getFieldValue('height') ? `${parseInt(form.getFieldValue('height')) + 100}px` : '700px'}
          title={
            <span className="quick-create-organization-modal-title" data-cy="widget-settings-page-modal-title">
              {!screens.lg ? t(`${localePath}.previewMobileBtn`) : t(`${localePath}.previewDesktop`)}
            </span>
          }
          footer={null}
          onCancel={() => setPreviewModal(false)}>
          {!isLoading ? (
            <iframe
              width="100%"
              height={form.getFieldValue('height') ? `${form.getFieldValue('height')}px` : '1000px'}
              style={{
                border: 'none',
                maxWidth: form.getFieldValue('width') ? `${form.getFieldValue('width')}px` : '100%',
              }}
              src={fullscreenWidgetUrl?.href}></iframe>
          ) : (
            <div className="loading-indicator-wrapper">
              <LoadingIndicator />
            </div>
          )}
        </CustomModal>
        <div className="mobile-iframe-container">
          {!isLoading ? (
            <>
              <iframe
                src={mobileWidgetUrl?.href}
                className={`mobile-widget-iframe ${showMobileIframe ? 'visible' : ''}`}
              />
              {!showMobileIframe && (
                <div
                  className={`iframe-mask ${isMaskVisible ? 'visible' : 'hidden'}`}
                  onClick={handleMobileIframeClick}>
                  <div className="mask-content">{t(`${localePath}.clickToViewChanges`)}</div>
                </div>
              )}
            </>
          ) : (
            <div className="loading-indicator-wrapper">
              <LoadingIndicator />
            </div>
          )}
        </div>
      </div>
    </Col>
  );
};

export default WidgetPreview;
