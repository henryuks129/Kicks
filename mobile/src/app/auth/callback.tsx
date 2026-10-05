import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { completeLogin, redirectTo } from '../../lib/auth';
import { useCommerce } from '../../lib/store';
export default function Callback() {
 const { code, error } = useLocalSearchParams<{ code?: string; error?: string }>(), { setError } = useCommerce();
 useEffect(() => { if (error) { setError('Google sign-in could not be completed.'); router.replace('/account'); return; } if (!code) return; void completeLogin(`${redirectTo}?code=${encodeURIComponent(code)}`).then(() => router.replace('/account')).catch(() => { setError('Sign-in could not be completed. Please try again.'); router.replace('/account'); }); }, [code, error, setError]);
 return <View className="flex-1 items-center justify-center"><Text className="font-sans text-foreground">Completing your sign-in…</Text></View>;
}
