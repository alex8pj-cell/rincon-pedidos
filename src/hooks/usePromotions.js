import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'

export function usePromotions(onlyActive = true) {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    let q = query(collection(db, 'promotions'), orderBy('order'))
    if (onlyActive) {
      q = query(
        collection(db, 'promotions'),
        where('active', '==', true),
        orderBy('order')
      )
    }
    const unsub = onSnapshot(q, snap => {
      setPromotions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [onlyActive])

  return { promotions, loading }
}
