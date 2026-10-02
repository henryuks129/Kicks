import test from 'node:test'
import assert from 'node:assert/strict'
import { sendPending, sendAfterPayment, welcomeHtml, receiptHtml } from '../server/services.js'

function queue(kind='welcome',order=null) {
 const updates=[];let status='pending',attempts=0;
 const db={from(table){
  let update;
  const query={
   select(){if(update){status=update.status;attempts=update.attempts;return Promise.resolve({data:[{id:'event'}]})}return query},
   eq(){return query},in(){return query},
   single(){assert.equal(table,'orders');return Promise.resolve({data:order})},
   lt(){return Promise.resolve({data:['pending','failed'].includes(status)?[{id:'event',kind,status,attempts}]:[]})},
   update(value){update=value;updates.push(value);return query},
   then(resolve,reject){if(update){status=update.status;attempts=update.attempts??attempts}return Promise.resolve({data:[]}).then(resolve,reject)},
  };
  return query;
 }};
 return {db,updates};
}
test('missing mail configuration remains retryable before submission',async()=>{
 const previous=process.env.MAILERSEND_API_KEY;
 delete process.env.MAILERSEND_API_KEY;
 try {
  const {db,updates}=queue();
  const delivery=await sendPending(db,{id:'customer',email:'buyer@example.com'});
  assert.equal(delivery.failed,1);
  assert.match(delivery.error,/MAILERSEND_API_KEY/);
  assert.equal(updates[0].status,'sending');
  assert.equal(updates.at(-1).status,'failed');
 } finally {
  if(previous===undefined)delete process.env.MAILERSEND_API_KEY;
  else process.env.MAILERSEND_API_KEY=previous;
 }
});
test('welcome email targets the new customer and is not resent after success',async()=>{
 const names=['MAILERSEND_API_KEY','MAILERSEND_FROM_EMAIL','MAILERSEND_FROM_NAME','MAILERSEND_REPLY_TO_EMAIL'];
 const previous=Object.fromEntries(names.map(name=>[name,process.env[name]])),originalFetch=globalThis.fetch;
 Object.assign(process.env,{MAILERSEND_API_KEY:'test-placeholder',MAILERSEND_FROM_EMAIL:'shop@example.com',MAILERSEND_FROM_NAME:'Kicks',MAILERSEND_REPLY_TO_EMAIL:'henry@example.com'});
 const deliveries=[];
 globalThis.fetch=async(url,request)=>{deliveries.push({url,request});return {ok:true,status:202,headers:new Headers({'x-message-id':'ms-message-123'})}};
 try {
  const {db}=queue(),customer={id:'new-customer',email:'new-shopper@example.com',user_metadata:{full_name:'Ayo Shopper'}};
  const first=await sendPending(db,customer),second=await sendPending(db,customer);
  assert.equal(deliveries.length,1);assert.equal(deliveries[0].url,'https://api.mailersend.com/v1/email');
  const payload=JSON.parse(deliveries[0].request.body);assert.deepEqual(payload.to,[{email:customer.email}]);
  assert.deepEqual(payload.from,{email:'shop@example.com',name:'Kicks'});
  assert.deepEqual(payload.reply_to,{email:'henry@example.com'});
  assert.equal(payload.subject,'Welcome to Kicks');assert.match(payload.html,/Hi Ayo/);
  assert.deepEqual(deliveries[0].request.headers.Authorization,'Bearer test-placeholder');
  assert.deepEqual(deliveries[0].request.headers['Content-Type'],'application/json');
  assert.deepEqual(first.messageIds,['ms-message-123']);assert.deepEqual(second.messageIds,[]);
  assert.ok(!welcomeHtml({user_metadata:{full_name:'<script>'}}).includes('<script>'));
 } finally {
  globalThis.fetch=originalFetch;
  for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name]}
 }
});
test('MailerSend authentication failures are reported without exposing credentials',async()=>{
 const names=['MAILERSEND_API_KEY','MAILERSEND_FROM_EMAIL','MAILERSEND_FROM_NAME','MAILERSEND_REPLY_TO_EMAIL'];
 const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 const originalFetch=globalThis.fetch;
 Object.assign(process.env,{MAILERSEND_API_KEY:'test-placeholder',MAILERSEND_FROM_EMAIL:'shop@example.com',MAILERSEND_FROM_NAME:'Kicks',MAILERSEND_REPLY_TO_EMAIL:'henry@example.com'});
 globalThis.fetch=async()=>({ok:false,status:401});
 try {
  const {db,updates}=queue();
  const delivery=await sendPending(db,{id:'customer',email:'buyer@example.com'});
  assert.match(delivery.error,/MailerSend rejected the API token/);
  assert.equal(delivery.failed,1);
  assert.equal(updates.at(-1).status,'failed');
  assert.ok(!delivery.error.includes('test-placeholder'));
 } finally {
  globalThis.fetch=originalFetch;
  for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name]}
 }
});
test('MailerSend sender validation errors are actionable and retryable',async()=>{
 const names=['MAILERSEND_API_KEY','MAILERSEND_FROM_EMAIL','MAILERSEND_FROM_NAME','MAILERSEND_REPLY_TO_EMAIL'];
 const previous=Object.fromEntries(names.map(name=>[name,process.env[name]])),originalFetch=globalThis.fetch;
 Object.assign(process.env,{MAILERSEND_API_KEY:'test-placeholder',MAILERSEND_FROM_EMAIL:'shop@example.com',MAILERSEND_FROM_NAME:'Kicks',MAILERSEND_REPLY_TO_EMAIL:'henry@example.com'});
 globalThis.fetch=async()=>({ok:false,status:422});
 try {
  const {db,updates}=queue();
  const delivery=await sendPending(db,{id:'customer',email:'buyer@example.com'});
  assert.match(delivery.error,/MAILERSEND_FROM_EMAIL/);
  assert.equal(delivery.failed,1);
  assert.equal(updates.at(-1).status,'failed');
 } finally {
  globalThis.fetch=originalFetch;
  for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name]}
 }
});
test('simulated order receipts stay clearly labelled',()=>{
 const html=receiptHtml({mode:'demo',id:'order',total_kobo:100,delivery:{name:'A',address:'B',phone:'C'}},[{name:'Shoe',size:42,quantity:1,unit_price_kobo:100}],'demo-ref');
 assert.match(html,/Simulated order — no money charged/);
});
test('email queue failure cannot undo payment confirmation',async()=>{
 await assert.doesNotReject(sendAfterPayment({from(){throw new Error('Database unavailable')}},{id:'customer'}));
});

