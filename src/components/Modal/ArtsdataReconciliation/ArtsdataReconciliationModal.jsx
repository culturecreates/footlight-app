import React, { useEffect, useState } from 'react';
import { Modal, Skeleton } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import Link from 'antd/lib/typography/Link';
import { useTranslation } from 'react-i18next';
import './artsdataReconciliationModal.css';
import PrimaryButton from '../../Button/Primary';
import Outlined from '../../Button/Outlined';
import NoContent from '../../NoContent/NoContent';
import { reconcileArtsDataByQuery } from '../../../services/artsDataRecon';
import { buildReconciliationQuery } from '../../../utils/buildReconciliationQuery';
import { createArtsDataLink, normalizeArtsdataUri } from '../../../utils/artsDataLinkChecker';

/**
 * Normalizes a candidate from the match service into a canonical absolute Artsdata uri.
 * The candidate may be a raw uri string or an object carrying `id`/`uri`. The match service
 * returns bare resource ids (e.g. `K10-15`), so expand them to full IRIs; otherwise linking and
 * the subsequent `/query` load fail with "Not a valid (absolute) IRI".
 */
const getCandidateUri = (candidate) => {
  if (!candidate) return undefined;
  const raw = typeof candidate === 'string' ? candidate : candidate?.id ?? candidate?.uri;
  return normalizeArtsdataUri(raw);
};

function ArtsdataReconciliationModal({
  open,
  onCancel,
  onLink,
  entityClass,
  entityData,
  calendarContentLanguage,
  interfaceLanguage,
  isLinking = false,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [linkingUri, setLinkingUri] = useState(null);

  useEffect(() => {
    if (!open) return;

    let isActive = true;

    const fetchCandidates = async () => {
      setLoading(true);
      setError(false);
      setCandidates([]);

      try {
        const queryConfig = buildReconciliationQuery({
          entityClass,
          entityData,
          calendarContentLanguage,
          interfaceLanguage,
        });

        if (!queryConfig) {
          if (isActive) setCandidates([]);
          return;
        }

        const rawCandidates = await reconcileArtsDataByQuery({
          type: queryConfig.type,
          conditions: queryConfig.conditions,
          limit: 10,
          language: interfaceLanguage,
        });

        // The match service already returns name + description + id (localized via accept-language),
        // so map them straight through. `id` is a bare resource id, expanded to a full IRI.
        const mapped = rawCandidates
          .map((candidate) => {
            const uri = getCandidateUri(candidate);
            if (!uri) return null;

            const name = (typeof candidate === 'object' ? candidate?.name : undefined) || uri;
            const disambiguatingDescription =
              typeof candidate === 'object'
                ? candidate?.description ?? candidate?.disambiguatingDescription
                : undefined;

            return { uri, name, disambiguatingDescription };
          })
          .filter(Boolean);

        if (isActive) setCandidates(mapped);
      } catch (e) {
        if (isActive) setError(true);
        console.error(e);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchCandidates();

    return () => {
      isActive = false;
    };
  }, [open]);

  const handleLink = async (uri) => {
    setLinkingUri(uri);
    try {
      await onLink(uri);
    } catch (e) {
      // Error feedback is handled by the parent; keep the modal open to allow retry.
      setLinkingUri(null);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      destroyOnClose
      className="artsdata-reconciliation-modal"
      title={<span className="artsdata-reconciliation-modal-title">{t('dashboard.reconciliation.modalTitle')}</span>}
      footer={
        <div className="artsdata-reconciliation-modal-footer">
          <Outlined
            size="large"
            label={t('dashboard.reconciliation.cancel')}
            onClick={onCancel}
            data-cy="button-cancel-reconciliation"
          />
        </div>
      }>
      <div className="artsdata-reconciliation-modal-body">
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : error ? (
          <div className="artsdata-reconciliation-error" data-cy="div-reconciliation-error">
            {t('dashboard.reconciliation.matchError')}
          </div>
        ) : candidates.length === 0 ? (
          <NoContent label={t('dashboard.reconciliation.noCandidates')} />
        ) : (
          <div className="artsdata-reconciliation-candidate-list">
            {candidates.map((candidate) => {
              const artsDataLink = createArtsDataLink(candidate.uri);
              return (
                <div
                  className="artsdata-reconciliation-candidate"
                  key={candidate.uri}
                  data-cy="div-reconciliation-candidate">
                  <div className="artsdata-reconciliation-candidate-info">
                    <div className="artsdata-reconciliation-candidate-name" data-cy="div-candidate-name">
                      {candidate.name}
                    </div>
                    {candidate.disambiguatingDescription && (
                      <div
                        className="artsdata-reconciliation-candidate-description"
                        data-cy="div-candidate-description">
                        {candidate.disambiguatingDescription}
                      </div>
                    )}
                    <Link
                      href={artsDataLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="artsdata-reconciliation-candidate-id"
                      data-cy="link-candidate-id">
                      <span>{candidate.uri}</span>
                      <LinkOutlined />
                    </Link>
                  </div>
                  <div className="artsdata-reconciliation-candidate-action">
                    <PrimaryButton
                      label={t('dashboard.reconciliation.link')}
                      disabled={isLinking}
                      loading={isLinking && linkingUri === candidate.uri}
                      onClick={() => handleLink(candidate.uri)}
                      data-cy="button-link-candidate"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ArtsdataReconciliationModal;
