export const mergeUploadedImageIntoCrop = (uploadResponse, imageCrop, mainImageOptions) => {
  return [
    {
      large: imageCrop[0]?.large,
      thumbnail: imageCrop[0]?.thumbnail,
      isMain: true,
      original: {
        entityId: uploadResponse?.data?.original?.entityId,
        height: uploadResponse?.data?.height,
        width: uploadResponse?.data?.width,
      },
      description: mainImageOptions?.altText,
      creditText: mainImageOptions?.credit,
      caption: mainImageOptions?.caption,
    },
  ];
};
