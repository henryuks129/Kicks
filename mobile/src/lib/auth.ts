import * as WebBrowser from 'expo-web-browser';
import { requireClient } from './client';
import { createLoginCompleter, NATIVE_AUTH_CALLBACK } from '../../../shared/native-auth';

export const redirectTo = NATIVE_AUTH_CALLBACK;
export const completeLogin = createLoginCompleter(requireClient);
export async function login() {
 const { data, error } = await requireClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } });
 if (error) throw error;
 const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
 if (result.type === 'success') await completeLogin(result.url);
}
