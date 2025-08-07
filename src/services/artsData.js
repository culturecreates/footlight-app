const baseUrl = process.env.REACT_APP_ARTS_DATA_URI;
const publicUrl = process.env.REACT_APP_API_URL;

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
  const sparqlQuery = `${publicUrl}/public/sparql/org_person.sparql`;
  const query = `query?uri=${entityId}&format=json&frame=ranked_org_person_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}
export async function loadArtsDataPlaceEntity({ entityId }) {
  const sparqlQuery = `${publicUrl}/public/sparql/place.sparql`;
  const query = `query?uri=${entityId}&format=json&frame=ranked_place_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}

export async function loadArtsDataEventEntity({ entityId }) {
  const sparqlQuery = `${publicUrl}/public/sparql/event.sparql`;

  const query = `query?uri=${entityId}&format=json&frame=ranked_event_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;

  return fetchData(url);
}
