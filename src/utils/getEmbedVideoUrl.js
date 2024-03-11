/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
export function getEmbedUrl(url) {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/;

  const youtubeMatch = youtubeRegex.exec(url);
  const vimeoMatch = vimeoRegex.exec(url);

  let embedUrl;
  if (youtubeMatch) {
    embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  } else if (vimeoMatch) {
    embedUrl = `//player.vimeo.com/video/${vimeoMatch[1]}`;
  } else {
    return '';
  }

  return embedUrl;
}

export const validateYouTubeURL = (url) => {
  const youtubeRegex = /^((https?\:)?\/\/)?((www\.)?youtube\.com|youtu\.be)\/watch\?(v=[^&\s]+)/;
  return youtubeRegex.test(url);
};

export const validateVimeoURL = (url) => {
  const vimeoRegex = /^((https?\:)?\/\/)?(player\.)?vimeo\.com\/([0-9]+)/;
  return vimeoRegex.test(url);
};
