export type Variant = { id: string; product_id: string; size: number; stock: number };
export type Product = { id: string; brand: string; name: string; color: string; category?: string; description: string; image: string; gallery?: string[]; price_kobo: number; product_variants: Variant[] };
export type CartItem = { id: string; key: string; size: number; qty: number };
export type Profile = { name: string; phone: string; address: string };
export const money = (kobo: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);
