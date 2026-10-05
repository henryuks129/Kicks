export function createCommerceApi(client, endpoint) {
 return async function api(action, extra = {}) {
  if (!client) throw new Error('The store connection is not configured.');
  const { data, error } = await client.auth.getSession();
  if (error || !data.session?.access_token) throw new Error('Your session has expired. Sign out and sign in again.');
  const response = await fetch(endpoint, {
   method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
   body: JSON.stringify({ action, ...extra }),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Checkout API is unavailable. Please try again.');
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Unable to complete request.');
  return payload;
 };
}
