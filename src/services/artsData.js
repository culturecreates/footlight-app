const baseUrl = import.meta.env.VITE_APP_ARTS_DATA_URI;
const publicUrl = import.meta.env.VITE_APP_API_URL;

export async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }
  return response.json();
}

export async function getArtsDataEntities({ searchKeyword, entityType }) {
  const params = new URLSearchParams({
    query: searchKeyword,
    type: `schema:${entityType}`,
  });
  const url = `${baseUrl}/recon?${params.toString()}`;
  return fetchData(url);
}

function buildArtsDataEntityQuery({ entityId, frameQuery, sparqlQuery }) {
  const params = new URLSearchParams({
    uri: entityId,
    format: 'json',
    frame: frameQuery,
    sparql: sparqlQuery,
  });

  return `${baseUrl}/query?${params.toString()}`;
}

export async function loadArtsDataEntity({ entityId }) {
  const sparqlQuery = `${publicUrl}/public/sparql/org_person.sparql`;
  const frameQuery = `${publicUrl}/public/frame/org_person.jsonld`;
  const url = buildArtsDataEntityQuery({ entityId, frameQuery, sparqlQuery });
  return fetchData(url);
}
export async function loadArtsDataPlaceEntity({ entityId }) {
  const sparqlQuery = `${publicUrl}/public/sparql/place.sparql`;
  const frameQuery = `${publicUrl}/public/frame/place.jsonld`;
  const url = buildArtsDataEntityQuery({ entityId, frameQuery, sparqlQuery });
  return fetchData(url);
}

export async function loadArtsDataEventEntity({ entityId }) {
  const sparqlQuery = `${publicUrl}/public/sparql/event.sparql`;
  const frameQuery = `${publicUrl}/public/frame/event.jsonld`;
  const url = buildArtsDataEntityQuery({ entityId, frameQuery, sparqlQuery });

  return fetchData(url);
}
