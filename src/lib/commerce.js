import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase=url&&key?createClient(url,key):null;
const unwrap=({data,error})=>{if(error)throw error;return data};
export async function api(action,extra={}) {
 const {data}=await supabase.auth.getSession();
 const response=await fetch('/api/commerce',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session?.access_token}`},body:JSON.stringify({action,...extra})});
 const payload=await response.json();if(!response.ok)throw new Error(payload.error);return payload;
}
export function useCommerce() {
 const [products,setProducts]=useState([]),[cart,setCart]=useState([]),[user,setUser]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function refreshCart(){
  const {data}=await supabase.auth.getUser();if(!data.user){setCart([]);return}
  const rows=unwrap(await supabase.from('cart_items').select('*,product_variants(product_id,size)').eq('user_id',data.user.id));
  setCart(rows.map(r=>({id:r.product_variants.product_id,size:r.product_variants.size,key:r.variant_id,qty:r.quantity})));
 }
 useEffect(()=>{
  if(!supabase){setError('Store connection is not configured.');return}
  let active=true;
  supabase.from('products').select('*,product_variants(*)').then(response=>{try{const rows=unwrap(response);if(active)setProducts(rows.map(p=>({...p,price:p.price_kobo/100,sizes:p.product_variants.filter(v=>v.stock>0).map(v=>v.size),variants:p.product_variants})))}catch(e){if(active)setError(e.message)}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(active){setUser(session?.user||null);setCart([])}});
  return()=>{active=false;subscription.unsubscribe()};
 },[]);
 useEffect(()=>{if(!user)return;refreshCart().catch(e=>setError(e.message));api('emails').catch(()=>setError('Email service unavailable; your account is still active.'))},[user?.id]);
 async function run(fn){if(busy)return;setBusy(true);setError('');try{await fn()}catch(e){setError(e.message)}finally{setBusy(false)}}
 const login=()=>run(async()=>{if(!supabase)throw new Error('Supabase is not configured');unwrap(await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}}))});
 const logout=()=>run(async()=>{unwrap(await supabase.auth.signOut());setCart([])});
 const add=(product,size)=>run(async()=>{
  if(!user)throw new Error('Sign in with Google to save your bag.');
  const variant=product.variants.find(v=>v.size===size),qty=(cart.find(c=>c.key===variant.id)?.qty||0)+1;
  if(qty>Math.min(10,variant.stock))throw new Error('Maximum available quantity reached');
  unwrap(await supabase.from('cart_items').upsert({user_id:user.id,variant_id:variant.id,quantity:qty}));await refreshCart();
 });
 const quantity=(key,delta)=>run(async()=>{
  const item=cart.find(c=>c.key===key);if(!item)return;const qty=item.qty+delta;if(qty>10)throw new Error('Maximum 10 per size');
  unwrap(await(qty<=0?supabase.from('cart_items').delete().eq('user_id',user.id).eq('variant_id',key):supabase.from('cart_items').update({quantity:qty}).eq('user_id',user.id).eq('variant_id',key)));await refreshCart();
 });
 return {products,cart,user,error,busy,login,logout,add,quantity,refreshCart};
}
