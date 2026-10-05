import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useCommerce } from '../../lib/store';
import { requireClient } from '../../lib/client';
import { money, type Profile } from '../../lib/types';
import { Button, Field, Heading } from '../../components/ui';
import { updateProfile } from '../../../../shared/mobile-profile';
import { Notice } from '../../components/Notice';
type Order = { id: string; status: string; total_kobo: number; mode: string };
export default function Account() {
 const { user, login, logout, busy, run } = useCommerce();
 const [profile, setProfile] = useState<Profile>({ name: '', phone: '', address: '' }), [orders, setOrders] = useState<Order[]>([]), [notice, setNotice] = useState('');
 useEffect(() => {
  setProfile({ name: '', phone: '', address: '' }); setOrders([]); setNotice('');
  if (!user) return;
  let active = true;
  void (async () => {
   const [{ data, error }, history] = await Promise.all([requireClient().from('profiles').select('name,phone,address').eq('id', user.id).maybeSingle(), requireClient().from('orders').select('id,status,total_kobo,mode').eq('user_id', user.id).order('created_at', { ascending: false })]);
   if (!active) return;
   if (error || history.error) { setNotice('We could not load all account details. Reopen Account to retry.'); return; }
   setProfile(data || { name: user.user_metadata.full_name || '', phone: '', address: '' }); setOrders(history.data || []);
  })().catch(() => { if (active) setNotice('Account details could not load.'); });
  return () => { active = false; };
 }, [user]);
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="p-5 gap-5"><Notice/><Heading>YOUR ACCOUNT.</Heading>{!user ? <><Text className="font-sans leading-6 text-secondary">Use the same Google account as the Kicks website. Your bag and orders follow you.</Text><Button disabled={busy} onPress={login}>{busy ? 'Signing in…' : 'Continue with Google'}</Button></> : <><Text className="font-sans text-secondary">{user.email}</Text>{(['name', 'phone', 'address'] as const).map(key => <Field key={key} label={key === 'name' ? 'Full name' : key === 'phone' ? 'Phone number' : 'Delivery address'} value={profile[key]} onChangeText={value => setProfile(old => ({ ...old, [key]: value }))} multiline={key === 'address'} keyboardType={key === 'phone' ? 'phone-pad' : 'default'}/>)}<Button disabled={busy} onPress={() => void run(async () => { if (!profile.name.trim() || !profile.phone.trim() || !profile.address.trim()) throw new Error('Complete your name, phone number and delivery address.'); await updateProfile(requireClient(), user.id, profile); setNotice('Your details are saved.'); })}>Save details</Button><Text accessibilityLiveRegion="polite" className="text-secondary">{notice}</Text><Heading>YOUR ORDERS.</Heading>{orders.length ? orders.map(order => <View key={order.id} className="gap-2 rounded-xl border border-border p-4"><Text className="font-sans font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()} · {money(order.total_kobo)}</Text><Text className="font-sans text-secondary">{order.status}{order.mode !== 'live' ? ' · Test order' : ''}</Text></View>) : <Text className="font-sans text-secondary">No orders yet.</Text>}<Button outline disabled={busy} onPress={logout}>Sign out</Button></>}</ScrollView>;
}
