import { createContext, useContext } from 'react'

export const EMPTY_CART = {
  cart: [], subtotal: 0, itemCount: 0,
  addItem: () => {}, removeItem: () => {}, updateQty: () => {},
  updateNote: () => {}, clearCart: () => {},
}

export const CartContext = createContext(EMPTY_CART)

// Key única por ítem + nota + personalizaciones seleccionadas
export function makeKey(id, note = '', customizations = {}) {
  return `${id}__${note.trim().toLowerCase()}__${JSON.stringify(customizations)}`
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, note = '', selectedCustomizations = {} } = action
      const key = makeKey(item.id, note, selectedCustomizations)
      const existing = state.find(i => i.cartKey === key)
      if (existing) {
        return state.map(i => i.cartKey === key ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...state, {
        ...item,
        note: note.trim(),
        selectedCustomizations,
        cartKey: key,
        qty: 1,
      }]
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.cartKey !== action.cartKey)
    case 'UPDATE_QTY':
      return state
        .map(i => i.cartKey === action.cartKey ? { ...i, qty: action.qty } : i)
        .filter(i => i.qty > 0)
    case 'CLEAR_CART':
      return []
    default:
      return state
  }
}

export function useCart() {
  return useContext(CartContext)
}
