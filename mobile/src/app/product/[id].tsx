import { LoadingImage } from '../../components/LoadingImage';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCommerce } from '../../lib/store';
import { siteUrl } from '../../lib/client';
import { money } from '../../lib/types';
import { Button, Heading } from '../../components/ui';
import { Notice } from '../../components/Notice';
export default function ProductScreen() {
 const { id } = useLocalSearchParams<{ id: string }>(), { products, add, busy, ready } = useCommerce();
 const product = products.find(row => row.id === id);
 const [size, setSize] = useState<number | null>(null), [angle, setAngle] = useState(0), [notice, setNotice] = useState('');
 if (!product) return <Text className="font-sans p-5 text-secondary">This pair is unavailable.</Text>;
 const gallery = [...new Set([product.image, ...(product.gallery || [])])];
 const selectedPhoto = gallery[angle] || gallery[0];
 const photoLabel = (photo: string, index: number) => photo === product.image ? 'Main view' : /sole/i.test(photo) ? 'Sole view' : `View ${index + 1}`;
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="p-5 gap-5"><Notice/><View className="h-80 rounded-2xl bg-primary p-5"><LoadingImage key={selectedPhoto} source={{ uri: `${siteUrl}/products/${selectedPhoto}.png` }} accessibilityLabel={`${product.name}, ${photoLabel(selectedPhoto, angle)}`} resizeMode="contain" className="h-full w-full"/></View>{gallery.length > 1 && <View className="flex-row flex-wrap gap-2">{gallery.map((photo, i) => <Pressable key={photo} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Show ${photoLabel(photo, i).toLowerCase()} of ${product.name}`} accessibilityState={{ selected: photo === selectedPhoto }} onPress={() => setAngle(i)} className={`min-h-12 flex-1 items-center gap-2 rounded-xl border-2 p-3 ${photo === selectedPhoto ? 'border-primary bg-muted' : 'border-border bg-background'}`}><LoadingImage source={{ uri: `${siteUrl}/products/${photo}.png` }} resizeMode="contain" style={{ width: 72, height: 56 }}/><Text className={`font-semibold ${photo === selectedPhoto ? 'text-primary' : 'text-foreground'}`}>{photoLabel(photo, i)}</Text></Pressable>)}</View>}<Text className="font-sans uppercase tracking-widest text-secondary">{product.brand}</Text><Heading>{product.name}</Heading><Text className="font-sans text-xl font-semibold text-foreground">{money(product.price_kobo)}</Text><Text className="font-sans leading-6 text-secondary">{product.description}</Text><Text className="font-sans font-bold text-foreground">Choose your EU size</Text><View className="flex-row flex-wrap gap-2">{product.product_variants.filter(variant => variant.stock > 0).map(variant => <Pressable key={variant.id} accessibilityRole="button" accessibilityLabel={`EU size ${variant.size}`} accessibilityState={{ selected: size === variant.size }} onPress={() => { setSize(variant.size); setNotice(''); }} className={`min-h-12 min-w-12 items-center justify-center rounded-lg border px-4 ${size === variant.size ? 'border-foreground bg-foreground' : 'border-border'}`}><Text className={size === variant.size ? 'text-white' : 'text-foreground'}>{variant.size}</Text></Pressable>)}</View>{notice ? <Text accessibilityRole="alert" className="text-primary">{notice}</Text> : null}<Button disabled={busy || !ready} onPress={() => { if (size === null) setNotice('Choose your size first.'); else void add(product, size); }}>{busy ? 'Updating bag…' : 'Add to bag'}</Button></ScrollView>;
}
