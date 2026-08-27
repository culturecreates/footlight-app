import React, { useEffect, useState } from 'react';
import { Alert, Skeleton, Typography, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import CustomModal from '../Modal/Common/CustomModal';
import StyledSwitch from '../Switch/StyledSwitch';
import PrimaryButton from '../Button/Primary';
import OutlinedButton from '../Button/Outlined';
import { getEventStructuredData } from '../../services/structuredData';
import './structuredDataModal.css';

const StructuredDataModal = ({ visible, onCancel, eventId, eventName }) => {
  const { t } = useTranslation();

  const [wrapInScript, setWrapInScript] = useState(true);
  const [jsonLd, setJsonLd] = useState(null);
  const [isSeries, setIsSeries] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    if (!visible || !eventId) return;
    let active = true;
    setIsLoading(true);
    setError(null);
    getEventStructuredData({ eventId })
      .then((result) => {
        if (!active) return;
        setJsonLd(result.jsonLd);
        setIsSeries(result.isSeries);
        setIsLoading(false);
      })
      .catch((fetchError) => {
        if (!active) return;
        setError(fetchError?.code ?? 'generic');
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible, eventId, fetchCount]);

  const displayedText = wrapInScript ? `<script type="application/ld+json">\n${jsonLd}\n</script>` : jsonLd;

  const errorMessageKeys = {
    notFound: 'dashboard.events.structuredData.errorNotFound',
    network: 'dashboard.events.structuredData.errorNetwork',
    invalid: 'dashboard.events.structuredData.errorInvalid',
  };

  const actionsDisabled = isLoading || !!error || !jsonLd;

  const handleCopy = async () => {
    if (actionsDisabled) return;
    await navigator.clipboard.writeText(displayedText);
    notification.success({
      description: t('dashboard.events.structuredData.copied'),
      placement: 'top',
      closeIcon: <></>,
      maxCount: 1,
      duration: 3,
    });
  };

  const handleDownload = () => {
    if (actionsDisabled) return;
    const blob = new Blob([displayedText], { type: 'application/ld+json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-${eventId}.jsonld`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCancel = () => {
    setWrapInScript(true);
    setError(null);
    onCancel();
  };

  return (
    <CustomModal
      visible={visible}
      onCancel={handleCancel}
      centered
      width={700}
      className="structured-data-modal"
      title={
        <Typography.Title level={5} style={{ margin: 0, color: '#1f2635' }}>
          {t('dashboard.events.structuredData.title')}
        </Typography.Title>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
          <OutlinedButton
            data-cy="button-structured-data-download"
            label={t('dashboard.events.structuredData.download')}
            disabled={actionsDisabled}
            onClick={handleDownload}
          />
          <PrimaryButton
            data-cy="button-structured-data-copy"
            label={t('dashboard.events.structuredData.copy')}
            disabled={actionsDisabled}
            onClick={handleCopy}
          />
        </div>
      }>
      <div className="structured-data-modal-content">
        <p className="structured-data-help">{t('dashboard.events.structuredData.help')}</p>

        <div className="switch-wrapper-container">
          <StyledSwitch
            data-cy="switch-structured-data-wrap"
            checked={wrapInScript}
            onChange={(checked) => setWrapInScript(checked)}
            disabled={isLoading || !!error}
          />
          <span className="switch-label">{t('dashboard.events.structuredData.wrapScript')}</span>
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} title={false} data-cy="skeleton-structured-data" />
        ) : error ? (
          <Alert
            data-cy="alert-structured-data-error"
            type="error"
            showIcon
            message={t(errorMessageKeys[error] ?? 'dashboard.events.structuredData.error')}
            action={
              <OutlinedButton
                data-cy="button-structured-data-retry"
                size="small"
                label={t('dashboard.events.structuredData.retry')}
                onClick={() => setFetchCount((count) => count + 1)}
              />
            }
          />
        ) : (
          jsonLd && (
            <>
              {isSeries && (
                <Alert
                  data-cy="alert-structured-data-series"
                  className="structured-data-series-note"
                  type="warning"
                  showIcon
                  message={t('dashboard.events.structuredData.seriesNote')}
                />
              )}
              <pre className="structured-data-code" aria-label={eventName} data-cy="code-structured-data">
                {displayedText}
              </pre>
            </>
          )
        )}
      </div>
    </CustomModal>
  );
};

export default StructuredDataModal;
