import { sameAsTypes } from '../constants/sameAsTypes';

export const ARTSDATA_RESOURCE_PREFIX = 'http://kg.artsdata.ca/resource/';

/**
 * Expands a bare Artsdata resource id (e.g. `K10-15`, as returned by the match service) into its
 * canonical absolute IRI (`http://kg.artsdata.ca/resource/K10-15`). Values that are already
 * absolute URIs are returned unchanged. The Artsdata `/query` endpoint rejects bare ids with
 * "Not a valid (absolute) IRI", so every id persisted to `sameAs` or sent to `/query` must go
 * through this first.
 */
export const normalizeArtsdataUri = (value) => {
  if (!value || typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${ARTSDATA_RESOURCE_PREFIX}${trimmed}`;
};

export const artsDataLinkChecker = (link) => {
  const artsData = 'artsdata';
  if (Array.isArray(link)) {
    const artsDataLink = link?.find(
      (item) => item?.type === sameAsTypes.ARTSDATA_IDENTIFIER && isArtsdataUri(item?.uri),
    )?.uri;
    if (artsDataLink) {
      return artsDataLink;
    }
    const url = link?.find((item) => item?.uri?.includes(artsData))?.uri;
    return url || false;
  } else {
    return link?.includes(artsData) ? link : false;
  }
};

export function isArtsdataUri(uri) {
  try {
    const { href } = new URL(uri);
    return href.startsWith('http://kg.artsdata.ca/resource/K');
  } catch {
    console.warn('Invalid URI:', uri);
    return false;
  }
}

export const createArtsDataLink = (uri) => {
  if (!uri) return undefined;
  if (isArtsdataUri(uri)) return uri;

  const encodedUri = encodeURIComponent(uri);

  return `https://kg.artsdata.ca/entity?uri=${encodedUri}`;
};

/**
 * Returns a new `sameAs` array with a single Artsdata identifier set to `uri`.
 * Any pre-existing Artsdata identifier entries are removed first so there is only one link.
 */
export const addArtsdataIdentifier = (sameAs = [], uri) => {
  const existing = Array.isArray(sameAs) ? sameAs : [];
  const withoutArtsdata = existing.filter((item) => item?.type !== sameAsTypes.ARTSDATA_IDENTIFIER);
  return [...withoutArtsdata, { uri, type: sameAsTypes.ARTSDATA_IDENTIFIER }];
};

/**
 * Returns a new `sameAs` array with all Artsdata identifier entries removed (unlink).
 */
export const removeArtsdataIdentifier = (sameAs = []) => {
  const existing = Array.isArray(sameAs) ? sameAs : [];
  return existing.filter((item) => item?.type !== sameAsTypes.ARTSDATA_IDENTIFIER);
};
