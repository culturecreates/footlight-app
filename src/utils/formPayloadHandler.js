import { dataTypes, formTypes } from '../constants/formFields';
import { filterUneditedFallbackValues } from './removeUneditedFallbackValues';

const write = (object, path, value) => {
  return path.reduceRight((obj, next, idx, fullPath) => {
    if (idx + 1 === fullPath.length) {
      return { [next]: value };
    } else {
      return { [next]: obj };
    }
  }, object);
};

export const formPayloadHandler = (
  value,
  mappedField,
  formFields,
  _calendarContentLanguage,
  activeFallbackFieldsInfo = {},
  initialValue = {},
) => {
  const currentField = formFields?.filter((field) => field?.mappedField === mappedField);
  let currentMappedField = mappedField?.split('.');
  let payload;

  if (currentField?.length > 0) {
    let currentDatatype = currentField[0]?.datatype;

    const fallbackValue = {};
    const returnValues = {};

    switch (currentDatatype) {
      case dataTypes.MULTI_LINGUAL:
        if (currentField[0]?.type === formTypes.INPUT || currentField[0]?.type === formTypes.EDITOR) {
          const fallbackFilteredValues = filterUneditedFallbackValues({
            values: value,
            activeFallbackFieldsInfo,
            fieldName: mappedField,
            initialDataValue: initialValue,
          });

          Object.entries(fallbackFilteredValues).forEach(([language, val]) => {
            returnValues[language] = val?.trim();
            fallbackValue[language] = '';
          });
        }

        if (currentMappedField?.length > 1) return write({}, currentMappedField, returnValues ?? fallbackValue);
        else return { [mappedField]: returnValues };

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

      case dataTypes.EMAIL:
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

      case dataTypes.ADDITIONAL_LINKS:
        if (value?.length > 0) {
          payload = value?.map((link) => {
            let labelType;

            switch (link?.type) {
              case 'url':
                labelType = 'uri';
                break;
              case 'email':
                labelType = 'email';
                break;
            }
            if (!labelType || !(link?.value && link?.value.trim() !== '')) return null;
            return {
              [labelType]: link?.value,
              name: link?.name,
            };
          });

          return { [mappedField]: payload.filter(Boolean) };
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