test('local receipt sends embedded catalog thumbnails and is not duplicated',async()=>{
 const names=['MAILERSEND_API_KEY','MAILERSEND_FROM_EMAIL','MAILERSEND_FROM_NAME','MAILERSEND_REPLY_TO_EMAIL','VITE_APP_URL','RECEIPT_IMAGE_BASE_URL'];
 const previous=Object.fromEntries(names.map(name=>[name,process.env[name]])),originalFetch=globalThis.fetch;
 Object.assign(process.env,{MAILERSEND_API_KEY:'test-placeholder',MAILERSEND_FROM_EMAIL:'shop@example.com',MAILERSEND_FROM_NAME:'Kicks',MAILERSEND_REPLY_TO_EMAIL:'reply@example.com',VITE_APP_URL:'http://localhost:5173'});
 delete process.env.RECEIPT_IMAGE_BASE_URL;
 const deliveries=[];
 globalThis.fetch=async(url,request)=>{deliveries.push(JSON.parse(request.body));return {ok:true,status:202,headers:new Headers({'x-message-id':'receipt-123'})}};
 try {
  const item={name:'Samba',size:42,quantity:1,unit_price_kobo:100,product_variants:{products:{image:'samba-green'}}};
  const {db}=queue('receipt',{id:'order',status:'paid',mode:'demo',total_kobo:200,delivery:{email:'buyer@example.com'},payments:{reference:'ref'},order_items:[item,{...item,size:43}]});
  await sendPending(db,{id:'buyer',email:'buyer@example.com'});await sendPending(db,{id:'buyer',email:'buyer@example.com'});
  assert.equal(deliveries.length,1);
  const payload=deliveries[0];assert.equal(payload.attachments.length,1);
  const attachment=payload.attachments[0];assert.equal(attachment.disposition,'inline');
  assert.ok(payload.html.includes(`src="cid:${attachment.id}"`));
  assert.equal((payload.html.match(/src="cid:/g)||[]).length,2);
  assert.ok(!payload.html.includes('localhost'));
  const png=Buffer.from(attachment.content,'base64');assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.equal(png.readUInt32BE(16),176);assert.equal(png.readUInt32BE(20),176);
  assert.ok(png.length<100000);assert.deepEqual(payload.to,[{email:'buyer@example.com'}]);
 } finally {
  globalThis.fetch=originalFetch;
  for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name]}
 }
});
