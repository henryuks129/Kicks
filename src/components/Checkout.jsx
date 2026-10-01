import { useState } from 'react'
import { Button } from './ui/button'
import { money } from '../data/products'
export function Checkout({items,onComplete}) {
  const [receipt,setReceipt] = useState(null)
  const total = items.reduce((sum,item)=>sum+item.price*item.qty,0)
  if(receipt) return <div><div className="border border-dashed border-border bg-white p-6 text-[#22231f]"><div className="flex justify-between"><strong className="text-3xl font-black italic">kicks.</strong><span className="text-xs uppercase">Demo receipt</span></div><p className="my-5 text-xs">{receipt.reference}<br/>{receipt.date}<br/>{receipt.name}</p>{items.map(item=><div key={item.key} className="flex justify-between gap-3 py-2 text-sm"><span>{item.name} / EU {item.size} × {item.qty}</span><span>{money(item.price*item.qty)}</span></div>)}<div className="mt-4 flex justify-between border-t border-dashed pt-4 font-bold"><span>Total</span><span>{money(total)}</span></div><p className="mt-6 text-xs">Preview only. No payment taken, order placed or email sent.</p></div><Button className="mt-5 w-full" onClick={onComplete}>Keep exploring</Button></div>
  return <form className="grid gap-4" onSubmit={event=>{event.preventDefault(); const form=new FormData(event.currentTarget);setReceipt({name:form.get('name'),reference:`KICKS-DEMO-${crypto.randomUUID().slice(0,8).toUpperCase()}`,date:new Date().toLocaleDateString()})}}>
    {[['name','Full name','text','name'],['email','Email','email','email'],['phone','Phone','tel','tel'],['address','Delivery address','text','street-address']].map(([name,label,type,autoComplete])=><label className="grid gap-2 text-sm" key={name}>{label}<input name={name} type={type} autoComplete={autoComplete} required className="min-h-11 rounded-lg border border-border bg-background px-3"/></label>)}
    <p className="text-sm text-muted-foreground">This local preview creates a custom receipt. Payments and email delivery are not connected yet.</p><Button type="submit">Preview receipt · {money(total)}</Button>
  </form>
}
