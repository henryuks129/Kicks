import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { commerceDevApi } from '../server/dev-api.js'
import { admin, userFor, required, result } from '../server/services.js'
import { serverEnvNames } from '../server/dev-api.js'

test('server uses the same VITE_SUPABASE_URL as the browser',()=>{
 const previousUrl=process.env.VITE_SUPABASE_URL, previousKey=process.env.SUPABASE_SECRET_KEY;
 try {
  process.env.VITE_SUPABASE_URL='https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY='test-server-placeholder';
  assert.equal(admin().supabaseUrl,'https://example.supabase.co');
  assert.ok(serverEnvNames.includes('VITE_SUPABASE_URL'));
  assert.ok(!serverEnvNames.includes('SUPABASE_URL'));
  delete process.env.VITE_SUPABASE_URL;
  assert.throws(admin,error=>error.public&&error.message.includes('VITE_SUPABASE_URL'));
 } finally {
  if(previousUrl===undefined)delete process.env.VITE_SUPABASE_URL;else process.env.VITE_SUPABASE_URL=previousUrl;
  if(previousKey===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=previousKey;
 }
});

test('configuration and database failures expose safe actionable errors',()=>{
 assert.throws(()=>required('KICKS_TEST_MISSING_CONFIGURATION'),error=>error.public&&error.status===503&&error.message.includes('KICKS_TEST_MISSING_CONFIGURATION'));
 assert.throws(()=>result({error:{code:'42501',message:'sensitive internal details'}}),error=>error.public&&!error.message.includes('sensitive'));
 assert.throws(()=>result({error:{code:'PGRST202',message:'internal schema details'}}),error=>error.public&&error.message.includes('migrations'));
});

test('server authenticates the supplied access token, not browser identity',async()=>{
 const db={auth:{getUser:async token=>({data:{user:token==='valid'?{id:'customer'}:null},error:null})}};
 assert.deepEqual(await userFor({headers:{authorization:'Bearer valid'}},db),{id:'customer'});
 for(const authorization of [undefined,'Bearer undefined','Bearer expired']) {
  await assert.rejects(userFor({headers:{authorization}},db),error=>error.status===401);
 }
});

test('local API middleware serves real API responses instead of index HTML',async()=>{
 let middleware;
 commerceDevApi().configureServer({middlewares:{use(fn){middleware=fn}}});
 const server=createServer((req,res)=>middleware(req,res,()=>{res.statusCode=404;res.end()}));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const base=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(`${base}/api/commerce`);
  assert.equal(response.status,405);
  assert.equal((await response.json()).error,'Method not allowed');
  const invalid=await fetch(`${base}/api/commerce`,{method:'POST',body:'{'});
  assert.equal(invalid.status,400);
  assert.equal((await invalid.json()).error,'Invalid request');
 } finally {await new Promise(resolve=>server.close(resolve))}
});
