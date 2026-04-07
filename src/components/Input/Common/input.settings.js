export const urlProtocolCheck = (url) => {
  if (url && url != '') {
    if (url.includes('https://') || url.includes('http://')) return url;
    else return 'https://' + url;
  } else return '';
};

export const urlValidator = (url) => {
  if (!url || url === '') return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
