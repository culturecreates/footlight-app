export const removeEmptyParagraphsAtEnd = (content) => {
  // Use a regular expression to remove <p><br></p> tags at the end
  if (content != String) return content;

  const modifiedContent = content.replace(/<p>\s*<br>\s*<\/p>\s*/g, '');

  return modifiedContent;
};

/**
 * Removes all empty paragraph tags from HTML content
 * Handles both <p><br></p> and <p>&nbsp;</p> patterns
 * This helps create cleaner HTML output and reduces CSS-related display inconsistencies
 *
 * @param {string} content - HTML content to clean
 * @returns {string} - Cleaned HTML content
 */
export const removeEmptyParagraphs = (content) => {
  if (typeof content !== 'string') return content;

  let modifiedContent = content;

  modifiedContent = modifiedContent.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '');

  modifiedContent = modifiedContent.replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');

  modifiedContent = modifiedContent.replace(/<p>\s*<\/p>/gi, '');

  return modifiedContent;
};
