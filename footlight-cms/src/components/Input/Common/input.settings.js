export const urlProtocolCheck = (url) => {
  if (url && url != '') {
    if (url.includes('https://') || url.includes('http://')) return url;
    else return 'https://' + url;
  } else return '';
};
