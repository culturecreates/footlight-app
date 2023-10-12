export const getExternalSourceId = (url = '') => {
  let sourceId;
  if (url) {
    url = url?.split('/');
    if (url?.length > 0) {
      sourceId = url[url?.length - 1];
      return sourceId;
    }
  } else return;
};
