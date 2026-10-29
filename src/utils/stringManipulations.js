import DOMPurify from 'dompurify';

export function capitalizeFirstLetter(str) {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Sanitizes backend/user-authored rich-text HTML before it is injected via
// dangerouslySetInnerHTML. Keeps safe formatting (what QuillEditor produces)
// while removing scripts, event-handler attributes, and javascript: URLs.
export const sanitizeHtml = (html) => DOMPurify.sanitize(html ?? '', { USE_PROFILES: { html: true } });

export const stripHtml = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.innerText || ''; // Return plain text
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
};
