import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'

export function useMenu(onlyAvailable = true) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let q = query(collection(db, 'menu'), orderBy('category'))
    if (onlyAvailable) {
      q = query(collection(db, 'menu'), where('available', '==', true), orderBy('category'))
    }

    const unsub = onSnapshot(q,
      (snap) => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [onlyAvailable])

  const categories = [...new Set(items.map(i => i.category))]
  return { items, categories, loading, error }
}
