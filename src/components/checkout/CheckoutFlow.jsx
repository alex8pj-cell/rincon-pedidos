import { useState } from 'react'
import { useCart } from '../../context/cartStore'
import { useOrders } from '../../hooks/useOrders'
import { DELIVERY_ZONES } from '../../data/deliveryZones'
import { openWhatsApp } from '../../utils/whatsapp'

const ORDER_TYPES = [
  { key: 'domicilio',   label: 'Domicilio',   icon: '🚚', desc: 'Te lo llevamos a casa' },
  { key: 'recoger',     label: 'Recoger',     icon: '🏃', desc: 'Pasas por tu pedido' },
  { key: 'para-llevar', label: 'Para llevar', icon: '🥡', desc: 'Lo preparamos para llevar' },
  { key: 'mesa',        label: 'En mesa',     icon: '🪑', desc: 'Pedido en el restaurante' },
]
const PAYMENT_METHODS = [
  { key: 'efectivo',      label: 'Efectivo',      icon: '💵', desc: 'Pago al recibir' },
  { key: 'tarjeta',       label: 'Tarjeta',       icon: '💳', desc: 'Débito o crédito' },
  { key: 'transferencia', label: 'Transferencia', icon: '📲', desc: 'SPEI / depósito' },
]
const STEP_LABELS = ['Tipo', 'Detalles', 'Datos', 'Pago', 'Resumen']

// ── Helpers de estilo ──────────────────────────────────────────────────────────
const panel  = { background: '#111', border: '1px solid rgba(255,184,0,0.2)' }
const input  = { background: '#1a1a1a', border: '1px solid rgba(255,184,0,0.25)', color: '#fff' }

function DarkInput({ ...props }) {
  return (
    <input
      {...props}
      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30
                 focus:outline-none transition-all"
      style={input}
      onFocus={e => e.target.style.borderColor = '#FFB800'}
      onBlur={e  => e.target.style.borderColor = 'rgba(255,184,0,0.25)'}
    />
  )
}
function DarkTextarea({ ...props }) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30
                 focus:outline-none resize-none transition-all"
      style={input}
      onFocus={e => e.target.style.borderColor = '#FFB800'}
      onBlur={e  => e.target.style.borderColor = 'rgba(255,184,0,0.25)'}
    />
  )
}
function SectionTitle({ children }) {
  return <h3 className="text-base font-black text-white mb-3">{children}</h3>
}

// ── Pasos ──────────────────────────────────────────────────────────────────────

