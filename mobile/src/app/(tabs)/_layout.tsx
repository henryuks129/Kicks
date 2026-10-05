import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCommerce } from '../../lib/store';
export default function TabLayout() {
 const { cart } = useCommerce();
 return <Tabs screenOptions={{ headerTitle: 'KICKS.', headerStyle: { backgroundColor: '#f4f1e9' }, headerTitleStyle: { fontFamily: 'Anton', fontSize: 28 }, tabBarActiveTintColor: '#b84c26', tabBarStyle: { backgroundColor: '#f4f1e9' }, sceneStyle: { backgroundColor: '#f4f1e9' } }}>
  <Tabs.Screen name="index" options={{ title: 'Shop', tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" color={color} size={size}/> }}/><Tabs.Screen name="bag" options={{ title: 'Bag', tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" color={color} size={size}/>, tabBarBadge: cart.length ? cart.reduce((sum, row) => sum + row.qty, 0) : undefined }}/><Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size}/> }}/>
 </Tabs>;
}
