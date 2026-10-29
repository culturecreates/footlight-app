import { uploadImageListHelper } from './uploadImageListHelper';
import { mergeUploadedImageIntoCrop } from './mergeUploadedImageIntoCrop';

/**
 *
 * @param {object}   params
 * @param {object}   params.values            Form values from form.validateFields().
 * @param {string}   params.calendarId
 * @param {function} params.addImage          RTK Query addImage mutation trigger.
 * @param {Array}    params.imageCrop         Crop payload from buildImageCropPayload().
 * @param {object}   params.mainImageOptions  Main image options (altText/credit/caption).
 * @param {Array}    params.mainImageFile     The main image Upload fileList (e.g. values.image / values.dragger).
 * @param {boolean}  params.isMainImageRemoved Truthy when the main image field was present (so an empty list means "removed").
 * @param {string}   params.scrollClassName   className to scroll into view when the upload fails.
 * @param {object}   params.entityPayload     The entity payload to attach the image to (mutated in place).
 * @param {function} params.saveHandler       Called with the finalized payload; its return value is propagated.
 * @returns {Promise<*>} Resolves with saveHandler's return value.
 */
export const processImageAndSave = async ({
  values,
  calendarId,
  addImage,
  imageCrop,
  mainImageOptions,
  mainImageFile,
  isMainImageRemoved,
  scrollClassName,
  entityPayload,
  saveHandler,
}) => {
  let crop = imageCrop;

  if (mainImageFile?.length > 0 && mainImageFile[0]?.originFileObj) {
    const formdata = new FormData();
    formdata.append('file', mainImageFile[0].originFileObj);
    return addImage({ data: formdata, calendarId })
      .unwrap()
      .then(async (response) => {
        crop = mergeUploadedImageIntoCrop(response, crop, mainImageOptions);

        if (values.multipleImagesCrop?.length > 0) await uploadImageListHelper(values, addImage, calendarId, crop);
        entityPayload['image'] = crop;
        return saveHandler(entityPayload);
      })
      .catch((error) => {
        console.log(error);
        const element = document.getElementsByClassName(scrollClassName);
        element && element[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
  }

  if (values.multipleImagesCrop?.length > 0) await uploadImageListHelper(values, addImage, calendarId, crop);
  if (
    isMainImageRemoved &&
    mainImageFile?.length === 0 &&
    (!values.multipleImagesCrop || values.multipleImagesCrop?.length === 0)
  ) {
    // Main image removed and no gallery images added
    entityPayload['image'] = [];
  } else entityPayload['image'] = crop;

  return saveHandler(entityPayload);
};
