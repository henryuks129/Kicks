import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const required = name => { const value=process.env[name]; if(!value) throw new Error(`Missing server configuration: ${name}`); return value }
export const admin = () => createClient(required('SUPABASE_URL'),required('SUPABASE_SECRET_KEY'),{auth:{persistSession:false,autoRefreshToken:false}})
export function result({data,error}) { if(error) throw new Error(error.message); return data }
export async function userFor(req,db) {
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
 if(!token) throw new Error('Sign in required');
 const {data,error}=await db.auth.getUser(token);
 if(error||!data.user) throw new Error('Sign in required');
 return data.user;
}
export async function paystack(path,body) {
 const key=required('PAYSTACK_SECRET_KEY');
 if(!key.startsWith('sk_test_')) throw new Error('This deployment requires a Paystack test key');
 const response=await fetch(`https://api.paystack.co/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
 const payload=await response.json();
 if(!response.ok||!payload.status) throw new Error('Paystack request failed');
 return payload.data;
}
export function validSignature(raw,signature,key) {
 if(typeof signature!=='string'||!/^[a-f0-9]{128}$/i.test(signature)) return false;
 return timingSafeEqual(Buffer.from(signature,'hex'),createHmac('sha512',key).update(raw).digest());
}
export function checkPayment(payment,expected) {
 if(payment.status!=='success'||payment.reference!==expected.reference||payment.amount!==Number(expected.amount_kobo)||payment.currency!=='NGN'||payment.domain!==expected.mode) throw new Error('Payment is not verified or does not match the order');
}
export async function verify(db,reference) {
 const expected=result(await db.from('payments').select('*').eq('reference',reference).single());
 const payment=await paystack(`transaction/verify/${encodeURIComponent(reference)}`);
 checkPayment(payment,expected);
 return result(await db.rpc('complete_payment',{payment_reference:reference,verified_amount:payment.amount,verified_currency:payment.currency,verified_mode:payment.domain,provider:String(payment.id)}));
}
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(value/100);
export function receiptHtml(order,items,reference) {
 const rows=items.map(item=>`<tr><td>${escapeHtml(item.name)} / EU ${escapeHtml(item.size)} × ${item.quantity}</td><td>${money(item.unit_price_kobo*item.quantity)}</td></tr>`).join('');
 return `<div style="background:#f4f0e8;padding:24px;font-family:Arial,sans-serif;color:#222"><div style="max-width:560px;margin:auto;background:white;padding:32px;border-top:8px solid #bd4f2b"><h1 style="font-style:italic">kicks.</h1><p>${order.mode==='live'?'Order receipt':order.mode==='demo'?'Simulated order — no money charged':'Test order — no money charged'}</p><p>Order ${escapeHtml(order.id)}<br>${escapeHtml(reference)}</p><table style="width:100%">${rows}</table><h2>Total: ${money(order.total_kobo)}</h2><p>${escapeHtml(order.delivery.name)}<br>${escapeHtml(order.delivery.address)}<br>${escapeHtml(order.delivery.phone)}</p><p>Thanks for shopping with Kicks.</p></div></div>`;
}
export async function sendPending(db,user) {
 const events=result(await db.from('email_events').select('*').eq('user_id',user.id).in('status',['pending','failed']).lt('attempts',5));
 for(const event of events) {
  const claimed=result(await db.from('email_events').update({status:'sending',attempts:event.attempts+1}).eq('id',event.id).eq('status',event.status).eq('attempts',event.attempts).select('id'));
  if(!claimed.length) continue;
  try {
   let html='<h1>Welcome to Kicks</h1><p>Your next rotation starts here. Your account is ready.</p>', subject='Welcome to Kicks', recipient=user.email;
   if(event.kind==='receipt') {
    const order=result(await db.from('orders').select('*,order_items(*),payments(reference)').eq('id',event.order_id).single());
    if(order.status!=='paid') throw new Error('Order is not paid');
    html=receiptHtml(order,order.order_items,order.payments?.reference||order.payments?.[0]?.reference||order.id); subject=`Kicks ${order.mode} order receipt`; recipient=order.delivery.email;
   }
   const base=required('MAILGUN_API_BASE_URL');
   if(!['https://api.mailgun.net','https://api.eu.mailgun.net'].includes(base)) throw new Error('Invalid Mailgun region');
   const response=await fetch(`${base}/v3/${encodeURIComponent(required('MAILGUN_DOMAIN'))}/messages`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`api:${required('MAILGUN_API_KEY')}`).toString('base64')}`},body:new URLSearchParams({from:required('MAILGUN_FROM_EMAIL'),to:recipient,subject,html,'h:Message-Id':`<${event.id}@${required('MAILGUN_DOMAIN')}>`}),signal:AbortSignal.timeout(15000)});
   if(!response.ok) { const error=new Error('Mailgun rejected message'); error.definite=true; throw error }
   result(await db.from('email_events').update({status:'sent',sent_at:new Date().toISOString(),last_error:null}).eq('id',event.id));
  } catch(error) {
   // Ambiguous network outcomes stay claimed to avoid sending a duplicate automatically.
   result(await db.from('email_events').update({status:error.definite?'failed':'sending',last_error:error.definite?'Provider rejected email; retry available':'Delivery uncertain or configuration error; inspect before retry'}).eq('id',event.id));
  }
 }
}
