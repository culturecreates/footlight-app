import { findMatchingItems, treeTaxonomyOptions } from '../components/TreeSelectOption/treeSelectOption.settings';
import { eventTaxonomyMappedField } from '../constants/eventTaxonomyMappedField';
import { placeTaxonomyMappedFieldTypes } from '../constants/placeMappedFieldTypes';
import { taxonomyDetails } from './taxonomyDetails';

/**
 * Add the default concept in to the set of initial values.
 *
 * @param {Object} params - The parameters object.
 * @param {Array<Object>} params.concepts - Array of concept objects.
 * @param {Function} params.fn - Function that returns the initial values array that is available in api data.
 *
 * @returns {Array<string>} - The updated values array.
 */

function setFieldvalueForTaxonomies({ concepts, fn }) {
  let values = fn() || [];

  if (!Array.isArray(concepts)) return values;

  if (Array.isArray(values) && values.length === 0) {
    const defaultConceptId = findDefaultConceptId(concepts);

    if (defaultConceptId) values.push(defaultConceptId);
  }

  return values;
}
export default setFieldvalueForTaxonomies;

/**
 * DFS traversal to find first node with isDefault flag.
 * @param {Array} nodes - Taxonomy nodes with:
 *   @property {string} id - Unique identifier (required)
 *   @property {boolean} [isDefault] - Mark as default
 *   @property {Array} [children] - Optional - Child nodes
 *   @property {*} [...] - Other fields ignored by this function
 * @returns {string|null} - ID of first default node found
 */
function findDefaultConceptId(nodes) {
  if (!Array.isArray(nodes)) return null;

  for (const node of nodes) {
    if (node?.isDefault) return node.id;
    if (node.children) {
      const found = findDefaultConceptId(node.children);
      if (found) return found;
    }
  }

  return null;
}

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

/**
 * Sets initial values for standard taxonomy fields in the event form.
 *
 * @param {Object} params - The parameters object.
 * @param {Object} params.data - The event data object form CMS.
 * @param {Object} params.artsData - The event data object form arts data.
 * @param {Object} params.allTaxonomyData - The complete taxonomy data object.
 * @param {Object} params.user - The current user object.
 * @param {Object} params.formFieldNames - Mapping of form field names to taxonomy field types.
 * @param {string[]} params.calendarContentLanguage - Array of languages used in the calendar.
 * @param {string} params.eventId - The event ID.
 * @returns {Object} initialValues - An object containing initial values for the event form's taxonomy fields.
 */
export const setInitialValueForStandardTaxonomyFieldsForEventForm = ({
  data,
  artsData,
  allTaxonomyData,
  user,
  formFieldNames,
  calendarContentLanguage,
  eventId,
}) => {
  let initialValues = {};

  initialValues[formFieldNames[eventTaxonomyMappedField.EVENT_TYPE]] = setFieldvalueForTaxonomies({
    concepts: taxonomyDetails(allTaxonomyData?.data, user, eventTaxonomyMappedField.EVENT_TYPE, 'concept', false)
      ?.concept,
    fn: () =>
      data?.additionalType?.map((type) => {
        return type?.entityId;
      }) ??
      findMatchingItems(
        treeTaxonomyOptions(allTaxonomyData, user, 'EventType', false, calendarContentLanguage),
        artsData?.additionalType
          ?.map((type) => type?.label)
          ?.flatMap((obj) => Object.values(obj).map((val) => val.toLowerCase())),
      )?.map((concept) => concept?.value),
  });

  initialValues[formFieldNames[eventTaxonomyMappedField.AUDIENCE]] = setFieldvalueForTaxonomies({
    concepts: taxonomyDetails(allTaxonomyData?.data, user, eventTaxonomyMappedField.AUDIENCE, 'concept', false)
      ?.concept,
    fn: () =>
      data?.audience?.map((audience) => {
        return audience?.entityId;
      }) ??
      findMatchingItems(
        treeTaxonomyOptions(allTaxonomyData, user, 'Audience', false, calendarContentLanguage),
        artsData?.audience
          ?.map((type) => type?.label)
          ?.flatMap((obj) => Object.values(obj).map((val) => val.toLowerCase())),
      )?.map((concept) => concept?.value),
  });

  initialValues[formFieldNames[eventTaxonomyMappedField.EVENT_DISCIPLINE]] = setFieldvalueForTaxonomies({
    concepts: taxonomyDetails(allTaxonomyData?.data, user, eventTaxonomyMappedField.EVENT_DISCIPLINE, 'concept', false)
      ?.concept,
    fn: () =>
      data?.discipline?.map((type) => type?.entityId) ??
      findMatchingItems(
        treeTaxonomyOptions(allTaxonomyData, user, 'EventDiscipline', false, calendarContentLanguage),
        artsData?.discipline
          ?.map((type) => type?.label)
          ?.flatMap((obj) => Object.values(obj).map((val) => val.toLowerCase())),
      )?.map((concept) => concept?.value),
  });

  initialValues[formFieldNames[eventTaxonomyMappedField.IN_LANGUAGE]] = setFieldvalueForTaxonomies({
    concepts: taxonomyDetails(allTaxonomyData?.data, user, eventTaxonomyMappedField.IN_LANGUAGE, 'concept', false)
      ?.concept,
    fn: () =>
      eventId
        ? data?.inLanguage?.map((inLanguage) => {
            return inLanguage?.entityId;
          })
        : allTaxonomyData?.data
            ?.find((taxonomy) => taxonomy?.mappedToField === 'inLanguage')
            ?.concept?.map((concept) => (concept?.isDefault === true ? concept?.id : null))
            ?.filter((id) => id),
  });

  initialValues[formFieldNames[eventTaxonomyMappedField.EVENT_ACCESSIBILITY]] = setFieldvalueForTaxonomies({
    concepts: taxonomyDetails(
      allTaxonomyData?.data,
      user,
      eventTaxonomyMappedField.EVENT_ACCESSIBILITY,
      'concept',
      false,
    )?.concept,
    fn: () =>
      data?.accessibility?.map((type) => {
        return type?.entityId;
      }),
  });

  return initialValues;
};
