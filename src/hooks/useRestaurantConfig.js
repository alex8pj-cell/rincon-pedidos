import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { DELIVERY_ZONES } from '../data/deliveryZones'

const DEFAULTS = {
  name:          'El Rincón de Las Delicias',
  coverUrl:      '',
  logoUrl:       '',
  phone:         '527731477760',
  deliveryZones: DELIVERY_ZONES,
  orderTypes: [
    { key: 'domicilio',   label: 'A domicilio',     icon: '🚚', enabled: true },
    { key: 'recoger',     label: 'Para recoger',    icon: '🏃', enabled: true },
    { key: 'para-llevar', label: 'Para llevar',     icon: '🥡', enabled: true },
    { key: 'mesa',        label: 'Para comer aquí', icon: '🪑', enabled: true },
  ],
}

export function useRestaurantConfig() {
  const [config, setConfig] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'restaurant'), snap => {
      if (snap.exists()) {
        setConfig(c => ({
          ...c,
          ...snap.data(),
          deliveryZones: snap.data().deliveryZones ?? c.deliveryZones,
          orderTypes:    snap.data().orderTypes    ?? c.orderTypes,
        }))
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function updateConfig(data) {
    await setDoc(doc(db, 'config', 'restaurant'), data, { merge: true })
  }

  return { config, loading, updateConfig }
}
