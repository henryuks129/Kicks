import { products as previewProducts } from '../data/products'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import { createCartQueue } from './cart-queue'
import { GUEST_CART_KEY, readGuestCart, mergeGuestCart, persistGuestCart } from './guest-cart'
import { subscribeCart } from '../../shared/cart-sync.js'
import { createCommerceApi } from '../../shared/commerce-api.js'
const localPreview=import.meta.env.DEV && import.meta.env.VITE_LOCAL_CATALOG_PREVIEW==='true';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase=!localPreview&&url&&key?createClient(url,key):null;
const unwrap=({data,error})=>{if(error)throw error;return data};
export const api=createCommerceApi(supabase,'/api/commerce');
export function useCommerce() {
 const [products,setProducts]=useState([]),[catalogLoading,setCatalogLoading]=useState(true),[cart,setCart]=useState(readGuestCart),[user,setUser]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[cartReady,setCartReady]=useState(false),[signInCount,setSignInCount]=useState(0);
 const [pendingSaves,setPendingSaves]=useState(0);
 const cartRef=useRef(cart),accountRef=useRef(user?.id),queueRef=useRef(null);
 accountRef.current=user?.id;
 if(!queueRef.current)queueRef.current=createCartQueue();
 function updateCart(items){cartRef.current=items;setCart(items)}
 function saveGuest(items){localStorage.setItem(GUEST_CART_KEY,JSON.stringify(items));updateCart(items)}
 async function refreshCart(isCurrent=()=>true){
  const customer=accountRef.current;
  const {data}=await supabase.auth.getUser();if(!data.user){updateCart(readGuestCart());return}
  const rows=unwrap(await supabase.from('cart_items').select('*,product_variants(product_id,size)').eq('user_id',data.user.id));
  const items=rows.map(r=>({id:r.product_variants.product_id,size:r.product_variants.size,key:r.variant_id,qty:r.quantity}));
  if(isCurrent()&&accountRef.current===customer)updateCart(items);return items;
 }
 useEffect(()=>{
  if(localPreview){setProducts(previewProducts.map(p=>({...p,variants:p.sizes.map(size=>({id:`preview-${p.id}-${size}`,size,stock:10}))})));setCatalogLoading(false);return}
  if(!supabase){setError('Store connection is not configured.');setCatalogLoading(false);return}
  let active=true;
  supabase.from('products').select('*,product_variants(*)').then(response=>{if(active)setCatalogLoading(false);try{const rows=unwrap(response);if(active)setProducts(rows.map(p=>({...p,price:p.price_kobo/100,sizes:p.product_variants.filter(v=>v.stock>0).map(v=>v.size),variants:p.product_variants})))}catch(e){if(active)setError('Could not load the collection. Check your connection and reload to try again.')}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{if(active){if(accountRef.current!==session?.user.id){accountRef.current=session?.user.id;updateCart([]);setCartReady(false)}setUser(session?.user||null);if(event==='SIGNED_IN')setSignInCount(value=>value+1)}});
  return()=>{active=false;subscription.unsubscribe()};
 },[]);
 useEffect(()=>{
  let active=true;setCartReady(false);
  if(!user){updateCart(readGuestCart());return}
  if(!products.length)return;
  async function restore(){
   const saved=await refreshCart();
   const guest=mergeGuestCart(readGuestCart(),saved||[],products);
   if(guest.length)unwrap(await supabase.from('cart_items').upsert(guest.map(item=>({user_id:user.id,variant_id:item.key,quantity:item.qty})),{onConflict:'user_id,variant_id'}));
   if(!active)return;
   localStorage.removeItem(GUEST_CART_KEY);await refreshCart();if(active)setCartReady(true);
  }
  restore().catch(e=>{if(active)setError(e.message)});
  return()=>{active=false};
 },[user?.id,products]);
 useEffect(()=>{
  if(!supabase||!user||!cartReady)return;
  return subscribeCart({client:supabase,userId:user.id,report:setError,target:window,documentTarget:document,refresh:async isCurrent=>{
   await queueRef.current.flush();
   if(isCurrent())await refreshCart(isCurrent);
  }});
 },[user?.id,cartReady]);
 useEffect(()=>{if(user)api('emails').catch(e=>setError(`Your account is active. ${e.message}`))},[user?.id]);
 useEffect(()=>{if(user&&signInCount)api('signin').catch(e=>setError(`Your account is active. ${e.message}`))},[user?.id,signInCount]);
 async function run(fn){if(busy)return false;setBusy(true);setError('');try{await fn();return true}catch(e){setError(e.message);return false}finally{setBusy(false)}}
 const login=()=>run(async()=>{if(!supabase)throw new Error('Supabase is not configured');unwrap(await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}}))});
 const logout=()=>run(async()=>{await queueRef.current.flush();persistGuestCart(cartRef.current);unwrap(await supabase.auth.signOut());updateCart(readGuestCart())});
 const add=(product,size)=>run(async()=>{
  if(user&&!cartReady)throw new Error('Your bag is syncing. Please try again in a moment.');
  await queueRef.current.flush();
  const variant=product.variants.find(v=>v.size===size);if(!variant)throw new Error('Choose an available size.');const qty=(cartRef.current.find(c=>c.key===variant.id)?.qty||0)+1;
  if(qty>Math.min(10,variant.stock))throw new Error('Maximum available quantity reached');
  if(!user){saveGuest([...cartRef.current.filter(item=>item.key!==variant.id),{id:product.id,size,key:variant.id,qty}]);return}
  unwrap(await supabase.from('cart_items').upsert({user_id:user.id,variant_id:variant.id,quantity:qty},{onConflict:'user_id,variant_id'}));await refreshCart();
 });
 const quantity=(key,delta)=>{
  try {
  if(busy)throw new Error('Please wait for the current bag update.');
  const item=cartRef.current.find(c=>c.key===key);if(!item)return;const qty=item.qty+delta;if(qty>10)throw new Error('Maximum 10 per size');
  const variant=products.find(product=>product.id===item.id)?.variants.find(v=>v.id===key);
  if(qty>0&&(!variant||qty>variant.stock))throw new Error('Maximum available quantity reached');
  const items=qty<=0?cartRef.current.filter(row=>row.key!==key):cartRef.current.map(row=>row.key===key?{...row,qty}:row);
  if(!user){saveGuest(items);return}
  if(!cartReady)throw new Error('Your bag is syncing. Please try again in a moment.');
  const customer=user.id;setError('');updateCart(items);setPendingSaves(count=>count+1);
  queueRef.current.enqueue(item,qty,async value=>{
   if(accountRef.current!==customer)throw new Error('Account changed');
   unwrap(await(value<=0?supabase.from('cart_items').delete().eq('user_id',customer).eq('variant_id',key):supabase.from('cart_items').update({quantity:value}).eq('user_id',customer).eq('variant_id',key)));
  },saved=>{
   if(accountRef.current!==customer)return;
   const remaining=cartRef.current.filter(row=>row.key!==key);updateCart(saved?[...remaining,saved]:remaining);
   setError('Couldn’t save the quantity. Your last saved quantity has been restored. Please try again.');
  }).finally(()=>setPendingSaves(count=>count-1));
  }catch(e){setError(e.message)}
 };
 return {products,catalogLoading,cart,user,error,busy,cartReady,cartSaving:pendingSaves>0,login,logout,add,quantity,refreshCart};
}
