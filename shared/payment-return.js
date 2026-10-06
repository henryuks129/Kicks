// Fixed app destination: never accept a client-supplied redirect URL.
export const mobilePaymentReturnUrl = 'com.kicks.shop://checkout?paymentReturn=1';

export function paymentCallbackUrl(origin, platform) {
 const callback = new URL('/payment/callback', origin);
 if (platform === 'mobile') callback.searchParams.set('platform', 'mobile');
 return callback.toString();
}
