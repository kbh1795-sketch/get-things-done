import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const CONNECTOR_ID = '6a9af60572f775821ca82ea6';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const timeMin = body.timeMin;
    const timeMax = body.timeMax;

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&singleEvents=true&orderBy=startTime';
    if (timeMin) url += `&timeMin=${encodeURIComponent(timeMin)}`;
    if (timeMax) url += `&timeMax=${encodeURIComponent(timeMax)}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return Response.json({ error: err.error?.message || 'Google API error' }, { status: res.status });
    }
    const data = await res.json();
    return Response.json({ events: data.items || [] });
  } catch (error) {
    return Response.json({ error: error.message, notConnected: true }, { status: 401 });
  }
}