import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { money } from '../data/products'
import { api, supabase } from '../lib/commerce'
export function Checkout({items}) {
 const [profile,setProfile]=useState({name:'',phone:'',address:''}),[email,setEmail]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(!supabase){setError('Supabase is not configured.');return}supabase.auth.getUser().then(async({data,error})=>{if(error||!data.user){setError('Sign in again to continue.');return}setEmail(data.user.email);const response=await supabase.from('profiles').select('*').eq('id',data.user.id).single();if(response.error)setError(response.error.message);else setProfile(response.data)}).catch(()=>setError('Unable to load your account. Please try again.'))},[]);
 async function submit(event){
  event.preventDefault();setBusy(true);setError('');
  try{
   if(!items.length)throw new Error('Your bag is empty. Add a shoe and size before checkout.');
   if(!supabase)throw new Error('Supabase is not configured.');
   const {data:{user}}=await supabase.auth.getUser();
   if(!user)throw new Error('Sign in again to continue.');
   const saved=await supabase.from('profiles').update({name:profile.name.trim(),phone:profile.phone.trim(),address:profile.address.trim()}).eq('id',user.id);if(saved.error)throw saved.error;
   const result=await api('checkout');
   if(!result.url)throw new Error('Checkout did not return a payment link. Please try again.');
   window.location.assign(result.url);
  }catch(e){setError(e.message)}finally{setBusy(false)}
 }
 return <form onSubmit={submit} className="grid gap-4">
  {[['name','Full name','text'],['phone','Phone','tel'],['address','Delivery address','text']].map(([key,label,type])=><label key={key} className="grid gap-2">{label}<input required maxLength={key==='address'?500:120} type={type} value={profile[key]} onChange={e=>setProfile({...profile,[key]:e.target.value})} className="rounded border p-3"/></label>)}
  <p role="alert">{error}</p>
  {!items.length&&<p role="alert">Your bag is empty. Close checkout and add a shoe and size.</p>}
  <Button disabled={busy||!items.length||!email} type="submit" value="checkout">{busy?'Please wait…':`Paystack test checkout · ${money(items.reduce((sum,item)=>sum+item.price*item.qty,0))}`}</Button>
 </form>
}
