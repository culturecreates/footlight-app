import { Translation } from 'react-i18next';

export const IMAGE_ACTIONS = {
  ADD: 'ADD',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  CROP: 'CROP',
  CREDIT: 'CREDIT',
  ALT_TEXT: 'ALTTEXT',
  CAPTION: 'CAPTION',
};
const hasValidValue = (obj) =>
  obj && typeof obj === 'object' && Object.values(obj).some((value) => value && value !== '');

const getFieldOperation = (value) => (hasValidValue(value) ? IMAGE_ACTIONS.EDIT : IMAGE_ACTIONS.ADD);

export const imageUploadOptions = ({ credits, altText, caption }) => {
  return [
    {
      key: IMAGE_ACTIONS.CROP,
      label: (
        <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.image.options.cropImage')}</Translation>
      ),
    },
    {
      key: IMAGE_ACTIONS.CREDIT,
      label: (
        <Translation>
          {(t) =>
            t(
              getFieldOperation(credits) === IMAGE_ACTIONS.ADD
                ? 'dashboard.events.addEditEvent.otherInformation.image.options.imageCredit'
                : 'dashboard.events.addEditEvent.otherInformation.image.options.editImageCredit',
            )
          }
        </Translation>
      ),
    },
    {
      key: IMAGE_ACTIONS.ALT_TEXT,
      label: (
        <Translation>
          {(t) =>
            t(
              getFieldOperation(altText) === IMAGE_ACTIONS.ADD
                ? 'dashboard.events.addEditEvent.otherInformation.image.options.altText'
                : 'dashboard.events.addEditEvent.otherInformation.image.options.editAltText',
            )
          }
        </Translation>
      ),
    },
    {
      key: IMAGE_ACTIONS.CAPTION,
      label: (
        <Translation>
          {(t) =>
            t(
              getFieldOperation(caption) === IMAGE_ACTIONS.ADD
                ? 'dashboard.events.addEditEvent.otherInformation.image.options.imageCaptions'
                : 'dashboard.events.addEditEvent.otherInformation.image.options.editImageCaptions',
            )
          }
        </Translation>
      ),
    },
    {
      key: IMAGE_ACTIONS.DELETE,
      label: (
        <Translation>
          {(t) => t('dashboard.events.addEditEvent.otherInformation.image.options.deleteImage')}
        </Translation>
      ),
    },
  ];
};
