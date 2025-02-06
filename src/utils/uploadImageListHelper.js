export const uploadImageListHelper = async (values, addImage, calendarId, imageCrop) => {
  for (let i = 0; i < values.multipleImagesCrop.length; i++) {
    const file = values.multipleImagesCrop[i]?.originFileObj;
    if (!file) {
      const cropValues = values.multipleImagesCrop[i]?.cropValues || {};
      const imageOptions = values.multipleImagesCrop[i]?.imageOptions || {};

      if (cropValues)
        imageCrop.push({
          ...cropValues,
          creditText: imageOptions.credit || null,
          description: imageOptions.altText || null,
          caption: imageOptions.caption || null,
        });
      else
        imageCrop.push({
          ...values.multipleImagesCrop[i],
          creditText: imageOptions.credit || null,
          description: imageOptions.altText || null,
          caption: imageOptions.caption || null,
        });
      continue;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await addImage({ data: formData, calendarId }).unwrap();

      const { large, thumbnail } = values.multipleImagesCrop[i]?.cropValues || {};
      const { original, height, width } = response?.data || {};
      const { altText, credit, caption } = values.multipleImagesCrop[i]?.imageOptions || {};

      const galleryImage = {
        large: {
          xCoordinate: large?.x,
          yCoordinate: large?.y,
          height: large?.height,
          width: large?.width,
        },
        original: {
          entityId: original?.entityId ?? null,
          height,
          width,
        },
        thumbnail: {
          xCoordinate: thumbnail?.x,
          yCoordinate: thumbnail?.y,
          height: thumbnail?.height,
          width: thumbnail?.width,
        },
        description: altText,
        creditText: credit,
        caption,
      };

      imageCrop.push(galleryImage);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};
