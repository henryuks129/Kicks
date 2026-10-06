import { useEffect, useState } from 'react'
import { ArrowRight, Check, LoaderCircle, Mail, MapPin, ShoppingBag } from 'lucide-react'
import { api } from '../lib/commerce'
import { money, photo } from '../data/products'
import { Button } from './ui/button'
import { mobilePaymentReturnUrl } from '../../shared/payment-return'

export function PaymentReturn({user,onRefresh,products,login}) {
 if (new URLSearchParams(location.search).get('platform') === 'mobile') return <MobilePaymentReturn/>;
 return <WebPaymentReturn user={user} onRefresh={onRefresh} products={products} login={login}/>;
}

function MobilePaymentReturn() {
 useEffect(() => { window.location.replace(mobilePaymentReturnUrl); }, []);
 return <main id="main" className="mx-auto max-w-lg space-y-6 px-5 py-10">
  <h1 className="text-4xl font-black">RETURN TO KICKS.</h1>
  <p className="leading-7 text-muted-foreground">Finish checking your payment in the Kicks app. Your signed-in app account will verify the payment securely.</p>
  <Button asChild><a href={mobilePaymentReturnUrl}>Open Kicks <ArrowRight size={16}/></a></Button>
  <p className="text-sm leading-6 text-muted-foreground">If the app does not open, close this browser and choose Check payment status in Checkout. Please don’t pay again.</p>
 </main>;
}

function WebPaymentReturn({user,onRefresh,products,login}) {
 const [order,setOrder]=useState(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const reference=new URLSearchParams(location.search).get('reference');
 useEffect(()=>{
  if(!user){setLoading(false);return}
  let active=true;setLoading(true);
  api('order',{reference}).then(result=>{if(active)setOrder(result.order)}).catch(()=>{if(active)setError('We couldn’t load your order. Try verifying your payment below.')}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[user?.id,reference]);
 async function confirm(){
  setBusy(true);setError('');
  try{const result=await api('verify',{reference});setOrder(result.order);onRefresh().catch(()=>{});}
  catch{setError('We couldn’t confirm this payment yet. You can safely try again. Please don’t pay a second time.');}
  finally{setBusy(false)}
 }
 const paid=order?.status==='paid',test=order?.mode!=='live',receipt=order?.receiptStatus;
 return <main id="main" className="mx-auto max-w-6xl px-5 py-10 md:px-12 md:py-16">
  <div className="mb-8 flex items-center justify-between border-b border-border pb-5 text-xs font-semibold uppercase tracking-widest"><span>Checkout / confirmation</span><span className="rounded-full bg-muted px-3 py-2">{order?(test?'Test order · no charge':'Order confirmation'):'Payment status'}</span></div>
  <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
   <section aria-live="polite">
    <div className="mb-6 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">{paid?<Check size={26}/>:loading||busy?<LoaderCircle className="motion-safe:animate-spin" size={24}/>:<ShoppingBag size={24}/>}</div>
    <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">{paid?'Payment confirmed':'One last step'}</p>
    <h1 className="max-w-lg text-5xl font-black leading-[.98] tracking-tighter md:text-7xl">{paid?<>GOOD SOLES.<br/>ALL YOURS.</>:<>LET’S CONFIRM<br/>YOUR PAIR.</>}</h1>
    <p className="mt-6 max-w-md leading-7 text-muted-foreground">{paid?(test?'Your test order is saved. No real money was charged.':'Your payment is verified and your order is saved.'):loading?'Loading your order details…':'Confirm your payment securely to finish your order.'}</p>
    {order&&<p className="mt-5 text-xs text-muted-foreground">Order <span className="font-mono uppercase text-foreground">#{order.id.slice(0,8)}</span></p>}
    {error&&<p role="alert" className="mt-5 max-w-md rounded-lg border border-border p-4 text-sm leading-6">{error}</p>}
    <div className="mt-8 flex flex-wrap gap-3">{!user?<Button onClick={login}>Continue with Google <ArrowRight size={16}/></Button>:!paid&&<Button disabled={busy||loading||!reference} onClick={confirm}>{busy?'Verifying payment…':'Verify payment'} <ArrowRight size={16}/></Button>}<Button asChild variant={paid?'default':'outline'}><a href="/#shop">{paid?'Continue shopping':'Back to shop'} <ArrowRight size={16}/></a></Button></div>
    {paid&&<div className="mt-10 flex max-w-md gap-3 border-t border-border pt-6"><Mail size={20} className="mt-1 shrink-0 text-primary"/><div><p className="text-sm font-semibold">{order.receiptDelivery==='delivered'?'Receipt delivered':order.receiptDelivery==='rejected'?'Receipt could not be delivered':order.receiptDelivery==='paused'?'Receipt delivery is paused':receipt==='sent'?'Receipt submitted for delivery':receipt==='failed'?'Your receipt is delayed':receipt==='sending'?'Receipt delivery is being checked':receipt==='pending'?'Your receipt is queued':'Receipt status unavailable'}</p><p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{receipt==='sent'?`Addressed to ${order.delivery.email}. Check your inbox or spam folder.`:'Your payment is confirmed. Email delivery is separate from your order status.'}</p></div></div>}
   </section>
   <section aria-labelledby="order-summary" className="self-start rounded-2xl border border-border bg-background p-6 md:p-8">
    <div className="flex items-center justify-between gap-4 border-b border-border pb-5"><h2 id="order-summary" className="text-xl font-bold tracking-tight">Your rotation</h2><span className="text-xs text-muted-foreground">{order?`${order.items.reduce((sum,item)=>sum+item.quantity,0)} pairs`:'Order summary'}</span></div>
    {order?<><ul className="divide-y divide-border">{order.items.map(item=>{const product=products.find(p=>p.variants?.some(v=>v.id===item.variant_id));return <li key={item.id} className="flex gap-4 py-6">{product?<img src={photo(product.image)} alt="" className="size-20 rounded-lg bg-muted object-contain p-2"/>:<div className="grid size-20 shrink-0 place-items-center rounded-lg bg-muted"><ShoppingBag size={22}/></div>}<div className="min-w-0 flex-1"><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-sm text-muted-foreground">EU {item.size} · Qty {item.quantity}</p><p className="mt-3 text-sm font-semibold">{money(item.unit_price_kobo*item.quantity/100)}</p></div></li>})}</ul><dl className="flex justify-between border-t border-border py-6 text-lg font-bold"><dt>{paid?'Total paid':'Order total'}</dt><dd>{money(order.total/100)}</dd></dl><div className="flex gap-3 border-t border-border pt-6"><MapPin size={20} className="mt-1 shrink-0 text-primary"/><div><h3 className="text-sm font-semibold">Delivery details</h3><p className="mt-3 text-sm leading-6">{order.delivery.name}<br/>{order.delivery.address}</p><p className="mt-2 text-sm text-muted-foreground">{order.delivery.phone}</p>{test&&<p className="mt-3 text-xs leading-5 text-muted-foreground">This is a test order. No shipment will be arranged.</p>}</div></div></>:<p className="py-12 text-sm leading-6 text-muted-foreground">{loading?'Loading your items…':user?'Verify your payment to view your order details.':'Sign in with the account you used at checkout to view this order.'}</p>}
   </section>
  </div>
 </main>
}
