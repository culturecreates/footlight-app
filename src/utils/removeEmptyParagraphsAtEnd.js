export const removeEmptyParagraphsAtEnd = (content) => {
  // Use a regular expression to remove <p><br></p> tags at the end
  const modifiedContent = content.replace(/<p>\s*<br>\s*<\/p>\s*/g, '');

  return modifiedContent;
};
