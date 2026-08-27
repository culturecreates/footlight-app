// Draft events work because the Open API's event-detail route has no publishState guard —
// an accepted WB1 dependency (see WB1_Schema_Structured_Data_Generator_Design.md). If a guard
// is added in footlight-calendar-api (ticket: TODO link once filed), this breaks for drafts.

import { normalizeEventJsonLd } from '../utils/normalizeEventJsonLd';

const structuredDataError = (code, message) => Object.assign(new Error(message ?? code), { code });

export const getEventStructuredData = async ({ eventId } = {}) => {
  const baseUrl = import.meta.env.VITE_APP_OPEN_API_URL;

  let response;
  try {
    response = await fetch(`${baseUrl}/events/${eventId}?include-json-ld=true`, {
      headers: { accept: 'application/json' },
    });
  } catch (networkError) {
    throw structuredDataError('network', networkError?.message);
  }

  if (response.status === 404 || response.status === 400) throw structuredDataError('notFound');
  if (!response.ok) throw structuredDataError('network', `Unexpected response status ${response.status}`);

  let body;
  try {
    body = await response.json();
  } catch (parseError) {
    throw structuredDataError('invalid', 'Response body is not valid JSON');
  }

  const rawJsonLd = body?.data?.jsonld;
  if (typeof rawJsonLd !== 'string' || rawJsonLd.trim() === '')
    throw structuredDataError('invalid', 'Response has no data.jsonld');

  let parsedJsonLd;
  try {
    parsedJsonLd = JSON.parse(rawJsonLd);
  } catch (parseError) {
    throw structuredDataError('invalid', 'data.jsonld is not parseable JSON');
  }

  const isSeries =
    (body?.data?.subEvent?.length ?? 0) > 0 || (body?.data?.subEventDetails?.totalSubEventCount ?? 0) > 0;

  return {
    jsonLd: JSON.stringify(normalizeEventJsonLd(parsedJsonLd), null, 2),
    isSeries,
  };
};
