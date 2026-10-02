import test from 'node:test'
import assert from 'node:assert/strict'
import { orderSummary } from '../server/services.js'
const reference='11111111-1111-4111-8111-111111111111';
function database(owner='buyer',emailError=false){return {from(table){const query={select(){return query},eq(){return query},single:async()=>({data:{orders:{id:'order',user_id:owner,status:'paid',mode:'test',total_kobo:23500000,delivery:{email:'buyer@example.com'},order_items:[]}}}),maybeSingle:async()=>emailError?{error:{message:'unavailable'}}:{data:{status:'failed'}}};return query}}}
test('order summary reports paid order independently from receipt failure',async()=>{
 const order=await orderSummary(database(),{id:'buyer'},reference);
 assert.equal(order.status,'paid');assert.equal(order.total,23500000);assert.equal(order.receiptStatus,'failed');
 assert.equal((await orderSummary(database('buyer',true),{id:'buyer'},reference)).receiptStatus,'unavailable');
});
test('order summary rejects another customer and invalid reference',async()=>{
 await assert.rejects(orderSummary(database('other'),{id:'buyer'},reference),error=>error.status===403);
 await assert.rejects(orderSummary(database(),{id:'buyer'},null),error=>error.status===400);
});
