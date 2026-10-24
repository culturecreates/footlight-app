export const buildImageCropPayload = (formImageCrop, mainImageOptions) => {
  let imageCrop = formImageCrop ? [formImageCrop] : [];
  if (imageCrop.length > 0) {
    imageCrop = [
      {
        large: {
          xCoordinate: imageCrop[0]?.large?.x,
          yCoordinate: imageCrop[0]?.large?.y,
          height: imageCrop[0]?.large?.height,
          width: imageCrop[0]?.large?.width,
        },
        thumbnail: {
          xCoordinate: imageCrop[0]?.thumbnail?.x,
          yCoordinate: imageCrop[0]?.thumbnail?.y,
          height: imageCrop[0]?.thumbnail?.height,
          width: imageCrop[0]?.thumbnail?.width,
        },
        original: {
          entityId: imageCrop[0]?.original?.entityId,
          height: imageCrop[0]?.original?.height,
          width: imageCrop[0]?.original?.width,
        },
        isMain: true,
        description: mainImageOptions?.altText,
        creditText: mainImageOptions?.credit,
        caption: mainImageOptions?.caption,
      },
    ];
  }
  return imageCrop;
};
