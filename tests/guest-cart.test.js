import test from 'node:test'
import assert from 'node:assert/strict'
import { readGuestCart, mergeGuestCart, persistGuestCart } from '../src/lib/guest-cart.js'

const item = { id: 'shoe', key: 'variant', size: 43, qty: 2 }
const products = [{ id: 'shoe', variants: [{ id: 'variant', size: 43, stock: 5 }] }]

test('guest bag survives reload and ignores malformed storage', () => {
  assert.deepEqual(readGuestCart({ getItem: () => JSON.stringify([item]) }), [item])
  for (const value of ['broken', '{}', '[{"qty":-1}]']) {
    assert.deepEqual(readGuestCart({ getItem: () => value }), [])
  }
})

test('sign-in merge preserves quantities without duplicating on retry', () => {
  const saved = [{ ...item, qty: 3 }]
  const merged = mergeGuestCart([item], saved, products)
  assert.equal(merged[0].qty, 3)
  assert.deepEqual(mergeGuestCart([item], merged, products), merged)
  assert.equal(mergeGuestCart([{ ...item, qty: 9 }], saved, products)[0].qty, 5)
})

test('sign-in merge rejects unavailable or mismatched variants', () => {
  assert.deepEqual(mergeGuestCart([{ ...item, key: 'unknown' }], [], products), [])
  assert.deepEqual(mergeGuestCart([item], [], [{ id: 'shoe', variants: [{ id: 'variant', size: 43, stock: 0 }] }]), [])
})

 test('signed-in cart persists as a guest cart and merges without doubling quantities',()=>{
  const values=new Map();const storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)};
  const saved=[{...item,qty:3}];
  persistGuestCart(saved,storage);
  const guest=readGuestCart(storage);
  assert.deepEqual(guest,saved);
  assert.deepEqual(mergeGuestCart(guest,saved,products),saved);
  persistGuestCart([],storage);assert.deepEqual(readGuestCart(storage),[]);
 });
