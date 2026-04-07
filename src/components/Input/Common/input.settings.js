export const urlProtocolCheck = (url) => {
  if (url && url != '') {
    if (url.includes('https://') || url.includes('http://')) return url;
    else return 'https://' + url;
  } else return '';
};

export const urlValidator = (url) => {
  if (!url || url === '') return true;
  if (/\s/.test(url)) return false;
  try {
    const normalized = url.includes('://') ? url : `https://${url}`;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
};
