import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { checkPayment, validSignature, receiptHtml, receiptImageUrl } from '../server/services.js'
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
test('receipt escapes user input and shows a short order identifier',()=>{
 const html=receiptHtml({id:'735eb97d-19d1-4f2c-8cf5-21aa05764305',mode:'test',total_kobo:10000,delivery:{name:'<script>alert(1)</script>',address:'Home',phone:'123'}},[{name:'Shoe',size:40,quantity:1,unit_price_kobo:10000}],'ref');
 assert.ok(!html.includes('no money charged'));
 assert.match(html,/<h1[^>]*>Thanks for your order!<\/h1>/);
 assert.ok(html.includes('Order #735EB97D'));
 assert.ok(!html.includes('735eb97d-19d1-4f2c-8cf5-21aa05764305'));
 assert.ok(!html.includes('<br>ref'));
 assert.ok(!html.includes('<script>'));
 assert.ok(html.includes('&lt;script&gt;'));
});

test('receipt images use public HTTPS URLs and retain escaped product descriptions',()=>{
 assert.equal(receiptImageUrl('samba-green','https://shop.example.com'), 'https://shop.example.com/products/samba-green.png');
 assert.equal(receiptImageUrl('samba-green','http://localhost:5173'),null);
 assert.equal(receiptImageUrl('javascript:alert(1)',undefined),null);
 const html=receiptHtml({id:'order',mode:'test',total_kobo:100,delivery:{}},[{name:'Shoe <red>',size:42,quantity:1,unit_price_kobo:100,image:'https://shop.example.com/shoe.png'}],'ref');
 assert.match(html,/<img src="https:\/\/shop.example.com\/shoe.png"/);
 assert.match(html,/alt="Shoe &lt;red&gt;"/);
 assert.match(html,/EU 42 × 1/);
});
