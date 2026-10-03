import { admin, required, result, sendPending } from './services.js'
import { providerDelivery } from './email-delivery.js'
import { timingSafeEqual } from 'node:crypto'

export function cronAuthorized(header, secret=process.env.CRON_SECRET) {
 if(!secret||typeof header!=='string')return false;
 const expected=Buffer.from(`Bearer ${secret}`),actual=Buffer.from(header);
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
export async function runEmailWorker(db=admin(), {now=Date.now(),deadline=Date.now()+40000}={}) {
 const outcome={processed:0,reconciled:0,failed:0,uncertain:0};
 const stamp=new Date(now).toISOString(),stale=new Date(now-15*60000).toISOString();
 // Only preparation interrupted BEFORE submission is safe to retry automatically.
 result(await db.from('email_events').update({status:'failed',next_attempt_at:stamp,last_error:'Interrupted before provider submission'}).eq('status','sending').is('submitted_at',null).not('claimed_at','is',null).lt('claimed_at',stale));
 const events=result(await db.from('email_events').select('*').in('status',['pending','failed']).lt('attempts',5).lte('next_attempt_at',stamp).order('created_at').limit(10));
 for(const event of events) {
  if(Date.now()>deadline)break;
  try {
   const {data,error}=await db.auth.admin.getUserById(event.user_id);
   if(error||!data?.user)throw new Error('Recipient account unavailable');
   const sent=await sendPending(db,data.user,{events:[event],now});
   outcome.processed++;outcome.failed+=sent.failed;outcome.uncertain+=sent.uncertain;
  } catch {outcome.failed++}
 }
 if(!process.env.MAILERSEND_DOMAIN_ID)return {...outcome,reconciliationConfigured:false};
 const waiting=result(await db.from('email_events').select('*').not('provider_message_id','is',null).in('delivery_status',['queued','sent','paused','uncertain']).or(`delivery_checked_at.is.null,delivery_checked_at.lt.${new Date(now-24*3600000).toISOString()}`).order('created_at').limit(10));
 const key=required('MAILERSEND_API_KEY'),domainId=process.env.MAILERSEND_DOMAIN_ID;
 for(const event of waiting) {
  if(Date.now()>deadline)break;
  try {
   const delivery=await providerDelivery(event,{key,domainId,now});
   result(await db.from('email_events').update({delivery_checked_at:stamp,...(delivery?{status:'sent',delivery_status:delivery,last_error:delivery==='rejected'?'Recipient rejected by provider':null}:{})}).eq('id',event.id));
   outcome.reconciled++;
  } catch {outcome.failed++}
 }
 return {...outcome,reconciliationConfigured:true};
}
