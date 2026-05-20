import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAt_U2TdlvYBa7rxajlZ0v_aTyBvpnyjvY",
  authDomain: "rincon-pedidos.firebaseapp.com",
  projectId: "rincon-pedidos",
  storageBucket: "rincon-pedidos.firebasestorage.app",
  messagingSenderId: "238294425433",
  appId: "1:238294425433:web:2d772d70288c4383187648"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export default app
