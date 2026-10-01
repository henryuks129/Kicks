import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { money } from '../data/products'
import { api, supabase } from '../lib/commerce'
export function Checkout({items,onComplete}) {
 const [profile,setProfile]=useState({name:'',phone:'',address:''}),[email,setEmail]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState(null);
 useEffect(()=>{supabase.auth.getUser().then(async({data})=>{if(!data.user)return;setEmail(data.user.email);const response=await supabase.from('profiles').select('*').eq('id',data.user.id).single();if(response.error)setError(response.error.message);else setProfile(response.data)})},[]);
 async function submit(event){
  event.preventDefault();setBusy(true);setError('');
  try{
   const {data:{user}}=await supabase.auth.getUser();
   const saved=await supabase.from('profiles').update({name:profile.name.trim(),phone:profile.phone.trim(),address:profile.address.trim()}).eq('id',user.id);if(saved.error)throw saved.error;
   const result=await api(event.nativeEvent.submitter?.value==='demo'?'demo':'checkout');
   if(result.url)window.location.assign(result.url);else setReceipt(result.orderId);
  }catch(e){setError(e.message)}finally{setBusy(false)}
 }
 if(receipt)return <div className="space-y-4"><h2 className="text-2xl font-bold">Simulated order saved</h2><p>No money charged. Receipt email queued.</p><p className="break-all">{receipt}</p><Button onClick={onComplete}>Continue shopping</Button></div>;
 return <form onSubmit={submit} className="grid gap-4">
  {[['name','Full name','text'],['phone','Phone','tel'],['address','Delivery address','text']].map(([key,label,type])=><label key={key} className="grid gap-2">{label}<input required maxLength={key==='address'?500:120} type={type} value={profile[key]} onChange={e=>setProfile({...profile,[key]:e.target.value})} className="rounded border p-3"/></label>)}
  <p>Receipt email: {email}</p><p>Test checkout — no real money is charged.</p><p role="alert">{error}</p>
  <Button disabled={busy} type="submit" value="checkout">{busy?'Please wait…':`Paystack test checkout · ${money(items.reduce((sum,item)=>sum+item.price*item.qty,0))}`}</Button>
  <Button disabled={busy} type="submit" value="demo" variant="outline">Simulate order (when enabled)</Button>
 </form>
}
