import { useReducer } from 'react'
import { CartContext, cartReducer } from './cartStore'

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [])

  const addItem    = (item, note = '', selectedCustomizations = {}) =>
    dispatch({ type: 'ADD_ITEM', item, note, selectedCustomizations })
  const removeItem = (cartKey) => dispatch({ type: 'REMOVE_ITEM', cartKey })
  const updateQty  = (cartKey, qty) => dispatch({ type: 'UPDATE_QTY', cartKey, qty })
  const clearCart  = () => dispatch({ type: 'CLEAR_CART' })

  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const itemCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{
      cart, addItem, removeItem, updateQty,
      clearCart, subtotal, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  )
}
