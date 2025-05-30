// services using native fetch API

import Cookies from 'js-cookie';

export async function fetchEntityReport({ calendarId, startDate, endDate, entity }) {
  const baseUrl = process.env.REACT_APP_API_URL;

  const accessToken = Cookies.get('accessToken');
  const url = `${baseUrl}/entities/generate-report?entity=${entity}&start-date=${startDate}&end-date=${endDate}`;

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

      return await fetchEntityReport({ calendarId, startDate, endDate, entity });
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
  const baseUrl = process.env.REACT_APP_API_URL;

  const accessToken = Cookies.get('accessToken');
  const url = `${baseUrl}/export/raw-dump`;

  try {
    const response = await fetch(url, {
      method: 'GET',
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
