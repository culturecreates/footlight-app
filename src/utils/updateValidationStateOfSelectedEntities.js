/**
 * Returns updated entities with validation state applied to those missing mandatory fields.
 *
 * For each entity type (organizers, performers, supporters, location), checks if its ID is present
 * in the corresponding list of incomplete IDs. If so, adds a validationReport indicating missing fields.
 *
 * @param {Object} params - Parameters object.
 * @param {Object} params.inCompleteLinkedEntityIds - Object containing arrays of IDs for invalid organizations, people, and places.
 * @param {Array} [params.selectedOrganizers=[]] - Array of selected organizer entities.
 * @param {Array} [params.selectedPerformers=[]] - Array of selected performer entities.
 * @param {Array} [params.selectedSupporters=[]] - Array of selected supporter entities.
 * @param {Object} [params.locationPlace={}] - Selected location entity.
 * @returns {Object} Object containing updated arrays/objects for organizers, performers, supporters, and location.
 */
const updateValidationStateOfSelectedEntities = ({
  inCompleteLinkedEntityIds,
  selectedOrganizers = [],
  selectedPerformers = [],
  selectedSupporters = [],
  locationPlace = {},
}) => {
  if (!inCompleteLinkedEntityIds) return {};

  const { organizations = [], people = [], places = [] } = inCompleteLinkedEntityIds;
  const invalidFlag = { validationReport: { hasAllMandatoryFields: false } };

  const isInvalid = (id) => organizations.includes(id) || people.includes(id);

  const updateArray = (arr) => arr.map((entity) => (isInvalid(entity?.id) ? { ...entity, ...invalidFlag } : entity));

  const updatedOrganizers = updateArray(selectedOrganizers);
  const updatedPerformers = updateArray(selectedPerformers);
  const updatedSupporters = updateArray(selectedSupporters);

  const updatedLocation = places.length ? { ...locationPlace, ...invalidFlag } : locationPlace;

  return {
    updatedOrganizers,
    updatedPerformers,
    updatedSupporters,
    updatedLocation,
  };
};

export default updateValidationStateOfSelectedEntities;
