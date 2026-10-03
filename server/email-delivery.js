// A provider acknowledgment is distinct from delivery to the recipient's mail server.
export function retryAt(attempt, now=Date.now(), retryAfter=null) {
 const seconds=retryAfter===null?NaN:Number(retryAfter);
 const provider=Number.isFinite(seconds)?now+Math.max(0,seconds)*1000:Date.parse(retryAfter||'');
 return new Date(Math.max(now+Math.min(86400000,60000*2**Math.max(0,attempt-1)),Number.isFinite(provider)?provider:0)).toISOString();
}
export async function submissionResult(response) {
 const messageId=response.headers?.get?.('x-message-id')||null;
 let warnings=[];
 try {const body=await response.text?.()||'';warnings=body?JSON.parse(body).warnings||[]:[]}catch {return {messageId,deliveryStatus:'uncertain'}}
 const suppressed=warnings.some(w=>['ALL_SUPPRESSED','SOME_SUPPRESSED'].includes(w.type));
 return {messageId,deliveryStatus:suppressed?'rejected':response.headers?.get?.('x-send-paused')==='true'?'paused':messageId?'queued':'uncertain'};
}
export async function providerDelivery(event, {key,domainId,fetcher=fetch,now=Date.now()}) {
 if(!event.provider_message_id)return null;
 const params=new URLSearchParams({domain_id:domainId,message_id:event.provider_message_id,date_from:String(Math.max(Math.floor(new Date(event.submitted_at||event.sent_at||event.created_at).getTime()/1000)-60,Math.floor(now/1000)-86399)),date_to:String(Math.floor(now/1000)),limit:'10'});
 const response=await fetcher(`https://api.mailersend.com/v1/emails?${params}`,{headers:{Authorization:`Bearer ${key}`,Accept:'application/json'},signal:AbortSignal.timeout(5000)});
 if(!response.ok)throw new Error('Provider delivery lookup failed');
 const {data}=await response.json();
 const email=data?.find(row=>row.message_id===event.provider_message_id);
 return ['queued','sent','delivered','rejected'].includes(email?.status)?email.status:null;
}
