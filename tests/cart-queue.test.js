import test from 'node:test'
import assert from 'node:assert/strict'
import { createCartQueue } from '../src/lib/cart-queue.js'
const item={key:'variant',qty:1};
test('rapid quantity changes save in order without dropping clicks',async()=>{
 const queue=createCartQueue(),writes=[];let release;
 const blocked=new Promise(resolve=>{release=resolve});
 const persist=async qty=>{if(qty===2)await blocked;writes.push(qty)};
 queue.enqueue(item,2,persist,()=>assert.fail('unexpected rollback'));
 queue.enqueue({...item,qty:2},3,persist,()=>assert.fail('unexpected rollback'));
 await Promise.resolve();assert.deepEqual(writes,[]);
 release();await queue.flush();assert.deepEqual(writes,[2,3]);
});
test('failed latest save restores the last confirmed quantity',async()=>{
 const queue=createCartQueue();let restored;
 queue.enqueue(item,2,async()=>{},()=>{});
 queue.enqueue({...item,qty:2},3,async()=>{throw new Error('offline')},saved=>{restored=saved});
 await queue.flush();assert.equal(restored.qty,2);
});
test('an older failed save cannot overwrite a newer successful change',async()=>{
 const queue=createCartQueue();let rollbacks=0;
 queue.enqueue(item,2,async()=>{throw new Error('offline')},()=>{rollbacks++});
 queue.enqueue({...item,qty:2},3,async()=>{},()=>{rollbacks++});
 await queue.flush();assert.equal(rollbacks,0);
});
