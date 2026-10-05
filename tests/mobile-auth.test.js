import test from 'node:test'
import assert from 'node:assert/strict'
import { callbackCode, createLoginCompleter, NATIVE_AUTH_CALLBACK } from '../shared/native-auth.js'
test('native login accepts only the exact application callback with a code', () => {
 assert.equal(callbackCode(`${NATIVE_AUTH_CALLBACK}?code=test-code`), 'test-code');
 for (const url of ['https://example.com/auth/callback?code=x', 'com.kicks.shop://other/callback?code=x', 'com.kicks.shop://auth/wrong?code=x', NATIVE_AUTH_CALLBACK]) assert.equal(callbackCode(url), null);
 assert.throws(() => callbackCode(`${NATIVE_AUTH_CALLBACK}?error=access_denied`), /could not be completed/);
});
test('browser completion and router callback exchange a code only once', async () => {
 let exchanges = 0;
 const complete = createLoginCompleter(() => ({ auth: { exchangeCodeForSession: async () => { exchanges++; return { error: null }; } } }));
 await Promise.all([complete(`${NATIVE_AUTH_CALLBACK}?code=test-code`), complete(`${NATIVE_AUTH_CALLBACK}?code=test-code`)]);
 assert.equal(exchanges, 1);
 await complete('https://example.com/?code=test-code'); assert.equal(exchanges, 1);
});
test('a failed code does not poison subsequent fresh login attempts', async () => {
 const complete = createLoginCompleter(() => ({ auth: { exchangeCodeForSession: async code => ({ error: code === 'bad-code' ? new Error('expired') : null }) } }));
 await assert.rejects(complete(`${NATIVE_AUTH_CALLBACK}?code=bad-code`), /expired/);
 await complete(`${NATIVE_AUTH_CALLBACK}?code=fresh-code`);
});
