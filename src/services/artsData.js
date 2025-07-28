const baseUrl = process.env.REACT_APP_ARTS_DATA_URI;

export async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }
  return response.json();
}

export async function getArtsDataEntities({ searchKeyword, entityType }) {
  const query = `recon?query=${searchKeyword}&type=schema:${entityType}`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}

export async function loadArtsDataEntity({ entityId }) {
  const sparqlQuery = 'footlight_cms/org_person';
  const query = `query?uri=${entityId}&format=json&frame=ranked_org_person_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}
export async function loadArtsDataPlaceEntity({ entityId }) {
  const sparqlQuery = 'footlight_cms/place';
  const query = `query?uri=${entityId}&format=json&frame=ranked_place_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}

export async function loadArtsDataEventEntity({ entityId }) {
  const sparqlQuery = 'footlight_cms/event';

  const query = `query?uri=${entityId}&format=json&frame=ranked_event_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;

  return fetchData(url);
}
