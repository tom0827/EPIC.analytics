import { EaoAnalyticsPayload } from '../types';

export async function trackLogin(
  apiUrl: string,
  accessToken: string,
  payload: EaoAnalyticsPayload
): Promise<void> {
  if (!apiUrl) throw new Error('EPIC.centre API URL is required');
  if (!accessToken) throw new Error('Access token is required');

  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const response = await fetch(`${baseUrl}/api/eao-analytics`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error(
      `EAO Analytics recording failed: ${response.status} ${response.statusText}`
    );
  }
}
