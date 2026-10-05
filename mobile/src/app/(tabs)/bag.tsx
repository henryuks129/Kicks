import { useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useCommerce } from '../../lib/store';
import { money } from '../../lib/types';
import { Button, Heading } from '../../components/ui';
import { Notice } from '../../components/Notice';
export default function Bag() {
 const { cart, products, busy, ready, sync, quantity, refresh, run } = useCommerce();
 const [refreshing, setRefreshing] = useState(false);
 async function pullRefresh() { setRefreshing(true); try { await run(refresh); } finally { setRefreshing(false); } }
 const total = cart.reduce((sum, item) => sum + (products.find(product => product.id === item.id)?.price_kobo || 0) * item.qty, 0);
 return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void pullRefresh()}/>} contentContainerClassName="p-5 gap-5"><Notice/><Heading>YOUR BAG.</Heading><Text accessibilityLiveRegion="polite" className="text-secondary">{sync}</Text>{cart.map(item => { const product = products.find(row => row.id === item.id); return <View key={item.key} className="gap-4 rounded-xl border border-border p-4"><Text className="font-sans text-xl font-bold text-foreground">{product ? `${product.brand} ${product.name}` : 'Unavailable pair'}</Text><Text className="font-sans text-secondary">EU {item.size} · {money((product?.price_kobo || 0) * item.qty)}</Text><View className="flex-row items-center gap-4"><Button outline disabled={busy || !ready} label={`Decrease quantity for ${product?.name}`} onPress={() => void quantity(item, -1)}>−</Button><Text className="font-sans font-bold text-foreground">{String(item.qty)}</Text><Button outline disabled={busy || !ready} label={`Increase quantity for ${product?.name}`} onPress={() => void quantity(item, 1)}>+</Button><Button outline disabled={busy || !ready} label={`Remove ${product?.name}`} onPress={() => void quantity(item, -item.qty)}>Remove</Button></View></View>; })}{cart.length ? <><View className="flex-row justify-between"><Text className="font-sans text-xl font-bold text-foreground">Subtotal</Text><Text className="font-sans text-xl font-bold text-foreground">{money(total)}</Text></View><Button disabled={busy || !ready} onPress={() => router.push('/checkout')}>Continue to checkout</Button></> : <Text className="font-sans py-10 text-secondary">Your bag is empty. Find your next rotation in Shop.</Text>}</ScrollView>;
}
