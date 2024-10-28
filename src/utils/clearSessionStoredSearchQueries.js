export const clearSessionStoredSearchQueries = () => {
  const keys = [
    'query',
    'queryTaxonomy',
    'peopleSearchQuery',
    'organizationSearchQuery',
    'placesSearchQuery',
    'queryUserListing',
  ];

  keys.forEach((key) => sessionStorage.removeItem(key));
};
