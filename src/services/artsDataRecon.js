const baseUrl = import.meta.env.VITE_APP_ARTS_DATA_RECON_URI;
const normalizedBaseUrl = baseUrl?.replace(/\/+$/, '');

/**
 * Calls the Artsdata Match Service (reconcileByQuery) to find candidate entities that
 * could be the `sameAs` of a Footlight entity.
 *
 * See https://staging-recon.artsdata.ca/api/#/Match%20Service%20APIs/MatchController_reconcileByQueries
 *
 * @param {Object} params
 * @param {string} params.type - schema type of the entity (e.g. `schema:Organization`).
 * @param {Array}  params.conditions - array of QueryCondition objects.
 * @param {number} [params.limit=5] - maximum number of candidates to return.
 * @param {string} [params.language='en'] - value for the required `accept-language` header.
 * @returns {Promise<Array>} the list of candidates from `results[0].candidates`.
 */
export async function reconcileArtsDataByQuery({ type, conditions, limit = 5, language = 'en' }) {
  if (!normalizedBaseUrl) {
    throw new Error('Artsdata reconciliation base URL (VITE_APP_ARTS_DATA_RECON_URI) is not configured.');
  }

  const response = await fetch(`${normalizedBaseUrl}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept-language': language === 'fr' ? 'fr' : 'en',
    },
    body: JSON.stringify({
      queries: [
        {
          ...(type ? { type } : {}),
          limit,
          conditions,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Artsdata reconciliation failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.results?.[0]?.candidates ?? [];
}
