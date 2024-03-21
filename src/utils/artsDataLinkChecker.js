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
