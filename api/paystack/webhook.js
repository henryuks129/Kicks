import { admin, required, validSignature, verify, result, sendPending } from '../../server/services.js'
export const config={api:{bodyParser:false}};
export default async function handler(req,res) {
 if(req.method!=='POST') return res.status(405).end();
 try {
  const chunks=[]; let size=0;
  for await(const chunk of req) { size+=chunk.length; if(size>1048576) return res.status(413).end(); chunks.push(Buffer.from(chunk)) }
  const raw=Buffer.concat(chunks);
  if(!validSignature(raw,req.headers['x-paystack-signature'],required('PAYSTACK_SECRET_KEY'))) return res.status(401).end();
  const event=JSON.parse(raw.toString());
  if(event.event==='charge.success') {
   const db=admin(), id=await verify(db,event.data.reference);
   const order=result(await db.from('orders').select('user_id').eq('id',id).single());
   const user=result(await db.auth.admin.getUserById(order.user_id)).user;
   await sendPending(db,user);
  }
  return res.status(200).json({received:true});
 } catch { return res.status(500).json({error:'Webhook processing failed'}) }
}
