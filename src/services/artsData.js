const baseUrl = process.env.REACT_APP_ARTS_DATA_URI;

// Helper function to make a GET request using fetch
export async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }
  return response.json();
}

// Function to get Arts Data Entities
export async function getArtsDataEntities({ searchKeyword, entityType }) {
  const query = `recon?query=${searchKeyword}&type=schema:${entityType}`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}

// Function to load Arts Data Entity
export async function loadArtsDataEntity({ entityId }) {
  const query = `query?adid=${entityId}&format=json&frame=ranked_org_person_footlight&sparql=ranked_org_person_footlight`;
  const url = `${baseUrl}/${query}`;
  return fetchData(url);
}
