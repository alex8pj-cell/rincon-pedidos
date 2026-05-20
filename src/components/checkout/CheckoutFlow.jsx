import { useState } from 'react'
import { useCart } from '../../context/cartStore'
import { useOrders } from '../../hooks/useOrders'
import { DELIVERY_ZONES } from '../../data/deliveryZones'
import { openWhatsApp } from '../../utils/whatsapp'

// ─── Constantes ───────────────────────────────────────────────────────────────

const ORDER_TYPES = [
  { key: 'domicilio',    label: 'Domicilio',    icon: '🚚', desc: 'Te lo llevamos a casa' },
  { key: 'recoger',      label: 'Recoger',      icon: '🏃', desc: 'Pasas por tu pedido' },
  { key: 'para-llevar',  label: 'Para llevar',  icon: '🥡', desc: 'Lo preparamos para llevar' },
  { key: 'mesa',         label: 'En mesa',      icon: '🪑', desc: 'Pedido en el restaurante' },
]

const PAYMENT_METHODS = [
  { key: 'efectivo',      label: 'Efectivo',      icon: '💵', desc: 'Pago al recibir' },
  { key: 'tarjeta',       label: 'Tarjeta',       icon: '💳', desc: 'Débito o crédito' },
  { key: 'transferencia', label: 'Transferencia', icon: '📲', desc: 'SPEI / depósito' },
]

const STEP_LABELS = ['Tipo', 'Detalles', 'Datos', 'Pago', 'Resumen']

// ─── Componentes de paso ──────────────────────────────────────────────────────

