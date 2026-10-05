import test from 'node:test';
import assert from 'node:assert/strict';
import { errorMessage, updateProfile } from '../shared/mobile-profile.js';

test('native profile save updates the existing owner row without requiring insert privileges', async () => {
 const calls = [];
 const query = { update(value) { calls.push(value); return this; }, eq(column, value) { calls.push([column, value]); return this; }, select() { return this; }, async maybeSingle() { return { data: { id: 'customer' }, error: null }; } };
 await updateProfile({ from(table) { assert.equal(table, 'profiles'); return query; } }, 'customer', { name: ' Name ', phone: ' Phone ', address: ' Address ' });
 assert.deepEqual(calls, [{ name: 'Name', phone: 'Phone', address: 'Address' }, ['id', 'customer']]);
 query.maybeSingle = async () => ({ data: null, error: null });
 await assert.rejects(updateProfile({ from: () => query }, 'customer', { name: '', phone: '', address: '' }), /profile is unavailable/);
});

test('plain database errors retain their message instead of becoming an unhelpful retry banner', () => {
 assert.equal(errorMessage({ message: 'Permission denied for profiles' }), 'Permission denied for profiles');
 assert.match(errorMessage(null), /connection/);
});
