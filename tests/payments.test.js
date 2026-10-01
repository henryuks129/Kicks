import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { checkPayment, validSignature, receiptHtml } from '../server/services.js'
test('payment acceptance requires all verified fields',()=>{
 const expected={reference:'abc',amount_kobo:10000,mode:'test'};
 const valid={reference:'abc',amount:10000,domain:'test',status:'success',currency:'NGN'};
 assert.doesNotThrow(()=>checkPayment(valid,expected));
 for(const [key,value] of Object.entries({reference:'other',amount:1,domain:'live',status:'failed',currency:'USD'}))assert.throws(()=>checkPayment({...valid,[key]:value},expected));
});
test('webhooks require the exact signed payload',()=>{
 const raw=Buffer.from('{"event":"charge.success"}'),key='test-secret';
 const signature=createHmac('sha512',key).update(raw).digest('hex');
 assert.equal(validSignature(raw,signature,key),true);
 assert.equal(validSignature(Buffer.from('{}'),signature,key),false);
 assert.equal(validSignature(raw,'invalid',key),false);
});
test('receipt escapes user input and identifies test payments',()=>{
 const html=receiptHtml({id:'order',mode:'test',total_kobo:10000,delivery:{name:'<script>alert(1)</script>',address:'Home',phone:'123'}},[{name:'Shoe',size:40,quantity:1,unit_price_kobo:10000}],'ref');
 assert.ok(html.includes('Test order — no money charged'));
 assert.ok(!html.includes('<script>'));
 assert.ok(html.includes('&lt;script&gt;'));
});
