export function errorMessage(error) {
 return typeof error?.message === 'string' && error.message.trim() ? error.message : 'We could not complete this action. Check your connection and try again.';
}

export async function updateProfile(client, userId, profile) {
 const { data, error } = await client.from('profiles').update({
  name: profile.name.trim(), phone: profile.phone.trim(), address: profile.address.trim(),
 }).eq('id', userId).select('id').maybeSingle();
 if (error) throw error;
 if (!data) throw new Error('Your account profile is unavailable. Sign out and sign in again before checkout.');
}
