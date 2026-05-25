const normalizeConceptIds = (concepts = []) => {
  if (!Array.isArray(concepts)) return [];

  const uniqueConceptIds = [];
  const seen = new Set();

  concepts.forEach((concept) => {
    const conceptId = concept?.id ?? concept;
    if (conceptId === null || conceptId === undefined) return;

    const normalizedConceptId = String(conceptId);
    if (seen.has(normalizedConceptId)) return;

    seen.add(normalizedConceptId);
    uniqueConceptIds.push(normalizedConceptId);
  });

  return uniqueConceptIds;
};

const buildAllowedTaxonomySelections = ({ taxonomies = [], customFilters = [] }) => {
  const customFilterIds = new Set((customFilters ?? []).map((id) => String(id)));

  const dynamicTaxonomyConcepts = new Map();
  const standardTaxonomyConcepts = new Map();

  (taxonomies ?? []).forEach((taxonomy) => {
    if (!taxonomy?.id || !customFilterIds.has(String(taxonomy.id))) return;

    const conceptIds = normalizeConceptIds(taxonomy?.concept);

    if (taxonomy?.isDynamicField) {
      dynamicTaxonomyConcepts.set(String(taxonomy.id), new Set(conceptIds));
      return;
    }

    if (taxonomy?.mappedToField) {
      standardTaxonomyConcepts.set(String(taxonomy.mappedToField), new Set(conceptIds));
    }
  });

  return {
    dynamicTaxonomyConcepts,
    standardTaxonomyConcepts,
  };
};

const reconcileFilterByAllowedConcepts = (selectedFilter = {}, allowedTaxonomyConceptMap = new Map()) => {
  const reconciledFilter = {};
  let changed = false;

  Object.entries(selectedFilter ?? {}).forEach(([taxonomyKey, selectedConceptIds]) => {
    const normalizedTaxonomyKey = String(taxonomyKey);
    const allowedConceptIds = allowedTaxonomyConceptMap.get(normalizedTaxonomyKey);

    if (!allowedConceptIds) {
      changed = true;
      return;
    }

    const normalizedSelectedConceptIds = normalizeConceptIds(selectedConceptIds);
    const validConceptIds = normalizedSelectedConceptIds.filter((conceptId) => allowedConceptIds.has(conceptId));

    if (validConceptIds.length === 0) {
      changed = true;
      return;
    }

    if (validConceptIds.length !== normalizedSelectedConceptIds.length) {
      changed = true;
    }

    reconciledFilter[normalizedTaxonomyKey] = validConceptIds;
  });

  if (Object.keys(reconciledFilter).length !== Object.keys(selectedFilter ?? {}).length) {
    changed = true;
  }

  return {
    reconciledFilter,
    changed,
  };
};

export const reconcileTaxonomyFilters = ({
  taxonomyFilter = {},
  standardTaxonomyFilter = {},
  taxonomies = [],
  customFilters = [],
}) => {
  const { dynamicTaxonomyConcepts, standardTaxonomyConcepts } = buildAllowedTaxonomySelections({
    taxonomies,
    customFilters,
  });

  const { reconciledFilter: reconciledTaxonomyFilter, changed: isTaxonomyFilterChanged } =
    reconcileFilterByAllowedConcepts(taxonomyFilter, dynamicTaxonomyConcepts);

  const { reconciledFilter: reconciledStandardTaxonomyFilter, changed: isStandardTaxonomyFilterChanged } =
    reconcileFilterByAllowedConcepts(standardTaxonomyFilter, standardTaxonomyConcepts);

  return {
    reconciledTaxonomyFilter,
    reconciledStandardTaxonomyFilter,
    isTaxonomyFilterChanged,
    isStandardTaxonomyFilterChanged,
  };
};
