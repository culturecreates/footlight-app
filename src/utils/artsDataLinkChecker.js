export const artsDataLinkChecker = (link) => {
  let artsData = 'artsdata';

  if (Array.isArray(link)) {
    let url = link?.filter((url) => url?.uri?.includes(artsData));
    if (url?.length > 0) return url[0];
    else return false;
  } else {
    if (link?.includes(artsData)) return link;
    else return false;
  }
};
