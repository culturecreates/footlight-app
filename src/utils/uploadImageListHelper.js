import { filterNonEmptyValues } from './filterNonEmptyValues';

export const uploadImageListHelper = async (values, addImage, calendarId, imageCrop) => {
  for (const imageItem of values.multipleImagesCrop) {
    const file = imageItem?.originFileObj;
    const cropValues = imageItem?.cropValues || {};
    const imageOptions = imageItem?.imageOptions || {};

    const filteredImageOptions = {
      creditText: filterNonEmptyValues(imageOptions.credit) || null,
      description: filterNonEmptyValues(imageOptions.altText) || null,
      caption: filterNonEmptyValues(imageOptions.caption) || null,
    };

    if (!file) {
      const cropData =
        cropValues?.large || cropValues?.thumbnail
          ? { ...cropValues }
          : {
              large: imageItem?.large,
              original: imageItem?.original,
              thumbnail: imageItem?.thumbnail,
            };

      imageCrop.push({
        ...cropData,
        ...filteredImageOptions,
      });
      continue;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await addImage({ data: formData, calendarId }).unwrap();

      const { large, thumbnail } = cropValues;
      const { original, height, width } = response?.data || {};

      imageCrop.push({
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
        ...filteredImageOptions,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
