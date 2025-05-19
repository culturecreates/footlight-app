/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
export function getEmbedUrl(url) {
  const embedUrlRegex = /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com\/embed\/|player\.vimeo\.com\/video\/)(.+)/;
  const embedUrlMatch = embedUrlRegex.exec(url);

  if (embedUrlMatch && (validateYouTubeURL(url) || validateVimeoURL(url))) {
    return url;
  }

  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/;

  const youtubeMatch = youtubeRegex.exec(url);
  const vimeoMatch = vimeoRegex.exec(url);

  let embedUrl;

  if (youtubeMatch && validateYouTubeURL(url)) {
    embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  } else if (vimeoMatch && validateVimeoURL(url)) {
    embedUrl = `//player.vimeo.com/video/${vimeoMatch[1]}`;
  } else {
    return '';
  }

  return embedUrl;
}

export const validateYouTubeURL = (url) => {
  let pattern =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return pattern.test(url);
};

export const validateVimeoURL = (url) => {
  const vimeoRegex = /^((https?:)?\/\/)?(player\.)?(vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)?([0-9]+)/;
  return vimeoRegex.test(url);
};

export const validateVideoLink = (rule, value) => {
  if (!value) {
    return Promise.resolve();
  }

  if (!validateYouTubeURL(value) && !validateVimeoURL(value)) {
    return Promise.reject(t('dashboard.events.addEditEvent.validations.url'));
  }

  return Promise.resolve();
};
