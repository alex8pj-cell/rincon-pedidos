import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'

export function useTables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'tables'), orderBy('name'))
    const unsub = onSnapshot(q, snap => {
      setTables(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  async function createTable({ name, seats = 4, posX = 0, posY = 0 }) {
    return addDoc(collection(db, 'tables'), {
      name, seats: Number(seats), posX, posY,
      status: 'available',
      account: { items: [], total: 0, openedAt: null },
      createdAt: serverTimestamp(),
    })
  }

  async function updateTablePosition(id, posX, posY) {
    return updateDoc(doc(db, 'tables', id), { posX, posY })
  }

  async function updateTableInfo(id, data) {
    return updateDoc(doc(db, 'tables', id), data)
  }

  async function deleteTable(id) {
    return deleteDoc(doc(db, 'tables', id))
  }

  async function addItemToTable(tableId, item) {
    const ref  = doc(db, 'tables', tableId)
    const snap = await getDoc(ref)
    const data = snap.data()
    const items = data.account?.items ?? []

    // Key único = id + customizations + note
    const key = `${item.id}__${JSON.stringify(item.selectedCustomizations ?? {})}__${item.note ?? ''}`
    const existing = items.find(i => i._key === key)

    const newItems = existing
      ? items.map(i => i._key === key ? { ...i, qty: i.qty + item.qty } : i)
      : [...items, { ...item, _key: key }]

    const total = newItems.reduce((s, i) => s + i.price * i.qty, 0)

    return updateDoc(ref, {
      status: 'occupied',
      'account.items':    newItems,
      'account.total':    total,
      'account.openedAt': data.account?.openedAt ?? serverTimestamp(),
    })
  }

  async function removeItemFromTable(tableId, key) {
    const ref  = doc(db, 'tables', tableId)
    const snap = await getDoc(ref)
    const items = (snap.data().account?.items ?? []).filter(i => i._key !== key)
    const total = items.reduce((s, i) => s + i.price * i.qty, 0)
    return updateDoc(ref, {
      'account.items': items,
      'account.total': total,
      status: items.length > 0 ? 'occupied' : 'available',
    })
  }

  async function closeTableAccount(tableId) {
    return updateDoc(doc(db, 'tables', tableId), {
      status: 'available',
      account: { items: [], total: 0, openedAt: null },
    })
  }

  return {
    tables, loading,
    createTable, updateTablePosition, updateTableInfo, deleteTable,
    addItemToTable, removeItemFromTable, closeTableAccount,
  }
}
