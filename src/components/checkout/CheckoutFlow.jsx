import { useState } from 'react'
import { useCart } from '../../context/cartStore'
import { useOrders } from '../../hooks/useOrders'
import { useRestaurantConfig } from '../../hooks/useRestaurantConfig'
import { openWhatsApp } from '../../utils/whatsapp'

const PAYMENT_METHODS = [
  { key: 'efectivo',      label: 'Efectivo',      icon: '💵', desc: 'Pago al recibir' },
  { key: 'tarjeta',       label: 'Tarjeta',       icon: '💳', desc: 'Débito o crédito' },
  { key: 'transferencia', label: 'Transferencia', icon: '📲', desc: 'SPEI / depósito' },
]

// ── Light-theme input helpers ─────────────────────────────────────────────────
function LField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#111111] mb-1.5">
        {label}
        {required && <span className="text-[#E8001C] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Step: Tipo de pedido (shown BEFORE the menu normally, but here as step 0) ─
function StepOrderType({ orderTypes, value, onChange }) {
  return (
    <div>
      <h3 className="text-base font-bold text-[#111111] mb-4">¿Cómo quieres tu pedido?</h3>
      <div className="grid grid-cols-2 gap-3">
        {orderTypes.filter(t => t.enabled).map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex flex-col items-center gap-2 py-5 px-3 rounded-2xl border-2 transition-all ${
              value === t.key
                ? 'border-[#FFB800] bg-[#FFF7E0]'
                : 'border-[#E5E7EB] bg-white hover:border-[#FFB800]/40'
            }`}
          >
            <span className="text-3xl">{t.icon}</span>
            <span className={`font-bold text-sm ${value === t.key ? 'text-[#111111]' : 'text-[#6B7280]'}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step: Datos del cliente ───────────────────────────────────────────────────
function StepInfo({ orderType, zone, setZone, deliveryZones, form, setForm }) {
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')
  const needsDelivery = orderType === 'domicilio'

  async function getLocation() {
    if (!navigator.geolocation) return setLocError('Tu navegador no soporta geolocalización.')
    setLocating(true); setLocError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        const url = `https://maps.google.com/?q=${latitude},${longitude}`
        setForm(p => ({ ...p, mapUrl: url, lat: latitude, lng: longitude }))
        setLocating(false)
      },
      () => { setLocError('No se pudo obtener la ubicación.'); setLocating(false) }
    )
  }

  const isDomicilio = orderType === 'domicilio'

  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-[#111111]">Tus datos</h3>

      <LField label="Nombre" required>
        <input className="field" placeholder="Juan García"
          value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </LField>

      {isDomicilio && (
        <LField label="Teléfono" required>
          <input className="field" type="tel" placeholder="773 123 4567"
            value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </LField>
      )}

      {isDomicilio && (
        <>
          {/* Zone */}
          <div>
            <p className="text-sm font-bold text-[#111111] mb-2">
              Zona de entrega <span className="text-[#E8001C]">*</span>
            </p>
            <div className="space-y-2">
              {deliveryZones.map(z => (
                <button key={z.id} onClick={() => setZone(z)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                    zone?.id === z.id
                      ? 'border-[#FFB800] bg-[#FFF7E0]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#FFB800]/40'
                  }`}
                >
                  <span className="text-xl">{z.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#111111]">{z.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">{z.description}</p>
                  </div>
                  <span className="font-bold text-sm text-[#111111] whitespace-nowrap">
                    +${z.cost.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <LField label="Dirección completa" required>
            <textarea className="field resize-none" rows={2}
              placeholder="Calle, número, colonia…"
              value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </LField>

          {/* Geolocation */}
          <div>
            <p className="text-sm font-bold text-[#111111] mb-2">Ubicación en mapa (opcional)</p>
            {form.mapUrl ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                <span className="text-green-600 text-lg">📍</span>
                <a href={form.mapUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-green-700 font-bold hover:underline flex-1 truncate">
                  Ver en Google Maps
                </a>
                <button onClick={() => setForm(p => ({ ...p, mapUrl: '', lat: null, lng: null }))}
                  className="text-xs text-[#6B7280] hover:text-[#E8001C]">✕</button>
              </div>
            ) : (
              <>
                <button onClick={getLocation} disabled={locating}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#E5E7EB] text-sm text-[#6B7280] font-bold hover:border-[#FFB800] hover:text-[#111111] transition-all disabled:opacity-50">
                  {locating ? 'Obteniendo ubicación…' : '📍 Capturar mi ubicación actual'}
                </button>
                {locError && <p className="text-xs text-[#E8001C] mt-1">{locError}</p>}
              </>
            )}
          </div>
        </>
      )}

      {/* General order note */}
      <LField label="Nota del pedido">
        <input className="field" placeholder="Sin picante, alérgico a…"
          value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
      </LField>
    </div>
  )
}

// ── Step: Pago ─────────────────────────────────────────────────────────────────
function StepPayment({ value, onChange }) {
  return (
    <div>
      <h3 className="text-base font-bold text-[#111111] mb-4">¿Cómo vas a pagar?</h3>
      <div className="space-y-3">
        {PAYMENT_METHODS.map(m => (
          <button key={m.key} onClick={() => onChange(m.key)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all ${
              value === m.key
                ? 'border-[#FFB800] bg-[#FFF7E0]'
                : 'border-[#E5E7EB] bg-white hover:border-[#FFB800]/40'
            }`}
          >
            <span className="text-3xl">{m.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#111111]">{m.label}</p>
              <p className="text-xs text-[#6B7280]">{m.desc}</p>
            </div>
            {value === m.key && (
              <span className="w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center text-[10px] font-bold text-[#111111]">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step: Resumen ─────────────────────────────────────────────────────────────
function StepSummary({ cart, orderType, zone, form, paymentMethod, total, onConfirm, loading }) {
  const dc = zone?.cost ?? 0
  const pm = PAYMENT_METHODS.find(m => m.key === paymentMethod)

  const metaRows = [
    ['Cliente',    form.name],
    form.phone && ['Teléfono', form.phone],
    orderType === 'domicilio' && ['Dirección', form.address],
    orderType === 'domicilio' && zone && ['Zona', `${zone.name} (+$${dc.toFixed(2)})`],
    ['Pago', pm ? `${pm.icon} ${pm.label}` : '–'],
    form.note && ['Nota', form.note],
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-[#111111]">Resumen del pedido</h3>

      {/* Products */}
      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden">
        {cart.map((item, idx) => (
          <div key={item.cartKey}
            className={`px-4 py-3 ${idx < cart.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
            <div className="flex justify-between text-sm">
              <span className="text-[#111111] font-medium">{item.name} <span className="text-[#6B7280]">×{item.qty}</span></span>
              <span className="font-bold text-[#111111]">${(item.price * item.qty).toFixed(2)}</span>
            </div>
            {item.note && (
              <p className="text-xs text-[#111111] font-medium bg-[#FFF7E0] border border-[#FFB800]/30 rounded px-2 py-0.5 mt-1 inline-block">
                ✏️ {item.note}
              </p>
            )}
          </div>
        ))}
        <div className="px-4 py-3 bg-[#F9FAFB] border-t border-[#E5E7EB]">
          {dc > 0 && (
            <div className="flex justify-between text-xs text-[#6B7280] mb-1">
              <span>Envío ({zone?.name})</span>
              <span>+${dc.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base">
            <span className="text-[#111111]">Total</span>
            <span className="text-[#111111]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Meta details */}
      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden">
        {metaRows.map(([k, v], i) => (
          <div key={k}
            className={`flex justify-between gap-4 px-4 py-2.5 text-sm ${i < metaRows.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
            <span className="text-[#6B7280] shrink-0">{k}</span>
            <span className="text-[#111111] text-right">{v}</span>
          </div>
        ))}
      </div>

      {/* WhatsApp notice */}
      <div className="rounded-2xl px-4 py-3 flex gap-3 items-start bg-green-50 border border-green-200">
        <span className="text-xl mt-0.5">💬</span>
        <p className="text-xs text-green-700 leading-relaxed">
          Al confirmar se guarda el pedido y se abre <strong>WhatsApp</strong> con el resumen listo para enviar.
        </p>
      </div>

      <button onClick={onConfirm} disabled={loading}
        className="w-full font-bold py-4 rounded-2xl text-white text-base transition-all disabled:opacity-40"
        style={{ background: '#25D366', boxShadow: loading ? 'none' : '0 4px 16px rgba(37,211,102,0.35)' }}
      >
        {loading ? 'Enviando…' : '✅ Confirmar y abrir WhatsApp'}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CheckoutFlow({ open, onClose, preselectedOrderType }) {
  const { cart, subtotal, clearCart } = useCart()
  const { createOrder } = useOrders()
  const { config } = useRestaurantConfig()

  const [step, setStep]         = useState(0)
  const [orderType, setOrderType] = useState(preselectedOrderType ?? null)
  const [zone, setZone]         = useState(null)
  const [form, setForm]         = useState({ name: '', phone: '', address: '', note: '', mapUrl: '', lat: null, lng: null })
  const [payment, setPayment]   = useState(null)
  const [loading, setLoading]   = useState(false)

  // If caller already provided the order type, skip step 0
  const startStep = preselectedOrderType ? 1 : 0

  const deliveryCost = orderType === 'domicilio' ? (zone?.cost ?? 0) : 0
  const total        = subtotal + deliveryCost

  function canAdvance() {
    if (step === 0) return !!orderType
    if (step === 1) {
      if (!form.name.trim()) return false
      if (orderType === 'domicilio') return !!zone && form.address.trim().length > 0 && form.phone.trim().length > 0
      return true
    }
    if (step === 2) return !!payment
    return true
  }

  function handleClose() {
    setStep(startStep)
    setOrderType(preselectedOrderType ?? null)
    setZone(null)
    setForm({ name: '', phone: '', address: '', note: '', mapUrl: '', lat: null, lng: null })
    setPayment(null)
    onClose()
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      await createOrder({
        customerName: form.name,
        phone:        form.phone || '',
        address:      form.address || '',
        mapUrl:       form.mapUrl || '',
        note:         form.note || '',
        orderType,
        zone:         zone ? { id: zone.id, name: zone.name, cost: zone.cost } : null,
        deliveryCost,
        paymentMethod: payment,
        items: cart.map(i => ({
          id:    i.id,
          name:  i.name,
          price: i.price,
          qty:   i.qty,
          note:  i.note || '',
          selectedCustomizations: i.selectedCustomizations || {},
        })),
        total,
      })
      openWhatsApp({
        customerName: form.name,
        phone:        form.phone,
        items:        cart,
        orderType,
        zone,
        deliveryCost,
        address:      form.address,
        mapUrl:       form.mapUrl,
        tableNumber:  '',
        paymentMethod: payment,
        total,
        note:         form.note,
      })
      clearCart()
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const STEPS = [
    // Step 0: order type (only if not preselected)
    ...(!preselectedOrderType ? [{
      label: 'Tipo',
      content: <StepOrderType
        orderTypes={config.orderTypes}
        value={orderType}
        onChange={v => { setOrderType(v); setZone(null) }}
      />,
    }] : []),
    // Step 1: customer info
    {
      label: 'Datos',
      content: <StepInfo
        orderType={orderType}
        zone={zone} setZone={setZone}
        deliveryZones={config.deliveryZones}
        form={form} setForm={setForm}
      />,
    },
    // Step 2: payment
    { label: 'Pago', content: <StepPayment value={payment} onChange={setPayment} /> },
    // Step 3: summary
    {
      label: 'Resumen',
      content: <StepSummary
        cart={cart} orderType={orderType} zone={zone} form={form}
        paymentMethod={payment} total={total} onConfirm={handleConfirm} loading={loading}
      />,
    },
  ]

  const isLastStep  = step === STEPS.length - 1
  const totalSteps  = STEPS.length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col bg-white
                   max-h-[92dvh] sm:max-h-[88vh] overflow-hidden shadow-float"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-[#E5E7EB] shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">Finalizar pedido</h2>
              <p className="text-xs text-[#6B7280]">El Rincón de Las Delicias</p>
            </div>
            <button onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#6B7280] text-lg transition-colors">
              ×
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-[#FFB800]' : 'bg-[#E5E7EB]'
                }`} />
                <span className={`text-[10px] font-bold ${
                  i === step ? 'text-[#FFB800]' : i < step ? 'text-[#FFB800]/60' : 'text-[#6B7280]'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {STEPS[step]?.content}
        </div>

        {/* Navigation */}
        {!isLastStep && (
          <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3 shrink-0">
            {step > startStep && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 font-bold py-3 rounded-2xl border border-[#E5E7EB] text-[#6B7280] hover:text-[#111111] transition-colors">
                ← Atrás
              </button>
            )}
            <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
              className={`flex-[2] font-bold py-3 rounded-2xl transition-all ${
                canAdvance()
                  ? 'bg-[#FFB800] text-[#111111] shadow-float hover:bg-[#e6a600]'
                  : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}>
              Continuar →
            </button>
          </div>
        )}
        {isLastStep && (
          <div className="px-5 pb-4 shrink-0">
            <button onClick={() => setStep(s => s - 1)}
              className="w-full text-sm text-[#6B7280] hover:text-[#111111] py-2">
              ← Modificar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
