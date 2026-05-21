const WA_NUMBER = '527731477760'

const ORDER_TYPE_LABELS = {
  domicilio:     '🚚 Domicilio',
  recoger:       '🏃 Recoger en tienda',
  'para-llevar': '🥡 Para llevar',
  mesa:          '🪑 En mesa',
}

const PAYMENT_LABELS = {
  efectivo:      '💵 Efectivo',
  tarjeta:       '💳 Tarjeta',
  transferencia: '📲 Transferencia',
}

function formatCustomizations(item) {
  const parts = []
  // Preset selections
  if (item.selectedCustomizations) {
    for (const [, val] of Object.entries(item.selectedCustomizations)) {
      const opts = Array.isArray(val) ? val : [val]
      parts.push(...opts.filter(Boolean))
    }
  }
  // Free text note
  if (item.note) parts.push(item.note)
  return parts.length > 0 ? `\n      ✏️ ${parts.join(', ')}` : ''
}

/**
 * Builds the WhatsApp message and opens the deep link.
 * @param {Object} order
 */
export function openWhatsApp(order) {
  const {
    customerName, phone, items,
    orderType, zone, deliveryCost,
    address, mapUrl, tableNumber,
    paymentMethod, total, note,
  } = order

  // ── Product list ───────────────────────────────────────────
  const itemsList = items
    .map(i => {
      const sub = `$${(i.price * i.qty).toFixed(2)}`
      return `   • ${i.qty}x ${i.name} — ${sub}${formatCustomizations(i)}`
    })
    .join('\n')

  // ── Delivery block ─────────────────────────────────────────
  let deliveryBlock = ''
  if (orderType === 'domicilio') {
    deliveryBlock =
      `📍 *Zona:* ${zone?.name ?? '–'}\n` +
      `🏠 *Dirección:* ${address}\n` +
      (mapUrl ? `🗺️ *Mapa:* ${mapUrl}\n` : '') +
      `🛵 *Costo de envío:* $${(deliveryCost ?? 0).toFixed(2)}\n`
  } else if (orderType === 'mesa') {
    deliveryBlock = `🪑 *Mesa:* ${tableNumber}\n`
  }

  // ── Full message ───────────────────────────────────────────
  const lines = [
    `🍽️ *NUEVO PEDIDO — El Rincón de Las Delicias*`,
    ``,
    `👤 *Cliente:* ${customerName}`,
    phone ? `📞 *Teléfono:* ${phone}` : null,
    ``,
    `🛒 *Productos:*`,
    itemsList,
    ``,
    `📦 *Tipo de pedido:* ${ORDER_TYPE_LABELS[orderType] ?? orderType}`,
    deliveryBlock.trim() ? deliveryBlock.trim() : null,
    ``,
    `💳 *Forma de pago:* ${PAYMENT_LABELS[paymentMethod] ?? paymentMethod}`,
    ``,
    orderType === 'domicilio'
      ? `💰 *Subtotal:* $${(total - (deliveryCost ?? 0)).toFixed(2)}\n🛵 *Envío:* $${(deliveryCost ?? 0).toFixed(2)}\n💵 *TOTAL: $${total.toFixed(2)}*`
      : `💵 *TOTAL: $${total.toFixed(2)}*`,
    note ? `\n📝 *Nota:* ${note}` : null,
  ]
    .filter(l => l !== null)
    .join('\n')

  const encoded = encodeURIComponent(lines)
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank')
}
