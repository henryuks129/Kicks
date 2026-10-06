import test from 'node:test'
import assert from 'node:assert/strict'
import { paymentCallbackUrl, mobilePaymentReturnUrl } from '../shared/payment-return.js'

test('mobile checkout uses a hosted callback with a fixed app destination', () => {
 const callback = new URL(paymentCallbackUrl('https://shop.example/', 'mobile'));
 assert.equal(callback.origin, 'https://shop.example');
 assert.equal(callback.pathname, '/payment/callback');
 assert.deepEqual([...callback.searchParams], [['platform', 'mobile']]);
 const app = new URL(mobilePaymentReturnUrl);
 assert.equal(app.protocol, 'com.kicks.shop:');
 assert.equal(app.hostname, 'checkout');
 assert.deepEqual([...app.searchParams], [['paymentReturn', '1']]);
});

test('website callbacks stay on the configured store and reject arbitrary redirect destinations', () => {
 for (const platform of [undefined, 'web', 'https://attacker.example', { url: 'https://attacker.example' }]) {
  assert.equal(paymentCallbackUrl('https://shop.example', platform), 'https://shop.example/payment/callback');
 }
});
