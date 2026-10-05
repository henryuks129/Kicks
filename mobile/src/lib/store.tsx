import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';
import { api, client, requireClient } from './client';
import { login } from './auth';
import { errorMessage } from '../../../shared/mobile-profile';
import type { CartItem, Product } from './types';
import { subscribeCart } from '../../../shared/cart-sync';
import { parseGuestCart, mergeGuestCart } from '../../../shared/guest-cart';

const guestKey = 'kicks.guest-cart';
function useStore() {
 const [products, setProducts] = useState<Product[]>([]), [cart, setCart] = useState<CartItem[]>([]), [user, setUser] = useState<User | null>(null);
 const [error, setError] = useState(''), [busy, setBusy] = useState(false), [ready, setReady] = useState(false), [sync, setSync] = useState('Sign in to sync your bag'), [success, setSuccess] = useState(''), [catalogError, setCatalogError] = useState('');
 const account = useRef<string | undefined>(undefined), cartRef = useRef(cart), lock = useRef(false);
 account.current = user?.id;
 const update = useCallback((items: CartItem[]) => { cartRef.current = items; setCart(items); }, []);
 const refresh = useCallback(async (isCurrent: () => boolean = () => true) => {
  const customer = account.current;
  if (!customer) return;
  const { data, error } = await requireClient().from('cart_items').select('*,product_variants(product_id,size)').eq('user_id', customer);
  if (error) throw error;
  if (isCurrent() && account.current === customer) update(data.map(row => ({ id: row.product_variants.product_id, size: row.product_variants.size, key: row.variant_id, qty: row.quantity })));
 }, [update]);
 useEffect(() => {
  if (!client) { setCatalogError('The store connection is not ready. Please try again later.'); return; }
  const supabase = client;
  let active = true;
  client.from('products').select('*,product_variants(*)').then(({ data, error }) => { if (!active) return; if (error) setCatalogError(error.message); else { setCatalogError(''); setProducts(data as Product[]); } });
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
   if (!active) return;
   if (account.current !== session?.user.id) { account.current = session?.user.id; update([]); setReady(false); }
   setUser(session?.user || null);
  });
  const state = AppState.addEventListener('change', next => {
   if (next === 'active') supabase.auth.startAutoRefresh(); else supabase.auth.stopAutoRefresh();
  });
  return () => { active = false; subscription.unsubscribe(); state.remove(); };
 }, [update]);
 useEffect(() => {
  let active = true;
  setReady(false);
  (async () => {
   const valid = parseGuestCart(await AsyncStorage.getItem(guestKey)) as CartItem[];
   if (!user) { if (active) { update(valid); setReady(true); setSync('Sign in to sync your bag'); } return; }
   if (!products.length) return;
   await refresh();
   if (!active) return;
   const merged = mergeGuestCart(valid, cartRef.current, products.map(product => ({ ...product, variants: product.product_variants }))).map((item: CartItem) => ({ user_id: user.id, variant_id: item.key, quantity: item.qty }));
   if (merged.length) { const { error } = await requireClient().from('cart_items').upsert(merged, { onConflict: 'user_id,variant_id' }); if (error) throw error; }
   if (!active) return;
   await AsyncStorage.removeItem(guestKey); await refresh();
   if (active) setReady(true);
  })().catch(() => { if (active) setError('Your bag could not load. Check your connection and try again.'); });
  return () => { active = false; };
 }, [user, products, refresh, update]);
 useEffect(() => {
  if (!client || !user || !ready) return;
  const stop = subscribeCart({ client, userId: user.id, refresh, report: setSync, statusChanged: status => {
   setSync(status === 'SUBSCRIBED' ? 'Bag synced across your devices' : 'Connecting live bag…');
   if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) setSync('Live sync disconnected. Pull down to retry.');
  } });
  const state = AppState.addEventListener('change', next => { if (next === 'active') void refresh().catch(() => setSync('Unable to sync. Pull down to retry.')); });
  return () => { stop(); state.remove(); };
 }, [user, ready, refresh]);
 useEffect(() => { if (user) void api('emails').catch(() => setError('Your account is ready, but the welcome email could not be processed.')); }, [user]);
 useEffect(() => { if (!success) return; const timer = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(timer); }, [success]);
 async function run(action: () => Promise<void>, reportError: (message: string) => void = setError) {
  if (lock.current) return; lock.current = true; setBusy(true); reportError(''); setSuccess('');
  try { await action(); } catch (error) { reportError(errorMessage(error)); }
  finally { lock.current = false; setBusy(false); }
 }
 async function setQuantity(product: Product, size: number, quantity: number) {
  if (!ready) throw new Error('Wait for your bag to sync.');
  const variant = product.product_variants.find(row => row.size === size);
  if (!variant || !Number.isInteger(quantity) || quantity > Math.min(10, variant.stock)) throw new Error('This quantity is not available.');
  if (user) {
   const response = quantity <= 0 ? await requireClient().from('cart_items').delete().eq('user_id', user.id).eq('variant_id', variant.id) : await requireClient().from('cart_items').upsert({ user_id: user.id, variant_id: variant.id, quantity }, { onConflict: 'user_id,variant_id' });
   if (response.error) throw response.error;
   await refresh();
  } else {
   const next = [...cartRef.current.filter(row => row.key !== variant.id), ...(quantity > 0 ? [{ id: product.id, size, key: variant.id, qty: quantity }] : [])];
   await AsyncStorage.setItem(guestKey, JSON.stringify(next)); update(next);
  }
 }
 return { products, cart, user, error, busy, ready, sync, success, catalogError, setError, run, refresh,
  login: () => run(login), logout: () => run(async () => { const { error } = await requireClient().auth.signOut({ scope: 'local' }); if (error) throw error; }),
  add: (product: Product, size: number) => run(async () => { await setQuantity(product, size, (cartRef.current.find(row => row.id === product.id && row.size === size)?.qty || 0) + 1); setSuccess(`${product.name} · EU ${size} added to your bag`); }),
  quantity: (item: CartItem, delta: number) => run(async () => { const product = products.find(row => row.id === item.id); if (!product) throw new Error('This pair is unavailable.'); await setQuantity(product, item.size, item.qty + delta); }),
 };
}
const StoreContext = createContext<ReturnType<typeof useStore> | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) { const store = useStore(); return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>; }
export function useCommerce() { const value = useContext(StoreContext); if (!value) throw new Error('StoreProvider is missing'); return value; }
