import { useState } from 'react'
import { api } from '../lib/commerce'
import { Button } from './ui/button'
export function PaymentReturn({user,onRefresh}) {
 const [message,setMessage]=useState('Confirm your payment to update your order.'),[busy,setBusy]=useState(false);
 async function confirm(){setBusy(true);try{const reference=new URLSearchParams(location.search).get('reference');if(!reference)throw new Error('Missing payment reference');const result=await api('verify',{reference});setMessage(`Test payment confirmed. Order ${result.orderId}. Receipt email queued.`);await onRefresh()}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 return <section className="mx-auto max-w-xl space-y-5 p-8"><h1 className="text-3xl font-bold">Payment confirmation</h1><p role="status">{message}</p>{user?<Button disabled={busy} onClick={confirm}>{busy?'Checking…':'Verify payment'}</Button>:<p>Sign in to verify your order. A verified webhook can also complete it.</p>}<a className="block underline" href="/">Return to shop</a></section>
}
