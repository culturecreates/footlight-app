export const getWidthFromAspectRatio = (aspectRatio = '1:1', fixedHeight) => {
  const [width, height] = aspectRatio.split(':').map(Number);
  return (fixedHeight * width) / height;
};
