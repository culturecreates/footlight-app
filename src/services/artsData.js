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
  const sparqlQuery =
    'https://gist.githubusercontent.com/dev-aravind/809b63b291fa7eadfb5a2bd97144d9ee/raw/9c919a5802394be8db2500624327a58da1166385/ranked_org_person_footlight.sparql';
  const query = `query?adid=${entityId}&format=json&frame=ranked_org_person_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}
export async function loadArtsDataPlaceEntity({ entityId }) {
  const sparqlQuery =
    'https://gist.githubusercontent.com/dev-aravind/f7b4b7cfc5eafddf9f7d67287bea6d9e/raw/762bef0d6ea27bed33f1df4ae7985e22f4449874/ranked_place_footlight.sparql';
  const query = `query?adid=${entityId}&format=json&frame=ranked_place_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}

export async function loadArtsDataEventEntity({ entityId }) {
  const sparqlQuery =
    'https://gist.githubusercontent.com/dev-aravind/da9311f07d419e3bde07d0b826c7480f/raw/febc219d26d9997b8c3210e07be6ce268960ad9f/ranked_event_footlight.sparql';

  const query = `query?adid=${entityId}&format=json&frame=ranked_event_footlight&sparql=${sparqlQuery}`;
  const url = `${baseUrl}/${query}`;

  return fetchData(url);
}
