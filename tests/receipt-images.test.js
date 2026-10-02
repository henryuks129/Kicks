import test from 'node:test'
import assert from 'node:assert/strict'
import { receiptImages } from '../server/receipt-images.js'

test('receipt attachments ignore missing images and reject filesystem traversal',async()=>{
 const {attachments,sources}=await receiptImages([{image:'../../package'},{image:'https://example.com/shoe.png'},{image:'missing-shoe'},{image:'/products/samba-green.png'}]);
 assert.equal(attachments.length,1);
 assert.equal(sources.get('/products/samba-green.png'),`cid:${attachments[0].id}`);
 assert.ok(!sources.has('../../package'));
});
