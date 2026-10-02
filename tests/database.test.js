import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
test('migrations, customer isolation, server authority and payment idempotency',async()=>{
 const db=new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,public to anon,authenticated,service_role;
 grant execute on function auth.uid() to authenticated;`);
 for(const file of ['202610010001_commerce.sql','202610010002_demo_catalog.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
 const catalog=await readFile(new URL('../supabase/migrations/202610020002_reference_catalog.sql',import.meta.url),'utf8');
 await db.exec(await readFile(new URL('../supabase/migrations/202610020001_signin_email.sql',import.meta.url),'utf8'));
 await db.exec(catalog);
 assert.equal((await db.query('select count(*)::integer as count from products')).rows[0].count,12);
 assert.equal((await db.query("select count(*)::integer as count from product_variants where product_id='koi-loafer'")).rows[0].count,7);
 await db.query("update product_variants set stock=3 where product_id='koi-loafer' and size=42");
 await db.exec(catalog);
 assert.equal((await db.query('select count(*)::integer as count from products')).rows[0].count,12);
 assert.equal((await db.query("select stock from product_variants where product_id='koi-loafer' and size=42")).rows[0].stock,3);
 const a='00000000-0000-0000-0000-000000000001',b='00000000-0000-0000-0000-000000000002';
 await db.query('insert into auth.users(id) values($1),($2)',[a,b]);
 assert.equal((await db.query('select * from public.email_events')).rows.length,2);
 const variant=(await db.query('select id from product_variants limit 1')).rows[0].id;
 await db.exec(`set role authenticated; set request.jwt.claim.sub='${a}';`);
 assert.equal((await db.query('select * from profiles')).rows.length,1);
 await db.query("update profiles set name='Shopper',phone='123456',address='Lagos' where id=$1",[a]);
 await db.query('insert into cart_items values($1,$2,1)',[a,variant]);
 await assert.rejects(db.query('insert into cart_items values($1,$2,1)',[b,variant]));
 await assert.rejects(db.query("update products set price_kobo=1"));
 await assert.rejects(db.query("select prepare_order($1,'test','buyer@example.com')",[a]));
 await db.exec('reset role; set role service_role;');
 const order=(await db.query("select prepare_order($1,'test','buyer@example.com') as data",[a])).rows[0].data;
 await assert.rejects(db.query("select complete_payment($1,1,'NGN','test','p')",[order.reference]));
 for(let i=0;i<2;i++)await db.query("select complete_payment($1,$2,'NGN','test','p')",[order.reference,order.amount]);
 assert.equal((await db.query("select * from email_events where kind='receipt'")).rows.length,1);
 assert.equal((await db.query('select * from cart_items')).rows.length,0);
 await db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${b}';`);
 assert.equal((await db.query('select * from orders')).rows.length,0);
 assert.equal((await db.query('select * from payments')).rows.length,0);
 assert.equal((await db.query('select * from order_items')).rows.length,0);
 await assert.rejects(db.query("update orders set status='paid'"));
 await assert.rejects(db.query('select * from email_events'));
 await db.exec(`reset role;set role service_role;`);
 await db.query('insert into cart_items values($1,$2,1)',[a,variant]);
 const demo=(await db.query("select prepare_order($1,'demo','buyer@example.com') as data",[a])).rows[0].data;
 await db.query("select complete_payment($1,$2,'NGN','demo','simulated')",[demo.reference,demo.amount]);
 assert.equal((await db.query("select * from orders where mode='demo' and status='paid'")).rows.length,1);
 } finally { await db.close() }
});
