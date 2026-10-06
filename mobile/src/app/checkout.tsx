import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams } from 'expo-router';
import { useCommerce } from '../lib/store';
import { api, requireClient } from '../lib/client';
import { money, type Profile } from '../lib/types';
import { Button, Field, Heading } from '../components/ui';
import { updateProfile } from '../../../shared/mobile-profile';
import { Notice } from '../components/Notice';
import { mobilePaymentReturnUrl } from '../../../shared/payment-return';
export default function Checkout() {
 const { user, login, busy, ready, run, refresh, cart } = useCommerce();
 const customerId = user?.id;
 const [pendingReference, setPendingReference] = useState('');
 const { paymentReturn } = useLocalSearchParams<{ paymentReturn?: string }>();
 const resumed = useRef('');
 const [order, setOrder] = useState<{ id: string; mode: string; total: number; receiptStatus: string; items: { id: string; name: string; size: number; quantity: number }[] } | null>(null);
 useEffect(() => {
  let active = true; setPendingReference(''); setComplete(''); setOrder(null); resumed.current = '';
  if (customerId) void AsyncStorage.getItem(`kicks:pending-payment:${customerId}`).then(value => { if (active) setPendingReference(value || ''); });
  return () => { active = false; };
 }, [customerId]);
 const checkPayment = useCallback(async (reference = pendingReference) => {
  if (!reference || !customerId) throw new Error('No payment is awaiting confirmation.');
  const result = await api('verify', { reference });
  setOrder(result.order);
  await AsyncStorage.removeItem(`kicks:pending-payment:${customerId}`);
  setPendingReference('');
  setComplete('Payment verified. Your order is saved. View your account for order and receipt details.');
  await refresh().catch(() => setCheckoutError('Your payment is verified, but your bag could not refresh. Pull down to retry in Bag.'));
 }, [customerId, pendingReference, refresh]);
 const [profile, setProfile] = useState<Profile>({ name: '', phone: '', address: '' }), [complete, setComplete] = useState(''), [profileReady, setProfileReady] = useState(false), [checkoutError, setCheckoutError] = useState('');
 useEffect(() => {
  if (paymentReturn !== '1' || !pendingReference || !customerId || busy || resumed.current === pendingReference) return;
  resumed.current = pendingReference;
  void run(() => checkPayment(), setCheckoutError);
 }, [paymentReturn, pendingReference, customerId, busy, run, checkPayment]);
 useEffect(() => {
  let active = true; setProfileReady(false);
  if (user) void requireClient().from('profiles').select('name,phone,address').eq('id', user.id).maybeSingle().then(({ data, error }) => { if (!active) return; if (!error) { setProfile(data || { name: user.user_metadata.full_name || '', phone: '', address: '' }); setProfileReady(true); } });
  return () => { active = false; };
 }, [user]);
 async function checkout(simulated: boolean) {
  if (!user || !cart.length) throw new Error('Sign in and add a pair before checkout.');
  if (!profile.name.trim() || !profile.phone.trim() || !profile.address.trim()) throw new Error('Complete your delivery details.');
  await updateProfile(requireClient(), user.id, profile);
  const result = await api(simulated ? 'demo' : 'checkout', { platform: 'mobile' });
  if (simulated) { setComplete(`Simulated order #${result.orderId.slice(0, 8)} saved. No money charged. Receipt processing requested.`); await refresh(); }
  else if (result.url) {
   if (!result.reference) throw new Error('Checkout needs a server update before the app can confirm payment. Please use the website for now.');
   await AsyncStorage.setItem(`kicks:pending-payment:${user.id}`, result.reference);
   setPendingReference(result.reference);
   const browser = await WebBrowser.openAuthSessionAsync(result.url, mobilePaymentReturnUrl);
   if (browser.type === 'success') await checkPayment(result.reference);
  }
  else throw new Error('Payment could not be started. Please try again.');
 }
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="p-5 gap-5"><Notice error={checkoutError}/><Heading>{complete ? 'GOOD SOLES. ALL YOURS.' : 'ONE LAST STEP.'}</Heading>{!user ? <><Text className="font-sans text-secondary">Sign in with the same Google account as the website to save this order.</Text><Button disabled={busy} onPress={login}>Continue with Google</Button></> : complete ? <><Text accessibilityLiveRegion="polite" className="leading-6 text-foreground">{complete}</Text>{order && <><Text className="font-sans text-secondary">Order #{order.id.slice(0, 8).toUpperCase()} · {order.mode === 'live' ? 'Paid order' : 'Test order · no real money charged'}</Text>{order.items.map(item => <Text key={item.id} className="font-sans text-foreground">{item.name} · EU {item.size} · Qty {item.quantity}</Text>)}<Text className="font-sans font-bold text-foreground">Total: {money(order.total)}</Text><Text className="font-sans leading-6 text-secondary">{order.receiptStatus === 'sent' ? 'Receipt submitted for delivery. Check your inbox or spam folder.' : 'Your order is confirmed. Receipt delivery is being processed separately.'}</Text></>}<Button onPress={() => router.replace('/account')}>View account & orders</Button></> : pendingReference ? <><Text className="font-sans leading-6 text-foreground">Checking a saved payment? Use the button below to confirm it securely with your app account. If payment is still pending, wait and try again. Please don’t pay a second time.</Text><Button disabled={busy} onPress={() => void run(() => checkPayment(), setCheckoutError)}>{busy ? 'Checking…' : 'Check payment status'}</Button><Button outline onPress={() => router.replace('/account')}>View account & orders</Button></> : <><Text className="font-sans text-secondary">Order email: {user.email}</Text>{(['name', 'phone', 'address'] as const).map(key => <Field key={key} label={key === 'name' ? 'Full name' : key === 'phone' ? 'Phone number' : 'Delivery address'} value={profile[key]} onChangeText={value => setProfile(old => ({ ...old, [key]: value }))} multiline={key === 'address'} keyboardType={key === 'phone' ? 'phone-pad' : 'default'}/>)}<Button disabled={busy || !ready || !profileReady || !cart.length} onPress={() => void run(() => checkout(false), setCheckoutError)}>{busy ? 'Processing…' : 'Continue to Paystack'}</Button><Button outline disabled={busy || !ready || !profileReady || !cart.length} onPress={() => void run(() => checkout(true), setCheckoutError)}>Simulated payment · no charge</Button><Text className="font-sans text-xs leading-5 text-secondary">The simulated option places a test order without charging you.</Text></>}</ScrollView>;
}
