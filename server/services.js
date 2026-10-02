import { receiptImages, productImage } from './receipt-images.js'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'node:crypto'

export function publicError(message,status=503) { const error=new Error(message);error.status=status;error.public=true;return error }
export const required = name => { const value=process.env[name]; if(!value) throw publicError(`Missing server configuration: ${name}. Set it on the server and restart or redeploy.`); return value }
export const admin = () => {
 const url=required('VITE_SUPABASE_URL');
 const key=required('SUPABASE_SECRET_KEY');
 try { return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}) }
 catch { throw publicError('Server Supabase configuration is invalid. Check VITE_SUPABASE_URL and SUPABASE_SECRET_KEY, then restart or redeploy.') }
}
export function result({data,error}) {
 if(error) {
  if(['PGRST301','PGRST302','PGRST303','42501'].includes(error.code)||error.message==='Invalid API key')throw publicError('Server Supabase access was rejected. Use the server secret key for the same project as the storefront.');
  if(['PGRST202','PGRST205','42P01','42883'].includes(error.code))throw publicError('The commerce database is not ready. Apply the Kicks Supabase migrations to the server project.');
  if(['Complete your delivery details','An item is unavailable','Your bag is empty'].includes(error.message))throw publicError(error.message,400);
  throw new Error(error.message);
 }
 return data;
}
export async function userFor(req,db) {
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
 const unauthorized=()=>{const error=new Error('Your session could not be verified. Sign out and sign in again. If this persists, check the server Supabase configuration.');error.status=401;error.public=true;return error};
 if(!token||token==='undefined') throw unauthorized();
 const {data,error}=await db.auth.getUser(token);
 if(error||!data.user) throw unauthorized();
 return data.user;
}
export async function paystack(path,body) {
 const key=required('PAYSTACK_SECRET_KEY');
 if(!key.startsWith('sk_test_')) throw publicError('This checkout requires PAYSTACK_SECRET_KEY to be a Paystack test secret key.');
 const response=await fetch(`https://api.paystack.co/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
 const payload=await response.json();
 if(!response.ok||!payload.status) throw publicError(response.status===401||response.status===403?'Paystack rejected server authentication. Check the test secret key and Paystack access settings.':'Paystack could not start or verify the transaction. Please try again later.',502);
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
export async function orderSummary(db,user,reference) {
 if(typeof reference!=='string'||!/^[0-9a-f-]{36}$/i.test(reference))throw publicError('This payment link is incomplete.',400);
 const payment=result(await db.from('payments').select('*,orders!inner(*,order_items(*))').eq('reference',reference).single());
 if(payment.orders.user_id!==user.id)throw publicError('This order belongs to a different account.',403);
 const order=payment.orders;
 let receiptStatus='unavailable';
 try {const receipt=result(await db.from('email_events').select('status').eq('user_id',user.id).eq('order_id',order.id).eq('kind','receipt').maybeSingle());receiptStatus=receipt?.status||'not_queued'}catch{}
 return {id:order.id,status:order.status,mode:order.mode,total:order.total_kobo,delivery:order.delivery,items:order.order_items,receiptStatus};
}
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(value/100);
export function welcomeHtml(user) {
 const firstName=String(user.user_metadata?.given_name||user.user_metadata?.name||user.user_metadata?.full_name||'').trim().split(/\s+/)[0]||'there';
 return `<div style="background:#f4f0e8;padding:24px;font-family:Arial,sans-serif;color:#222"><div style="max-width:560px;margin:auto;background:white;padding:32px;border-top:8px solid #bd4f2b"><h1 style="font-style:italic">kicks.</h1><p>Hi ${escapeHtml(firstName)},</p><h2>Your next rotation starts here.</h2><p>Welcome to Kicks. Your account is ready.</p><p>Browse the collection, save your favourite pairs to your bag, and choose your size when you’re ready.</p><p>We’ll email an order confirmation after your payment is verified.</p><p>A fresh pair. A different pace.</p></div></div>`;
}
export function signInHtml(user) {
 const firstName=String(user.user_metadata?.given_name||user.user_metadata?.name||user.user_metadata?.full_name||'').trim().split(/\s+/)[0]||'there';
 return `<div style="background:#f4f0e8;padding:24px;font-family:Arial,sans-serif;color:#222"><div style="max-width:560px;margin:auto;background:white;padding:32px;border-top:8px solid #bd4f2b"><h1 style="font-style:italic">kicks.</h1><p>Hi ${escapeHtml(firstName)},</p><h2>You’re signed in.</h2><p>Your Kicks account was just accessed with Google. You can view your details and purchase history in Account &amp; orders.</p><p>If this wasn’t you, secure your Google account.</p><p>A fresh pair. A different pace.</p></div></div>`;
}
export function receiptImageUrl(image, origin=process.env.RECEIPT_IMAGE_BASE_URL||process.env.VITE_APP_URL) {
 if(typeof image!=='string'||!image.trim())return null;
 try {
  const path=/^https?:\/\//i.test(image)?image:image.startsWith('/')?image:`/products/${encodeURIComponent(image)}.png`;
  const url=new URL(path,origin);
  return url.protocol==='https:'?url.href:null;
 } catch {return null}
}
export function receiptHtml(order,items,reference,imageSources=new Map()) {
 const rows=items.map(item=>{
  const image=imageSources.get(productImage(item))||receiptImageUrl(productImage(item));
  return `<tr><td style="padding:12px 0">${image?`<img src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}" width="88" height="88" style="display:block;object-fit:contain;border-radius:8px"/>`:''}</td><td style="padding:12px 8px">${escapeHtml(item.name)} / EU ${escapeHtml(item.size)} × ${item.quantity}</td><td>${money(item.unit_price_kobo*item.quantity)}</td></tr>`;
 }).join('');
 return `<div style="background:#f4f0e8;padding:24px;font-family:Arial,sans-serif;color:#222"><div style="max-width:560px;margin:auto;background:white;padding:32px;border-top:8px solid #bd4f2b"><h1 style="font-style:italic">kicks.</h1><p>${order.mode==='live'?'Order receipt':order.mode==='demo'?'Simulated order — no money charged':'Test order — no money charged'}</p><p>Order ${escapeHtml(order.id)}<br>${escapeHtml(reference)}</p><table style="width:100%">${rows}</table><h2>Total: ${money(order.total_kobo)}</h2><p>${escapeHtml(order.delivery.name)}<br>${escapeHtml(order.delivery.address)}<br>${escapeHtml(order.delivery.phone)}</p><p>Thanks for shopping with Kicks.</p></div></div>`;
}
export async function sendPending(db,user) {
 const outcome={failed:0,uncertain:0,error:null,messageIds:[]};
 const events=result(await db.from('email_events').select('*').eq('user_id',user.id).in('status',['pending','failed']).lt('attempts',5));
 for(const event of events) {
  const claimed=result(await db.from('email_events').update({status:'sending',attempts:event.attempts+1}).eq('id',event.id).eq('status',event.status).eq('attempts',event.attempts).select('id'));
  if(!claimed.length) continue;
  let submitted=false;
  try {
   let attachments=[];
   let html=event.kind==='signin'?signInHtml(user):welcomeHtml(user), subject=event.kind==='signin'?'You’re signed in to Kicks':'Welcome to Kicks', recipient=user.email;
   if(event.kind==='receipt') {
    const order=result(await db.from('orders').select('*,order_items(*,product_variants(products(image))),payments(reference)').eq('id',event.order_id).single());
    if(order.status!=='paid') throw new Error('Order is not paid');
    const images=await receiptImages(order.order_items);attachments=images.attachments;
    html=receiptHtml(order,order.order_items,order.payments?.reference||order.payments?.[0]?.reference||order.id,images.sources); subject=`Kicks ${order.mode} order receipt`; recipient=order.delivery.email;
   }
   const key=required('MAILERSEND_API_KEY'),fromEmail=required('MAILERSEND_FROM_EMAIL'),fromName=required('MAILERSEND_FROM_NAME'),replyTo=required('MAILERSEND_REPLY_TO_EMAIL');
   submitted=true;
   const response=await fetch('https://api.mailersend.com/v1/email',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from:{email:fromEmail,name:fromName},to:[{email:recipient}],reply_to:{email:replyTo},subject,html,...(attachments.length?{attachments}:{})}),signal:AbortSignal.timeout(15000)});
   if(!response.ok) { const message=response.status===401?'MailerSend rejected the API token. Check MAILERSEND_API_KEY.':response.status===403?'MailerSend denied sending access. Check the token permissions and sender configuration.':response.status===422?'MailerSend rejected the sender or message fields. Check MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME, MAILERSEND_REPLY_TO_EMAIL, and the recipient.':response.status===429?'MailerSend rate limit reached. Retry after the provider limit resets.':'MailerSend rejected the email. Check the sender and message configuration.'; const error=publicError(message); error.definite=true; throw error }
   const messageId=response.headers?.get?.('x-message-id');if(messageId)outcome.messageIds.push(messageId);
   result(await db.from('email_events').update({status:'sent',sent_at:new Date().toISOString(),last_error:null}).eq('id',event.id));
  } catch(error) {
   // Ambiguous network outcomes stay claimed to avoid sending a duplicate automatically.
   const retryable=!submitted||error.definite;
   if(retryable)outcome.failed++;else outcome.uncertain++;
   outcome.error=error.public?error.message:retryable?'Email preparation failed. Check the server email configuration.':'Email delivery is uncertain. Check MailerSend Activity before retrying.';
   result(await db.from('email_events').update({status:retryable?'failed':'sending',last_error:retryable?'Email preparation or provider rejection; retry available':'Delivery uncertain; inspect provider logs before retry'}).eq('id',event.id));
  }
 }
 return outcome;
}
// Payment success must not depend on the email queue being available.
export async function sendAfterPayment(db,user) {
 try { return await sendPending(db,user) } catch { console.error('Receipt queue processing failed; payment remains confirmed'); return {messageIds:[]} }
}
