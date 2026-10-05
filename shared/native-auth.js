export const NATIVE_AUTH_CALLBACK = 'com.kicks.shop://auth/callback';
export function callbackCode(url) {
 const parsed = new URL(url);
 if (`${parsed.protocol}//${parsed.host}${parsed.pathname}` !== NATIVE_AUTH_CALLBACK) return null;
 if (parsed.searchParams.has('error')) throw new Error('Google sign-in could not be completed. Try again.');
 return parsed.searchParams.get('code');
}
export function createLoginCompleter(getClient) {
 const consumed = new Set();
 let exchanging = Promise.resolve();
 return async url => {
  const code = callbackCode(url);
  if (!code) return;
  const current = exchanging.then(async () => {
   if (consumed.has(code)) return;
   consumed.add(code);
   const { error } = await getClient().auth.exchangeCodeForSession(code);
   if (error) throw error;
  });
  exchanging = current.catch(() => {});
  await current;
 };
}
