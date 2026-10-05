import test from 'node:test'
import assert from 'node:assert/strict'
import { createCommerceApi } from '../shared/commerce-api.js'
test('website and native API clients send the same action and authenticated session', async () => {
 const old = globalThis.fetch, calls = [];
 try {
  globalThis.fetch = async (url, request) => { calls.push({ url, ...request }); return { ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ orderId: 'order' }) }; };
  const client = { auth: { getSession: async () => ({ data: { session: { access_token: 'test-access-token' } } }) } };
  for (const endpoint of ['/api/commerce', 'https://example.com/api/commerce']) assert.equal((await createCommerceApi(client, endpoint)('demo')).orderId, 'order');
  assert.equal(calls[0].body, calls[1].body); assert.equal(calls[1].headers.Authorization, 'Bearer test-access-token');
  assert.deepEqual(JSON.parse(calls[1].body), { action: 'demo' });
  await assert.rejects(createCommerceApi({ auth: { getSession: async () => ({ data: { session: null } }) } }, '/api/commerce')('checkout'), /session has expired/);
  assert.equal(calls.length, 2);
 } finally { globalThis.fetch = old; }
});
