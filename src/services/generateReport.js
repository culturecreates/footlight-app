// services using native fetch API

import Cookies from 'js-cookie';

export async function fetchEntityReport({ calendarId, startDate, endDate, entity, taxonomyIds = [] }) {
  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const accessToken = Cookies.get('accessToken');

  const params = new URLSearchParams();
  params.append('start-date', startDate);
  params.append('end-date', endDate);
  taxonomyIds.forEach((id) => params.append('taxonomy-ids', id));

  const url = `${baseUrl}/entities/${entity}/report?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'calendar-id': calendarId,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'text/csv;charset=utf-8',
      },
    });

    if (response.status === 401) {
      const newAccessToken = await tryRefreshToken(baseUrl);
      if (!newAccessToken) throw new Error('Unauthorized');
      return await fetchEntityReport({ calendarId, startDate, endDate, entity, taxonomyIds });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

export async function downloadDB({ calendarId }) {
  const baseUrl = import.meta.env.VITE_APP_API_URL;

  const accessToken = Cookies.get('accessToken');
  const url = `${baseUrl}/calendars/${calendarId}/artifacts`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'calendar-id': calendarId,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      const newAccessToken = await tryRefreshToken(baseUrl);
      if (!newAccessToken) throw new Error('Unauthorized');

      return await downloadDB({ calendarId });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch entities failed:', error);
    throw error;
  }
}

export async function exportEntities({
  calendarId,
  entity,
  fileFormat = 'jsonld',
  upcomingEventsOnly = false,
  includeNestedEntities = true,
  dataModel = 'Artsdata',
  accessToken = null,
}) {
  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const token = accessToken || Cookies.get('accessToken');

  const params = new URLSearchParams();
  params.append('file-format', fileFormat);
  params.append('upcoming-events-only', upcomingEventsOnly);
  params.append('include-nested-entities', includeNestedEntities);
  params.append('data-model', dataModel);

  const url = `${baseUrl}/entities/${entity}/export?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'calendar-id': calendarId,
        Authorization: `Bearer ${token}`,
        Accept: 'application/ld+json',
      },
    });

    if (response.status === 401) {
      const newAccessToken = await tryRefreshToken(baseUrl);
      if (!newAccessToken) throw new Error('Unauthorized');
      return await exportEntities({
        calendarId,
        entity,
        fileFormat,
        upcomingEventsOnly,
        includeNestedEntities,
        dataModel,
        accessToken: newAccessToken,
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to export: ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

async function tryRefreshToken(baseUrl) {
  const refreshToken = Cookies.get('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${baseUrl}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    Cookies.set('accessToken', data.accessToken);
    return data.accessToken;
  } catch (e) {
    console.error('Refresh token failed:', e);
    return null;
  }
}
