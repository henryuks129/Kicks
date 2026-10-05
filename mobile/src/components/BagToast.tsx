import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommerce } from '../lib/store';

export function BagToast() {
 const { success } = useCommerce();
 const inset = useSafeAreaInsets();
 if (!success) return null;
 return <View pointerEvents="none" accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 20, right: 20, bottom: inset.bottom + 76 }} className="rounded-xl bg-foreground px-5 py-4"><Text className="font-sans font-semibold text-white">{success}</Text></View>;
}