function StepOrderType({ value, onChange }) {
  return (
    <div>
      <SectionTitle>¿Cómo quieres tu pedido?</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {ORDER_TYPES.map(t => (
          <button key={t.key} onClick={() => onChange(t.key)}
            className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl transition-all"
            style={value === t.key
              ? { background: 'rgba(255,184,0,0.12)', border: '2px solid #FFB800', boxShadow: '0 0 16px rgba(255,184,0,0.25)' }
              : { background: '#1a1a1a', border: '2px solid rgba(255,184,0,0.15)' }
            }
          >
            <span className="text-3xl">{t.icon}</span>
            <span className={`font-black text-sm ${value === t.key ? 'text-brand-gold' : 'text-white'}`}>{t.label}</span>
            <span className="text-white/40 text-xs text-center leading-tight">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepDetails({ orderType, zone, setZone, tableNumber, setTableNumber }) {
  if (orderType === 'mesa') return (
    <div>
      <SectionTitle>¿En qué mesa estás?</SectionTitle>
      <DarkInput value={tableNumber} onChange={e => setTableNumber(e.target.value)}
        placeholder="Ej: Mesa 4, Terraza 2..." />
    </div>
  )

  if (orderType === 'domicilio') return (
    <div>
      <SectionTitle>Selecciona tu zona de entrega</SectionTitle>
      <div className="space-y-2">
        {DELIVERY_ZONES.map(z => (
          <button key={z.id} onClick={() => setZone(z)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left"
            style={zone?.id === z.id
              ? { background: 'rgba(255,184,0,0.12)', border: '2px solid #FFB800' }
              : { background: '#1a1a1a', border: '2px solid rgba(255,184,0,0.15)' }
            }
          >
            <span className="text-2xl">{z.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-black text-sm ${zone?.id === z.id ? 'text-brand-gold' : 'text-white'}`}>{z.name}</p>
              <p className="text-white/40 text-xs truncate">{z.description}</p>
            </div>
            <span className="font-black text-sm text-brand-gold whitespace-nowrap">+${z.cost.toFixed(2)}</span>
          </button>
        ))}
      </div>
    </div>
  )

  const t = ORDER_TYPES.find(t => t.key === orderType)
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <span className="text-6xl">{t?.icon}</span>
      <p className="font-black text-white text-lg">{t?.label}</p>
      <p className="text-white/40 text-sm text-center">{t?.desc}</p>
      <p className="text-brand-gold text-sm font-bold">¡Listo! Continúa →</p>
    </div>
  )
}

function StepCustomerInfo({ orderType, form, setForm }) {
  const fields = [
    { key: 'name',    label: 'Nombre completo',     placeholder: 'Juan García',         required: true },
    { key: 'phone',   label: 'Teléfono',             placeholder: '773 123 4567',        required: true, type: 'tel' },
    ...(orderType === 'domicilio' ? [{ key: 'address', label: 'Dirección completa', placeholder: 'Calle, número, colonia…', required: true, area: true }] : []),
    { key: 'note',    label: 'Nota del pedido',      placeholder: 'Sin picante, alérgico a…', area: true },
  ]
  return (
    <div className="space-y-4">
      <SectionTitle>Tus datos</SectionTitle>
      {fields.map(f => (
        <div key={f.key}>
          <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-1.5">
            {f.label}{f.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          {f.area
            ? <DarkTextarea value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={2} />
            : <DarkInput type={f.type||'text'} value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} />
          }
        </div>
      ))}
    </div>
  )
}

function StepPayment({ value, onChange }) {
  return (
    <div>
      <SectionTitle>¿Cómo vas a pagar?</SectionTitle>
      <div className="space-y-3">
        {PAYMENT_METHODS.map(m => (
          <button key={m.key} onClick={() => onChange(m.key)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-left"
            style={value === m.key
              ? { background: 'rgba(255,184,0,0.12)', border: '2px solid #FFB800', boxShadow: '0 0 16px rgba(255,184,0,0.2)' }
              : { background: '#1a1a1a', border: '2px solid rgba(255,184,0,0.15)' }
            }
          >
            <span className="text-3xl">{m.icon}</span>
            <div>
              <p className={`font-black text-sm ${value === m.key ? 'text-brand-gold' : 'text-white'}`}>{m.label}</p>
              <p className="text-white/40 text-xs">{m.desc}</p>
            </div>
            {value === m.key && <span className="ml-auto text-brand-gold text-xl font-black">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepSummary({ cart, orderType, zone, tableNumber, customerInfo, paymentMethod, total, onConfirm, loading }) {
  const ot = ORDER_TYPES.find(t => t.key === orderType)
  const pm = PAYMENT_METHODS.find(m => m.key === paymentMethod)
  const dc = zone?.cost ?? 0

  return (
    <div className="space-y-4">
      <SectionTitle>Resumen del pedido</SectionTitle>

      {/* Productos */}
      <div className="rounded-2xl p-4 space-y-2" style={panel}>
        {cart.map(item => (
          <div key={item.cartKey}>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">{item.name} <span className="text-white/40">×{item.qty}</span></span>
              <span className="text-white font-bold">${(item.price*item.qty).toFixed(2)}</span>
            </div>
            {item.note && <p className="text-xs text-black font-semibold bg-brand-gold rounded px-1.5 ml-2 mt-0.5 inline-block">✏️ {item.note}</p>}
          </div>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,184,0,0.15)', paddingTop: '8px', marginTop: '8px' }}>
          {dc > 0 && (
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>Envío ({zone?.name})</span><span>+${dc.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-base">
            <span className="text-white">Total</span>
            <span className="text-brand-gold">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="rounded-2xl p-4 space-y-2 text-sm" style={panel}>
        {[
          ['Cliente',   customerInfo.name],
          ['Teléfono',  customerInfo.phone],
          ['Tipo',      `${ot?.icon} ${ot?.label}`],
          orderType === 'domicilio' && ['Dirección', customerInfo.address],
          orderType === 'mesa'      && ['Mesa',      tableNumber],
          ['Pago',      `${pm?.icon} ${pm?.label}`],
          customerInfo.note && ['Nota', customerInfo.note],
        ].filter(Boolean).map(([k,v]) => (
          <div key={k} className="flex justify-between gap-4">
            <span className="text-white/40 shrink-0">{k}</span>
            <span className="text-white text-right">{v}</span>
          </div>
        ))}
      </div>

      {/* WhatsApp aviso */}
      <div className="rounded-2xl px-4 py-3 flex gap-3 items-start"
           style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)' }}>
        <span className="text-xl mt-0.5">💬</span>
        <p className="text-xs text-green-300 leading-relaxed">
          Al confirmar se registra el pedido y se abre <strong>WhatsApp</strong> con el resumen listo para enviar.
        </p>
      </div>

      <button onClick={onConfirm} disabled={loading}
        className="w-full font-black py-4 rounded-2xl transition-all text-base disabled:opacity-40"
        style={{ background: '#25D366', color: '#fff', boxShadow: loading ? 'none' : '0 0 20px rgba(37,211,102,0.4)' }}
      >
        {loading ? 'Enviando…' : '✅ Confirmar y abrir WhatsApp'}
      </button>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function CheckoutFlow({ open, onClose }) {
  const { cart, subtotal, clearCart } = useCart()
  const { createOrder } = useOrders()

  const [step, setStep]             = useState(0)
  const [orderType, setOrderType]   = useState(null)
  const [zone, setZone]             = useState(null)
  const [tableNumber, setTableNumber] = useState('')
  const [customerInfo, setCustomerInfo] = useState({ name:'', phone:'', address:'', note:'' })
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [loading, setLoading]       = useState(false)

  const deliveryCost = orderType === 'domicilio' ? (zone?.cost ?? 0) : 0
  const total        = subtotal + deliveryCost

  function canAdvance() {
    if (step === 0) return !!orderType
    if (step === 1) {
      if (orderType === 'domicilio') return !!zone
      if (orderType === 'mesa')      return tableNumber.trim().length > 0
      return true
    }
    if (step === 2) return customerInfo.name.trim() && customerInfo.phone.trim() &&
      (orderType !== 'domicilio' || customerInfo.address.trim())
    if (step === 3) return !!paymentMethod
    return true
  }

  function handleClose() {
    setStep(0); setOrderType(null); setZone(null); setTableNumber('')
    setCustomerInfo({ name:'', phone:'', address:'', note:'' }); setPaymentMethod(null)
    onClose()
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      await createOrder({
        customerName: customerInfo.name, phone: customerInfo.phone,
        address: customerInfo.address || '', note: customerInfo.note || '',
        tableNumber: tableNumber || '', orderType,
        zone: zone ? { id:zone.id, name:zone.name, cost:zone.cost } : null,
        deliveryCost, paymentMethod,
        items: cart.map(i => ({ id:i.id, name:i.name, price:i.price, qty:i.qty, note:i.note||'' })),
        total,
      })
      openWhatsApp({
        customerName: customerInfo.name, phone: customerInfo.phone,
        items: cart, orderType, zone, deliveryCost,
        address: customerInfo.address, tableNumber, paymentMethod, total, note: customerInfo.note,
      })
      clearCart(); handleClose()
    } finally { setLoading(false) }
  }

  if (!open) return null

  const steps = [
    <StepOrderType key="type" value={orderType} onChange={v => { setOrderType(v); setZone(null) }} />,
    <StepDetails   key="det"  orderType={orderType} zone={zone} setZone={setZone} tableNumber={tableNumber} setTableNumber={setTableNumber} />,
    <StepCustomerInfo key="info" orderType={orderType} form={customerInfo} setForm={setCustomerInfo} />,
    <StepPayment   key="pay"  value={paymentMethod} onChange={setPaymentMethod} />,
    <StepSummary   key="sum"  cart={cart} orderType={orderType} zone={zone} tableNumber={tableNumber}
      customerInfo={customerInfo} paymentMethod={paymentMethod} total={total} onConfirm={handleConfirm} loading={loading} />,
  ]

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col
                      max-h-[92dvh] sm:max-h-[85vh] overflow-hidden"
           style={{ background: '#0a0a0a', border: '1px solid rgba(255,184,0,0.25)' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 shrink-0"
             style={{ borderBottom: '1px solid rgba(255,184,0,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-white">Finalizar pedido</h2>
              <p className="text-xs text-white/40">El Rincón de Las Delicias</p>
            </div>
            <button onClick={handleClose}
                    className="text-white/40 hover:text-brand-gold text-3xl leading-none transition-colors">
              &times;
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="flex gap-1.5">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="h-1 w-full rounded-full transition-all duration-300"
                     style={{ background: i <= step ? '#FFB800' : 'rgba(255,255,255,0.1)' }} />
                <span className="text-[10px] font-bold"
                      style={{ color: i === step ? '#FFB800' : i < step ? 'rgba(255,184,0,0.5)' : 'rgba(255,255,255,0.2)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-5 py-5">{steps[step]}</div>

        {/* Navegación */}
        {step < 4 && (
          <div className="px-5 py-4 shrink-0 flex gap-3"
               style={{ borderTop: '1px solid rgba(255,184,0,0.15)' }}>
            {step > 0 && (
              <button onClick={() => setStep(s=>s-1)}
                      className="flex-1 font-bold py-3 rounded-2xl text-white/60 hover:text-white transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                ← Atrás
              </button>
            )}
            <button onClick={() => setStep(s=>s+1)} disabled={!canAdvance()}
                    className="flex-[2] font-black py-3 rounded-2xl transition-all"
                    style={canAdvance()
                      ? { background: '#FFB800', color: '#000', boxShadow: '0 0 16px rgba(255,184,0,0.35)' }
                      : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }
                    }>
              {step === 3 ? 'Ver resumen →' : 'Continuar →'}
            </button>
          </div>
        )}
        {step === 4 && (
          <div className="px-5 pb-4 shrink-0">
            <button onClick={() => setStep(3)} className="w-full text-sm text-white/30 hover:text-white/60 py-2">
              ← Modificar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
