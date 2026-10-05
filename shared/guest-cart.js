export function parseGuestCart(value) {
 try {
  const items = JSON.parse(value || '[]');
  return Array.isArray(items) ? items.filter(item => item && typeof item.id === 'string' && typeof item.key === 'string' &&
   (typeof item.size === 'string' || typeof item.size === 'number') && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 10) : [];
 } catch { return []; }
}
// Preserve the larger quantity so retrying a sign-in never doubles a bag.
export function mergeGuestCart(guest, saved, products) {
 return guest.flatMap(item => {
  const variant = products.find(product => product.id === item.id)?.variants.find(row => row.id === item.key && row.size === item.size);
  if (!variant || variant.stock <= 0) return [];
  return [{ ...item, qty: Math.min(10, variant.stock, Math.max(item.qty, saved.find(row => row.key === item.key)?.qty || 0)) }];
 });
}
