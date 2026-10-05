import { Text, View } from 'react-native';
import { useCommerce } from '../lib/store';
export function Notice({ error: localError }: { error?: string } = {}) {
 const { error: globalError } = useCommerce();
 const error = localError ?? globalError;
 return error ? <View accessibilityRole="alert" className="mb-4 rounded-xl border border-primary p-4"><Text className="font-sans text-primary">{error}</Text></View> : null;
}
