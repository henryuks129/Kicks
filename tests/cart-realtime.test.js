import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
test('cart trigger broadcasts insert, quantity update and deletion privately to the owner only', async () => {
 const db = new PGlite();
 const a = '00000000-0000-0000-0000-000000000001', b = '00000000-0000-0000-0000-000000000002';
 try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
   create schema auth; create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
   create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   create schema realtime; create table realtime.messages(topic text, extension text, payload jsonb, event text, private boolean);
   alter table realtime.messages enable row level security;
   create function realtime.topic() returns text language sql as $$select current_setting('realtime.topic',true)$$;
   create function realtime.send(payload jsonb,event text,topic text,private boolean) returns void language sql as $$insert into realtime.messages values(topic,'broadcast',payload,event,private)$$;
   grant usage on schema public,auth,realtime to authenticated;
   grant select on realtime.messages to authenticated;`);
  for (const file of ['202610010001_commerce.sql', '202610010002_demo_catalog.sql', '202610030001_cart_realtime.sql']) await db.exec(await readFile(new URL('../supabase/migrations/' + file, import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/202610030001_cart_realtime.sql', import.meta.url), 'utf8'));
  await db.query('insert into auth.users(id) values($1),($2)', [a, b]);
  const variant = (await db.query('select id from product_variants limit 1')).rows[0].id;
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${a}'; set realtime.topic='cart:${a}';`);
  await db.query('insert into cart_items(user_id,variant_id,quantity) values($1,$2,1)', [a, variant]);
  await db.query('update cart_items set quantity=2 where user_id=$1', [a]);
  await db.query('delete from cart_items where user_id=$1', [a]);
  const signals = (await db.query('select * from realtime.messages')).rows;
  assert.equal(signals.length, 3);
  assert.ok(signals.every(row => row.topic === `cart:${a}` && row.event === 'changed' && row.private && Object.keys(row.payload).length === 0));
  await db.exec(`set request.jwt.claim.sub='${b}'; set realtime.topic='cart:${a}';`);
  assert.equal((await db.query('select * from realtime.messages')).rows.length, 0);
  await assert.rejects(db.query('select public.notify_cart_change()'));
 } finally { await db.close(); }
});
