export const clearSessionStoredSearchQueries = () => {
  sessionStorage.removeItem('query');
  sessionStorage.removeItem('queryTaxonomy');
  sessionStorage.removeItem('peopleSearchQuery');
  sessionStorage.removeItem('organizationSearchQuery');
  sessionStorage.removeItem('placesSearchQuery');
  sessionStorage.removeItem('queryUserListing');
};
