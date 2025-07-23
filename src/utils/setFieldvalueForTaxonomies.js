import { placeTaxonomyMappedFieldTypes } from '../constants/placeMappedFieldTypes';
import { taxonomyDetails } from './taxonomyDetails';

/**
 * Sets initial field values for taxonomies based form items.
 * If data is not available for the entity, it sets the default concepts as initial value.
 *
 * @param {Object} params - The parameters object.
 * @param {Array<Object>} params.concepts - Array of concept objects.
 * @param {Function} params.fn - Function that returns the initial values array that is available in api data.
 *
 * @returns {Array<string>} - The updated values array.
 */
function setFieldvalueForTaxonomies({ concepts, fn }) {
  let values = fn();

  if (!Array.isArray(concepts)) return values;

  if (!values || (Array.isArray(values) && !values.length)) {
    concepts.forEach((concept) => {
      if (concept?.isDefault) {
        values.push(concept?.id);
      }
    });
  }

  return values;
}
export default setFieldvalueForTaxonomies;

/**
 * Sets initial values for standard taxonomy fields in the Place form.
 *
 * @param {Object} params - The parameters for setting initial values.
 * @param {Object} params.data - The main data object containing place information.
 * @param {Object} params.artsData - Entity from arts data.
 * @param {Object} params.allTaxonomyData - All available taxonomy data.
 * @param {Object} params.user - The current user object.
 * @param {Object} params.formFieldNames - Mapping of form field names to taxonomy field types.
 * @param {string|number} params.artsDataId - Identifier for arts data entity.
 * @returns {Object} initialValues - An object containing initial values for taxonomy fields in the form.
 */

export const setInitialValueForStandardTaxonomyFieldsForPlaceForm = ({
  data,
  artsData,
  allTaxonomyData,
  user,
  formFieldNames,
  artsDataId,
}) => {
  let initialValues = {};
  initialValues[formFieldNames.TYPE] = setFieldvalueForTaxonomies({
    concepts: taxonomyDetails(allTaxonomyData?.data, user, placeTaxonomyMappedFieldTypes.TYPE, 'concept', false)
      ?.concept,
    fn: () => {
      return data?.additionalType?.map((type) => {
        return type?.entityId;
      });
    },
  });
  initialValues[formFieldNames.REGION] = setFieldvalueForTaxonomies({
    concepts: taxonomyDetails(allTaxonomyData?.data, user, placeTaxonomyMappedFieldTypes.REGION, 'concept', false)
      ?.concept,
    fn: () => {
      return data?.regions
        ? data?.regions?.map((type) => {
            return type?.entityId;
          })
        : artsDataId
        ? artsData?.regions &&
          artsData?.regions?.map((region) => {
            return region?.entityId;
          })
        : [];
    },
  });
  initialValues[formFieldNames.PLACE_ACCESSIBILITY] = setFieldvalueForTaxonomies({
    concepts: taxonomyDetails(
      allTaxonomyData?.data,
      user,
      placeTaxonomyMappedFieldTypes.PLACE_ACCESSIBILITY,
      'concept',
      false,
    )?.concept,
    fn: () => {
      return data?.accessibility?.map((type) => {
        return type?.entityId;
      });
    },
  });
  return initialValues;
};
