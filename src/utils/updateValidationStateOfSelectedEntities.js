/**
 * Updates validation state for linked entities (organizers, performers, supporters, locations)
 * @param {Object} params
 * @param {Object} params.inCompleteLinkedEntityIds - IDs of invalid entities grouped by type
 * @param {Function} params.setSelectedOrganizers - State setter for organizers
 * @param {Function} params.setSelectedPerformers - State setter for performers
 * @param {Function} params.setSelectedSupporters - State setter for supporters
 * @param {Function} params.setLocationPlace - State setter for location
 */
const updateValidationStateOfSelectedEntities = ({
  inCompleteLinkedEntityIds,
  setSelectedOrganizers,
  setSelectedPerformers,
  setSelectedSupporters,
  setLocationPlace,
}) => {
  if (!inCompleteLinkedEntityIds) return;

  const { organizations, people, places } = inCompleteLinkedEntityIds;
  const invalidFlag = { validationReport: { hasAllMandatoryFields: false } };

  // Generic updater function
  const updateEntities = (ids, entity) => (ids.includes(entity?.id) ? { ...entity, ...invalidFlag } : entity);

  // Update organization-type entities
  if (organizations?.length) {
    const updateFn = (prev) => prev.map((org) => updateEntities(organizations, org));
    setSelectedOrganizers(updateFn);
    setSelectedPerformers(updateFn);
    setSelectedSupporters(updateFn);
  }

  // Update people-type entities
  if (people?.length) {
    const updateFn = (prev) => prev.map((person) => updateEntities(people, person));
    setSelectedOrganizers(updateFn);
    setSelectedPerformers(updateFn);
    setSelectedSupporters(updateFn);
  }

  // Update location
  if (places?.length) {
    setLocationPlace((prev) => ({ ...prev, ...invalidFlag }));
  }
};

export default updateValidationStateOfSelectedEntities;
