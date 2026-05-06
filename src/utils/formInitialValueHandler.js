import { dataTypes, formTypes } from '../constants/formFields';
import resolveTaxonomyValues from './setFieldvalueForTaxonomies';

export const formInitialValueHandler = (
  type,
  mappedField,
  datatype,
  data,
  isImportedEntity,
  allTaxonomyData,
  taxonomyAlias,
) => {
  let mappedFieldSplit = mappedField?.split('.');
  let initialData = data;

  for (let index = 0; index < mappedFieldSplit?.length; index++) {
    if (initialData) initialData = initialData[mappedFieldSplit[index]];
  }
  switch (type) {
    case formTypes.INPUT:
      if (datatype === dataTypes.URI_STRING) return initialData?.uri;
      else return initialData;

    case formTypes.MULTISELECT:
      if (isImportedEntity && allTaxonomyData && taxonomyAlias) {
        return resolveTaxonomyValues({
          concepts: allTaxonomyData?.data?.find((taxonomy) => taxonomy?.mappedToField === taxonomyAlias)?.concept,
          getInitialValues: () => initialData?.map((concept) => concept?.entityId),
        });
      } else if (initialData?.length > 0) {
        return initialData?.map((concept) => concept?.entityId);
      } else return [];

    case formTypes.IMAGE:
      if (Array.isArray(initialData) && initialData.length > 0) {
        const mainImage = initialData.find((image) => image?.isMain);
        if (!mainImage) break;
        return [
          {
            uid: mainImage?.original?.entityId,
            name: mainImage?.original?.entityId,
            status: 'done',
            url: mainImage?.original?.uri,
          },
        ];
      } else if (initialData?.original?.uri) {
        return [
          {
            uid: initialData?.original?.entityId,
            name: initialData?.original?.entityId,
            status: 'done',
            url: initialData?.original?.uri,
          },
        ];
      }
      break;
    default:
      break;
  }
};
