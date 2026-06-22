import { externalSourceOptions } from './sourceOptions';

export const importProviderContexts = {
  SEARCH_PEOPLE: 'searchPeople',
  SEARCH_PLACES: 'searchPlaces',
  SEARCH_ORGANIZATIONS: 'searchOrganizations',
  SEARCH_EVENTS: 'searchEvents',
  ADD_EVENT_PLACE: 'addEventPlace',
  ADD_EVENT_ORGANIZER_PERFORMER_SUPPORTER: 'addEventOrganizerPerformerSupporter',
  CREATE_ORGANIZATION_PLACE: 'createOrganizationPlace',
  CREATE_PLACE_RELATIONS: 'createPlaceRelations',
  QUICK_CREATE_ORGANIZATION_PLACE: 'quickCreateOrganizationPlace',
  QUICK_CREATE_PLACE_RELATIONS: 'quickCreatePlaceRelations',
};

const artsdataOnlyConfig = {
  externalProviders: [externalSourceOptions.ARTSDATA],
  showFootlightImportSection: false,
};

const importProviderConfig = {
  [importProviderContexts.SEARCH_PEOPLE]: artsdataOnlyConfig,
  [importProviderContexts.SEARCH_PLACES]: artsdataOnlyConfig,
  [importProviderContexts.SEARCH_ORGANIZATIONS]: artsdataOnlyConfig,
  [importProviderContexts.SEARCH_EVENTS]: artsdataOnlyConfig,
  [importProviderContexts.ADD_EVENT_PLACE]: artsdataOnlyConfig,
  [importProviderContexts.ADD_EVENT_ORGANIZER_PERFORMER_SUPPORTER]: artsdataOnlyConfig,
  [importProviderContexts.CREATE_ORGANIZATION_PLACE]: artsdataOnlyConfig,
  [importProviderContexts.CREATE_PLACE_RELATIONS]: artsdataOnlyConfig,
  [importProviderContexts.QUICK_CREATE_ORGANIZATION_PLACE]: artsdataOnlyConfig,
  [importProviderContexts.QUICK_CREATE_PLACE_RELATIONS]: artsdataOnlyConfig,
};

export const getImportProviderConfig = (context) => importProviderConfig[context] ?? artsdataOnlyConfig;

export const getExternalSourcesQuery = (context) => {
  const sourceQuery = new URLSearchParams();
  getImportProviderConfig(context).externalProviders.forEach((provider) => {
    sourceQuery.append('sources', provider);
  });

  return decodeURIComponent(sourceQuery.toString());
};
