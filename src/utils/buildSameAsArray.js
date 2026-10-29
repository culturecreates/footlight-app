import { sameAsTypes } from '../constants/sameAsTypes';

export const buildSameAsArray = ({
  artsData,
  artsDataId,
  isImportingExistingEntity,
  externalCalendarEntityId,
  externalEntityData,
}) => {
  let sameAs;

  if (artsDataId && artsData && !isImportingExistingEntity) {
    let sameAsArray = Array.isArray(artsData.sameAs)
      ? artsData.sameAs
      : artsData.sameAs && typeof artsData.sameAs === 'object'
      ? [artsData.sameAs]
      : [];

    const existingIndex = sameAsArray.findIndex((item) => item.uri === artsData.uri);

    const artsDataIdentifier = {
      uri: artsData.uri,
      type: sameAsTypes.ARTSDATA_IDENTIFIER,
    };

    if (existingIndex !== -1) {
      sameAsArray[existingIndex] = artsDataIdentifier;
    } else {
      sameAsArray.push(artsDataIdentifier);
    }

    sameAs = sameAsArray;
  }

  if (externalCalendarEntityId && !isImportingExistingEntity) {
    let footlightSameAs = [
      {
        uri: externalCalendarEntityId,
        type: sameAsTypes.FOOTLIGHT_IDENTIFIER,
      },
    ];
    if (externalEntityData?.sameAs) {
      sameAs = externalEntityData?.sameAs?.concat(footlightSameAs);
    }
  }

  return sameAs;
};
