import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useCommerce } from '../lib/store';
import { api, requireClient } from '../lib/client';
import type { Profile } from '../lib/types';
import { Button, Field, Heading } from '../components/ui';
import { updateProfile } from '../../../shared/mobile-profile';
import { Notice } from '../components/Notice';
export default function Checkout() {
 const { user, login, busy, ready, run, refresh, cart } = useCommerce();
 const [pendingReference, setPendingReference] = useState('');
 useEffect(() => {
  let active = true; setPendingReference('');
  if (user) void AsyncStorage.getItem(`kicks:pending-payment:${user.id}`).then(value => { if (active) setPendingReference(value || ''); });
  return () => { active = false; };
 }, [user]);
 async function checkPayment(reference = pendingReference) {
  if (!reference || !user) throw new Error('No payment is awaiting confirmation.');
  await api('verify', { reference });
  await AsyncStorage.removeItem(`kicks:pending-payment:${user.id}`);
  setPendingReference('');
  setComplete('Payment verified. Your order is saved. View your account for order and receipt details.');
  await refresh();
 }
 const [profile, setProfile] = useState<Profile>({ name: '', phone: '', address: '' }), [complete, setComplete] = useState(''), [profileReady, setProfileReady] = useState(false), [checkoutError, setCheckoutError] = useState('');
 useEffect(() => {
  let active = true; setProfileReady(false);
  if (user) void requireClient().from('profiles').select('name,phone,address').eq('id', user.id).maybeSingle().then(({ data, error }) => { if (!active) return; if (!error) { setProfile(data || { name: user.user_metadata.full_name || '', phone: '', address: '' }); setProfileReady(true); } });
  return () => { active = false; };
 }, [user]);
 async function checkout(simulated: boolean) {
  if (!user || !cart.length) throw new Error('Sign in and add a pair before checkout.');
  if (!profile.name.trim() || !profile.phone.trim() || !profile.address.trim()) throw new Error('Complete your delivery details.');
  await updateProfile(requireClient(), user.id, profile);
  const result = await api(simulated ? 'demo' : 'checkout');
  if (simulated) { setComplete(`Simulated order #${result.orderId.slice(0, 8)} saved. No money charged. Receipt processing requested.`); await refresh(); }
  else if (result.url) {
   if (!result.reference) throw new Error('Checkout needs a server update before the app can confirm payment. Please use the website for now.');
   await AsyncStorage.setItem(`kicks:pending-payment:${user.id}`, result.reference);
   setPendingReference(result.reference);
   const browser = await WebBrowser.openBrowserAsync(result.url);
   if (browser.type !== 'opened') await checkPayment(result.reference);
  }
  else throw new Error('Payment could not be started. Please try again.');
 }
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="p-5 gap-5"><Notice error={checkoutError}/><Heading>ONE LAST STEP.</Heading>{!user ? <><Text className="font-sans text-secondary">Sign in with the same Google account as the website to save this order.</Text><Button disabled={busy} onPress={login}>Continue with Google</Button></> : complete ? <><Text accessibilityLiveRegion="polite" className="leading-6 text-foreground">{complete}</Text><Button onPress={() => router.replace('/account')}>View account & orders</Button></> : pendingReference ? <><Text className="font-sans leading-6 text-foreground">After completing Paystack, close the browser with Done and check your payment here. Your app account confirms the order securely.</Text><Button disabled={busy} onPress={() => void run(() => checkPayment(), setCheckoutError)}>{busy ? 'Checking…' : 'Check payment status'}</Button><Button outline onPress={() => router.replace('/account')}>View account & orders</Button></> : <><Text className="font-sans text-secondary">Order email: {user.email}</Text>{(['name', 'phone', 'address'] as const).map(key => <Field key={key} label={key === 'name' ? 'Full name' : key === 'phone' ? 'Phone number' : 'Delivery address'} value={profile[key]} onChangeText={value => setProfile(old => ({ ...old, [key]: value }))} multiline={key === 'address'} keyboardType={key === 'phone' ? 'phone-pad' : 'default'}/>)}<Button disabled={busy || !ready || !profileReady || !cart.length} onPress={() => void run(() => checkout(false), setCheckoutError)}>{busy ? 'Processing…' : 'Continue to Paystack'}</Button><Button outline disabled={busy || !ready || !profileReady || !cart.length} onPress={() => void run(() => checkout(true), setCheckoutError)}>Simulated payment · no charge</Button><Text className="font-sans text-xs leading-5 text-secondary">The simulated option places a test order without charging you.</Text></>}</ScrollView>;
}
