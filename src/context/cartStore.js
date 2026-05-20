// Lógica pura del carrito: contexto, reducer y hook.
// Separado del CartProvider (componente) para satisfacer React Fast Refresh.
import { createContext, useContext } from 'react'

export const EMPTY_CART = {
  cart: [], subtotal: 0, itemCount: 0,
  addItem: () => {}, removeItem: () => {}, updateQty: () => {},
  updateNote: () => {}, clearCart: () => {},
}

export const CartContext = createContext(EMPTY_CART)

export function makeKey(id, note = '') {
  return `${id}__${note.trim().toLowerCase()}`
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, note = '' } = action
      const key = makeKey(item.id, note)
      const existing = state.find(i => i.cartKey === key)
      if (existing) {
        return state.map(i => i.cartKey === key ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...state, { ...item, note: note.trim(), cartKey: key, qty: 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.cartKey !== action.cartKey)
    case 'UPDATE_QTY':
      return state
        .map(i => i.cartKey === action.cartKey ? { ...i, qty: action.qty } : i)
        .filter(i => i.qty > 0)
    case 'UPDATE_NOTE':
      return state.map(i =>
        i.cartKey === action.cartKey
          ? { ...i, note: action.note, cartKey: makeKey(i.id, action.note) }
          : i
      )
    case 'CLEAR_CART':
      return []
    default:
      return state
  }
}

// Hook — solo exporta una función, no un componente → Fast Refresh OK
export function useCart() {
  return useContext(CartContext)
}
