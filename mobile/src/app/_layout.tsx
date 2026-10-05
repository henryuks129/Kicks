import '../../global.css';
import { useFonts } from 'expo-font';
import { Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BagToast } from '../components/BagToast';
import { StoreProvider } from '../lib/store';
export default function Layout() {
 const [fontsLoaded, fontError] = useFonts({ Anton: require('../../brand/Anton-Regular.ttf'), Manrope: require('../../brand/Manrope-Variable.ttf') });
 if (!fontsLoaded && !fontError) return <View className="flex-1 items-center justify-center bg-background"><Text>Loading Kicks…</Text></View>;

 return <SafeAreaProvider><StoreProvider><StatusBar style="dark"/><Stack screenOptions={{ headerStyle: { backgroundColor: '#f4f1e9' }, headerTintColor: '#191a17', headerBackButtonDisplayMode: 'minimal', contentStyle: { backgroundColor: '#f4f1e9' } }}><Stack.Screen name="(tabs)" options={{ headerShown: false }}/><Stack.Screen name="product/[id]" options={{ title: 'Your next pair' }}/><Stack.Screen name="guide" options={{title:'Shoe field guide'}}/><Stack.Screen name="checkout" options={{ title: 'Checkout' }}/><Stack.Screen name="auth/callback" options={{ title: 'Sign in' }}/></Stack><BagToast/></StoreProvider></SafeAreaProvider>;
}
