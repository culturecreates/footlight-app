import { dataTypes, formTypes } from '../constants/formFields';

export const formInitialValueHandler = (type, mappedField, datatype, data) => {
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
      if (initialData?.length > 0) return initialData?.map((concept) => concept?.entityId);
      else return [];

    default:
      break;
  }
};
