import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import config from '../../public-config.json';
import { createCommerceApi } from '../../../shared/commerce-api';

export const siteUrl = config.siteUrl;
export const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey);
export const client = configured ? createClient(config.supabaseUrl, config.supabasePublishableKey, {
 auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce', lock: processLock },
}) : null;
export function requireClient() {
 if (!client) throw new Error('The store connection is not ready. Please try again later.');
 return client;
}
export const api = createCommerceApi(client, `${siteUrl}/api/commerce`);
