import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Heading } from '../components/ui';
import { styleRegions } from '../../../shared/style-regions';
export default function Guide() {
 return <ScrollView contentContainerClassName="p-5 gap-6"><Text className="font-sans text-xs uppercase tracking-widest text-primary">A guide to the rotation</Text><Heading>THE SHOE ATLAS</Heading><Text className="font-sans text-lg leading-7 text-secondary">Every pair has its place. Pick a terrain to find the styles that belong there.</Text><View className="gap-3">{styleRegions.map(region=><Pressable key={region.category} accessibilityRole="button" accessibilityLabel={`Explore ${region.category}: ${region.tag}`} onPress={()=>router.navigate({pathname:'/',params:{category:region.category}})} className="min-h-28 justify-center border-b border-border py-5"><Text className="font-display text-4xl text-foreground">{region.name.toUpperCase()}</Text><Text className="font-sans mt-2 text-secondary">{region.tag} →</Text></Pressable>)}</View></ScrollView>;
}
