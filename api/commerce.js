import { admin, result, userFor, paystack, verify, orderSummary, sendPending, sendAfterPayment } from '../server/services.js'
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try {
  const db=admin(), user=await userFor(req,db), body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(body.action==='emails') { const delivery=await sendPending(db,user); return delivery.error?res.status(503).json({error:delivery.error}):res.json({ok:true,messageIds:delivery.messageIds}) }
  if(body.action==='signin') {
   const token=req.headers.authorization.slice(7), {data:verified,error:claimError}=await db.auth.getClaims(token);
   const sessionId=verified?.claims?.session_id;
   if(claimError||typeof sessionId!=='string'||!sessionId) return res.status(401).json({error:'Your sign-in session could not be verified. Please sign in again.'});
   result(await db.from('email_events').upsert({dedupe_key:`signin:${sessionId}`,user_id:user.id,kind:'signin',status:'pending'},{onConflict:'dedupe_key',ignoreDuplicates:true}));
   const delivery=await sendPending(db,user); return delivery.error?res.status(503).json({error:delivery.error}):res.json({ok:true,messageIds:delivery.messageIds})
  }
  if(body.action==='order')return res.json({order:await orderSummary(db,user,body.reference)});
  if(body.action==='verify') {
   const payment=result(await db.from('payments').select('*,orders!inner(user_id)').eq('reference',body.reference).single());
   if(payment.orders.user_id!==user.id) return res.status(403).json({error:'Not your order'});
   const id=await verify(db,body.reference),delivery=await sendAfterPayment(db,user); return res.json({orderId:id,order:await orderSummary(db,user,body.reference),emailMessageIds:delivery.messageIds||[]});
  }
  if(!['checkout','demo'].includes(body.action)) return res.status(400).json({error:'Unknown action'});
  const demo=body.action==='demo';
  if(demo&&process.env.ENABLE_DEMO_PAYMENTS!=='true') return res.status(403).json({error:'Simulated checkout is disabled'});
  const order=result(await db.rpc('prepare_order',{customer:user.id,payment_mode:demo?'demo':'test',email:user.email}));
  if(demo) {
   result(await db.rpc('complete_payment',{payment_reference:order.reference,verified_amount:order.amount,verified_currency:'NGN',verified_mode:'demo',provider:'simulated'}));
   const delivery=await sendAfterPayment(db,user); return res.json({orderId:order.order_id,emailMessageIds:delivery.messageIds||[]});
  }
  const origin=process.env.VITE_APP_URL;
  let callback;try{callback=new URL(origin)}catch{const error=new Error('Set VITE_APP_URL to the storefront URL on the server, then restart or redeploy.');error.public=true;error.status=503;throw error}
  const local=req.localDevelopment===true&&callback.protocol==='http:'&&['localhost','127.0.0.1'].includes(callback.hostname);
  if(callback.protocol!=='https:'&&!local) {const error=new Error('VITE_APP_URL must use HTTPS on a deployed storefront.');error.public=true;error.status=503;throw error}
  const transaction=await paystack('transaction/initialize',{email:user.email,amount:order.amount,currency:'NGN',reference:order.reference,callback_url:`${origin.replace(/\/$/,'')}/payment/callback`});
  return res.json({url:transaction.authorization_url,reference:order.reference});
 } catch(error) { return res.status(error.status||400).json({error:error.public?error.message:'Unable to complete request. Check your details and server configuration.'}) }
}
