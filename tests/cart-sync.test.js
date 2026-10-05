import test from 'node:test'
import assert from 'node:assert/strict'
import { subscribeCart } from '../shared/cart-sync.js'

function setup(refresh) {
 const events = new EventTarget(), documentTarget = new EventTarget(); documentTarget.visibilityState = 'visible';
 const callbacks = {}, reports = []; let removed = false;
 const channel = { on(type, filter, callback) { assert.equal(type, 'broadcast'); assert.equal(filter.event, 'changed'); callbacks.change = callback; return this; }, subscribe(callback) { callbacks.status = callback; return this; } };
 const client = { channel(name, config) { assert.equal(name, 'cart:customer-a'); assert.equal(config.config.private, true); return channel; }, removeChannel(value) { assert.equal(value, channel); removed = true; } };
 const stop = subscribeCart({ client, userId: 'customer-a', refresh, report: value => reports.push(value), target: events, documentTarget });
 return { callbacks, reports, stop, events, documentTarget, removed: () => removed };
}
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
test('live cart refreshes on join, remote change, foreground and reconnect', async () => {
 let count = 0; const state = setup(async () => { count++; });
 state.callbacks.status('SUBSCRIBED'); await tick();
 state.callbacks.change(); await tick();
 state.events.dispatchEvent(new Event('online')); await tick();
 state.documentTarget.dispatchEvent(new Event('visibilitychange')); await tick();
 assert.equal(count, 4); state.stop(); assert.ok(state.removed());
 state.callbacks.change(); state.events.dispatchEvent(new Event('online')); await tick(); assert.equal(count, 4);
});
test('changes during a fetch trigger another fetch and cleanup invalidates in-flight work', async () => {
 let resolve, count = 0, current;
 const state = setup(async isCurrent => { current = isCurrent; count++; if (count === 1) await new Promise(done => { resolve = done; }); });
 state.callbacks.change(); state.callbacks.change(); state.callbacks.change(); assert.equal(count, 1);
 resolve(); await tick(); assert.equal(count, 2); assert.ok(current());
 state.stop(); assert.equal(current(), false);
});
test('sync failures are reported without unhandled rejections', async () => {
 const state = setup(async () => { throw new Error('network'); });
 state.callbacks.change(); await tick(); assert.equal(state.reports.length, 1);
 state.callbacks.status('CHANNEL_ERROR'); assert.equal(state.reports.length, 2); state.stop();
});
