import { sameAsTypes } from '../constants/sameAsTypes';

export const artsDataLinkChecker = (link) => {
  const artsData = 'artsdata';
  if (Array.isArray(link)) {
    const artsDataLink = link?.find((item) => item?.type === sameAsTypes.ARTSDATA_IDENTIFIER)?.uri;
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
    return href.startsWith('http://kg.artsdata.ca');
  } catch {
    console.warn('Invalid URI:', uri);
    return false;
  }
}
