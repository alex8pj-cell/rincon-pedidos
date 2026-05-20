import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  async function createOrder(orderData) {
    return addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
  }

  async function updateStatus(orderId, status) {
    return updateDoc(doc(db, 'orders', orderId), { status })
  }

  return { orders, loading, createOrder, updateStatus }
}
