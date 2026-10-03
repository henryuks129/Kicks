import test from 'node:test'
import assert from 'node:assert/strict'
import { retryAt, providerDelivery, submissionResult } from '../server/email-delivery.js'
import { cronAuthorized, runEmailWorker } from '../server/email-worker.js'
import workerHandler from '../api/emails/worker.js'

test('retry backoff increases and respects provider Retry-After',()=>{
 const now=Date.parse('2026-10-02T12:00:00Z');
 assert.equal(retryAt(1,now),'2026-10-02T12:01:00.000Z');
 assert.equal(retryAt(3,now),'2026-10-02T12:04:00.000Z');
 assert.equal(retryAt(1,now,'3600'),'2026-10-02T13:00:00.000Z');
});
test('cron handler rejects missing or incorrect authorization before accessing the database',async()=>{
 assert.equal(cronAuthorized(undefined,'test-only'),false);assert.equal(cronAuthorized('Bearer wrong','test-only'),false);assert.equal(cronAuthorized('Bearer test-only','test-only'),true);
 const result={setHeader(){},status(value){this.code=value;return this},json(value){this.body=value;return this}};
 await workerHandler({method:'GET',headers:{}},result);assert.equal(result.code,401);
 await workerHandler({method:'POST',headers:{}},result);assert.equal(result.code,405);
});
test('malformed acknowledgment preserves the provider ID for reconciliation',async()=>{
 const result=await submissionResult(new Response('invalid-json',{status:202,headers:{'x-message-id':'message-id'}}));
 assert.deepEqual(result,{messageId:'message-id',deliveryStatus:'uncertain'});
});
test('delivery lookup matches the stored message and never treats queued as delivered',async()=>{
 const event={provider_message_id:'wanted',submitted_at:'2026-10-02T12:00:00Z'};
 for(const status of ['queued','sent','delivered','rejected']) {
  const value=await providerDelivery(event,{key:'test-only',domainId:'domain',now:Date.parse('2026-10-02T13:00:00Z'),fetcher:async(url,options)=>{
   const query=new URL(url);assert.equal(query.searchParams.get('message_id'),'wanted');assert.equal(query.searchParams.get('domain_id'),'domain');assert.equal(options.headers.Authorization,'Bearer test-only');
   return {ok:true,json:async()=>({data:[{message_id:'unrelated',status:'delivered'},{message_id:'wanted',status}]})};
  }});assert.equal(value,status);
 }
 await assert.rejects(providerDelivery(event,{key:'test-only',domainId:'domain',fetcher:async()=>({ok:false})}));
 assert.equal(await providerDelivery({},{}),null);
});
test('worker reclaims only preparation interrupted before submission and respects its execution deadline',async()=>{
 const calls=[];
 const db={from(){const q={update(v){calls.push(['update',v]);return q},select(){return q},eq(...v){calls.push(['eq',...v]);return q},is(...v){calls.push(['is',...v]);return q},not(...v){calls.push(['not',...v]);return q},lt(...v){calls.push(['lt',...v]);return q},lte(){return q},in(){return q},order(){return q},limit(){return q},or(){return q},then(resolve){resolve({data:[]})}};return q}};
 const outcome=await runEmailWorker(db,{now:Date.parse('2026-10-02T12:00:00Z'),deadline:0});
 assert.equal(outcome.processed,0);assert.ok(calls.some(row=>row[0]==='is'&&row[1]==='submitted_at'&&row[2]===null));
 assert.ok(calls.some(row=>row[0]==='not'&&row[1]==='claimed_at'));
});
