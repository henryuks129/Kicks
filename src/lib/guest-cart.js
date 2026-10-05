import { parseGuestCart } from '../../shared/guest-cart.js'
export { mergeGuestCart } from '../../shared/guest-cart.js'
export const GUEST_CART_KEY = 'kicks.guest-cart'

export function persistGuestCart(items, storage = localStorage) {
  storage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function readGuestCart(storage = localStorage) {
  try {
    return parseGuestCart(storage.getItem(GUEST_CART_KEY))
  } catch { return [] }
}
