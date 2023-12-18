import { dataTypes, formTypes } from '../constants/formFields';

const write = (object, path, value) => {
  return path.reduceRight((obj, next, idx, fullPath) => {
    if (idx + 1 === fullPath.length) {
      return { [next]: value };
    } else {
      return { [next]: obj };
    }
  }, object);
};

export const formPayloadHandler = (value, mappedField, formFields) => {
  const currentField = formFields?.filter((field) => field?.mappedField === mappedField);
  let currentMappedField = mappedField?.split('.');
  let payload;
  if (currentField?.length > 0) {
    let currentDatatype = currentField[0]?.datatype;
    switch (currentDatatype) {
      case dataTypes.MULTI_LINGUAL:
        if (currentField[0]?.type === formTypes.INPUT) {
          value = {
            en: value?.en?.trim(),
            fr: value?.fr?.trim(),
          };
        }
        if (currentMappedField?.length > 1) return write({}, currentMappedField, value ?? { en: '', fr: '' });
        else return { [mappedField]: value };

      case dataTypes.STANDARD_FIELD:
        payload = value?.map((id) => {
          return {
            entityId: id,
          };
        });
        if (payload?.length == 0 || !payload) payload = [];
        return { [mappedField]: payload };

      case dataTypes.STRING:
        if (currentMappedField?.length > 1) return write({}, currentMappedField, value ?? '');
        else return { [mappedField]: value };

      case dataTypes.URI_STRING:
        return write({}, currentMappedField?.concat(['uri']), value ?? '');

      case dataTypes.IDENTITY_STRING:
        return write({}, currentMappedField?.concat(['entityId']), value ?? '');

      case dataTypes.URI_STRING_ARRAY:
        if (value?.length > 0) {
          payload = value?.filter((link) => link != undefined);
          return { [mappedField]: payload };
        } else return { [mappedField]: [] };
      default:
        break;
    }
  } else {
    if (mappedField === 'dynamicFields')
      payload = Object.keys(value)?.map((dynamicField) => {
        return {
          taxonomyId: dynamicField,
          conceptIds: value[dynamicField],
        };
      });
    return { [mappedField]: payload };
  }
};
