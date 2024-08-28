export const clearSessionStoredSearchQueries = () => {
  [
    'query',
    'queryTaxonomy',
    'peopleSearchQuery',
    'organizationSearchQuery',
    'placesSearchQuery',
    'queryUserListing',
  ].forEach((key) => {
    sessionStorage.removeItem(key);
  });
};