function StepOrderType({ value, onChange }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-gray-900">¿Cómo quieres tu pedido?</h3>
      <div className="grid grid-cols-2 gap-3">
        {ORDER_TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl border-2 transition-all ${
              value === t.key
                ? 'border-amber-500 bg-amber-50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-amber-200'
            }`}
          >
            <span className="text-3xl">{t.icon}</span>
            <span className="font-bold text-gray-900 text-sm">{t.label}</span>
            <span className="text-gray-400 text-xs text-center leading-tight">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepDetails({ orderType, zone, setZone, tableNumber, setTableNumber }) {
  if (orderType === 'mesa') {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900">¿En qué mesa estás?</h3>
        <input
          type="text"
          value={tableNumber}
          onChange={e => setTableNumber(e.target.value)}
          placeholder="Ej: Mesa 4, Terraza 2..."
          className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm
                     focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
      </div>
    )
  }

  if (orderType === 'domicilio') {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900">Selecciona tu zona</h3>
        <div className="space-y-2">
          {DELIVERY_ZONES.map(z => (
            <button
              key={z.id}
              onClick={() => setZone(z)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                zone?.id === z.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-100 bg-white hover:border-amber-200'
              }`}
            >
              <span className="text-2xl">{z.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{z.name}</p>
                <p className="text-gray-400 text-xs truncate">{z.description}</p>
              </div>
              <span className={`font-bold text-sm whitespace-nowrap ${
                zone?.id === z.id ? 'text-amber-600' : 'text-gray-500'
              }`}>
                +${z.cost.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <span className="text-5xl">{ORDER_TYPES.find(t => t.key === orderType)?.icon}</span>
      <p className="font-bold text-gray-900">
        {ORDER_TYPES.find(t => t.key === orderType)?.label}
      </p>
      <p className="text-gray-400 text-sm text-center">
        {ORDER_TYPES.find(t => t.key === orderType)?.desc}
      </p>
    </div>
  )
}

function StepCustomerInfo({ orderType, form, setForm }) {
  const fields = [
    { key: 'name',    label: 'Nombre completo',  placeholder: 'Juan García',           required: true },
    { key: 'phone',   label: 'Teléfono',          placeholder: '773 123 4567',          required: true, type: 'tel' },
    ...(orderType === 'domicilio'
      ? [{ key: 'address', label: 'Dirección completa', placeholder: 'Calle, número, colonia…', required: true }]
      : []
    ),
    { key: 'note', label: 'Nota general del pedido', placeholder: 'Sin picante, alérgico a…', required: false },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Tus datos</h3>
      {fields.map(f => (
        <div key={f.key}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {f.label}
            {f.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {f.key === 'address' || f.key === 'note' ? (
            <textarea
              value={form[f.key] || ''}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              rows={2}
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm
                         focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100
                         resize-none"
            />
          ) : (
            <input
              type={f.type || 'text'}
              value={form[f.key] || ''}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm
                         focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          )}
        </div>
      ))}
    </div>
  )
}

function StepPayment({ value, onChange }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-gray-900">¿Cómo vas a pagar?</h3>
      <div className="space-y-3">
        {PAYMENT_METHODS.map(m => (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all text-left ${
              value === m.key
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-100 bg-white hover:border-amber-200'
            }`}
          >
            <span className="text-3xl">{m.icon}</span>
            <div>
              <p className="font-bold text-gray-900 text-sm">{m.label}</p>
              <p className="text-gray-400 text-xs">{m.desc}</p>
            </div>
            {value === m.key && (
              <span className="ml-auto text-amber-500 text-xl">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepSummary({ cart, orderType, zone, tableNumber, customerInfo, paymentMethod, total, onConfirm, loading }) {
  const orderTypeData = ORDER_TYPES.find(t => t.key === orderType)
  const paymentData   = PAYMENT_METHODS.find(m => m.key === paymentMethod)
  const deliveryCost  = zone?.cost ?? 0

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Resumen del pedido</h3>

      {/* Productos */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
        {cart.map(item => (
          <div key={item.cartKey}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
              <span className="font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
            </div>
            {item.note && (
              <p className="text-xs text-amber-700 ml-2 mt-0.5">✏️ {item.note}</p>
            )}
          </div>
        ))}
        <div className="border-t pt-2 mt-1 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>${(total - deliveryCost).toFixed(2)}</span>
          </div>
          {deliveryCost > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Envío ({zone?.name})</span>
              <span>+${deliveryCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span className="text-amber-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
        <Row label="Cliente"  value={customerInfo.name} />
        <Row label="Teléfono" value={customerInfo.phone} />
        <Row label="Tipo"     value={`${orderTypeData?.icon} ${orderTypeData?.label}`} />
        {orderType === 'domicilio' && <Row label="Dirección" value={customerInfo.address} />}
        {orderType === 'mesa'      && <Row label="Mesa"      value={tableNumber} />}
        <Row label="Pago"     value={`${paymentData?.icon} ${paymentData?.label}`} />
        {customerInfo.note && <Row label="Nota" value={customerInfo.note} />}
      </div>

      {/* Aviso WhatsApp */}
      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
        <span className="text-xl mt-0.5">💬</span>
        <p className="text-xs text-green-800 leading-relaxed">
          Al confirmar, tu pedido se registra en el sistema y se abrirá <strong>WhatsApp</strong> con el resumen listo para enviar.
        </p>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300
                   text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-sm"
      >
        {loading ? 'Enviando pedido…' : '✅ Confirmar y abrir WhatsApp'}
      </button>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CheckoutFlow({ open, onClose }) {
  const { cart, subtotal, clearCart } = useCart()
  const { createOrder } = useOrders()

  const [step, setStep]         = useState(0)
  const [orderType, setOrderType] = useState(null)
  const [zone, setZone]         = useState(null)
  const [tableNumber, setTableNumber] = useState('')
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', note: '' })
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [loading, setLoading]   = useState(false)

  // Pasos dinámicos: si es recoger/para-llevar, el paso 1 (detalles) se muestra
  // pero sin campos → el usuario solo confirma y avanza.
  const needsDetails = orderType === 'domicilio' || orderType === 'mesa'

  const deliveryCost = orderType === 'domicilio' ? (zone?.cost ?? 0) : 0
  const total        = subtotal + deliveryCost

  // ── Validación por paso ─────────────────────────────────────
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

  function nextStep()   { setStep(s => s + 1) }
  function prevStep()   { setStep(s => s - 1) }

  function handleClose() {
    setStep(0); setOrderType(null); setZone(null)
    setTableNumber(''); setCustomerInfo({ name: '', phone: '', address: '', note: '' })
    setPaymentMethod(null)
    onClose()
  }

  // ── Confirmar pedido ────────────────────────────────────────
  async function handleConfirm() {
    setLoading(true)
    try {
      await createOrder({
        customerName: customerInfo.name,
        phone:        customerInfo.phone,
        address:      customerInfo.address || '',
        note:         customerInfo.note    || '',
        tableNumber:  tableNumber          || '',
        orderType,
        zone:         zone ? { id: zone.id, name: zone.name, cost: zone.cost } : null,
        deliveryCost,
        paymentMethod,
        items: cart.map(i => ({
          id: i.id, name: i.name, price: i.price, qty: i.qty, note: i.note || '',
        })),
        total,
      })

      // Abrir WhatsApp con el resumen
      openWhatsApp({
        customerName: customerInfo.name,
        phone:        customerInfo.phone,
        items:        cart,
        orderType,
        zone,
        deliveryCost,
        address:      customerInfo.address,
        tableNumber,
        paymentMethod,
        total,
        note:         customerInfo.note,
      })

      clearCart()
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  // ── Render ──────────────────────────────────────────────────
  const stepContent = [
    <StepOrderType key="type" value={orderType} onChange={v => { setOrderType(v); setZone(null) }} />,
    <StepDetails   key="det"  orderType={orderType} zone={zone} setZone={setZone}
                              tableNumber={tableNumber} setTableNumber={setTableNumber} />,
    <StepCustomerInfo key="info" orderType={orderType} form={customerInfo} setForm={setCustomerInfo} />,
    <StepPayment   key="pay"  value={paymentMethod} onChange={setPaymentMethod} />,
    <StepSummary   key="sum"
      cart={cart} orderType={orderType} zone={zone} tableNumber={tableNumber}
      customerInfo={customerInfo} paymentMethod={paymentMethod} total={total}
      onConfirm={handleConfirm} loading={loading}
    />,
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl
                      flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Finalizar pedido</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center">
              &times;
            </button>
          </div>

          {/* Indicador de pasos */}
          <div className="flex gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full transition-colors ${
                  i <= step ? 'bg-amber-500' : 'bg-gray-100'
                }`} />
                <span className={`text-[10px] font-medium ${
                  i === step ? 'text-amber-600' : i < step ? 'text-gray-400' : 'text-gray-300'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {stepContent[step]}
        </div>

        {/* Botones de navegación (ocultos en resumen porque tiene su propio botón) */}
        {step < 4 && (
          <div className="px-5 py-4 border-t shrink-0 flex gap-3 bg-white">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 border-2 border-gray-100 text-gray-600 font-semibold
                           py-3 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                ← Atrás
              </button>
            )}
            <button
              onClick={nextStep}
              disabled={!canAdvance()}
              className="flex-[2] bg-amber-500 hover:bg-amber-600
                         disabled:bg-gray-100 disabled:text-gray-300
                         text-white font-bold py-3 rounded-2xl transition-colors"
            >
              {step === 3 ? 'Ver resumen →' : 'Continuar →'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="px-5 pb-4 shrink-0">
            <button onClick={prevStep} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
              ← Modificar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
