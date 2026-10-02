export const GUEST_CART_KEY = 'kicks.guest-cart'

export function persistGuestCart(items, storage = localStorage) {
  storage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function readGuestCart(storage = localStorage) {
  try {
    const items = JSON.parse(storage.getItem(GUEST_CART_KEY) || '[]')
    return Array.isArray(items) ? items.filter(item =>
      typeof item.id === 'string' && typeof item.key === 'string' &&
      (typeof item.size === 'string' || typeof item.size === 'number') &&
      Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 10
    ) : []
  } catch { return [] }
}

// Keep the larger quantity when the same size is already saved to an account.
// This makes a repeated sign-in merge safe after a network interruption.
export function mergeGuestCart(guest, saved, products) {
  return guest.flatMap(item => {
    const variant = products.find(product => product.id === item.id)?.variants.find(v => v.id === item.key && v.size === item.size)
    if (!variant || variant.stock <= 0) return []
    return [{ ...item, qty: Math.min(10, variant.stock, Math.max(item.qty, saved.find(row => row.key === item.key)?.qty || 0)) }]
  })
}
