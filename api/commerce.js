import { admin, result, userFor, paystack, verify, sendPending } from '../server/services.js'
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try {
  const db=admin(), user=await userFor(req,db), body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(body.action==='emails') { await sendPending(db,user); return res.json({ok:true}) }
  if(body.action==='verify') {
   const payment=result(await db.from('payments').select('*,orders!inner(user_id)').eq('reference',body.reference).single());
   if(payment.orders.user_id!==user.id) return res.status(403).json({error:'Not your order'});
   const id=await verify(db,body.reference); await sendPending(db,user); return res.json({orderId:id});
  }
  if(!['checkout','demo'].includes(body.action)) return res.status(400).json({error:'Unknown action'});
  const demo=body.action==='demo';
  if(demo&&process.env.ENABLE_DEMO_PAYMENTS!=='true') return res.status(403).json({error:'Simulated checkout is disabled'});
  const order=result(await db.rpc('prepare_order',{customer:user.id,payment_mode:demo?'demo':'test',email:user.email}));
  if(demo) {
   result(await db.rpc('complete_payment',{payment_reference:order.reference,verified_amount:order.amount,verified_currency:'NGN',verified_mode:'demo',provider:'simulated'}));
   await sendPending(db,user); return res.json({orderId:order.order_id});
  }
  const origin=process.env.VITE_APP_URL;
  if(!origin||!origin.startsWith('https://')) throw new Error('Configure the HTTPS app URL');
  const transaction=await paystack('transaction/initialize',{email:user.email,amount:order.amount,currency:'NGN',reference:order.reference,callback_url:`${origin.replace(/\/$/,'')}/payment/callback`});
  return res.json({url:transaction.authorization_url});
 } catch(error) { return res.status(400).json({error:error.message==='Sign in required'?error.message:'Unable to complete request. Check your details and server configuration.'}) }
}
