const WA_NUMBER = '527731477760'

const ORDER_TYPE_LABELS = {
  domicilio:   '🚚 Domicilio',
  recoger:     '🏃 Recoger en tienda',
  'para-llevar': '🥡 Para llevar',
  mesa:        '🪑 En mesa',
}

const PAYMENT_LABELS = {
  efectivo:       '💵 Efectivo',
  tarjeta:        '💳 Tarjeta',
  transferencia:  '📲 Transferencia',
}

/**
 * Construye el mensaje de WhatsApp y abre el enlace.
 * @param {Object} order - datos del pedido confirmado
 */
export function openWhatsApp(order) {
  const {
    customerName, phone, items,
    orderType, zone, deliveryCost,
    address, tableNumber,
    paymentMethod, total, note,
  } = order

  // ── Lista de productos ──────────────────────────────────────
  const itemsList = items
    .map(i => {
      const subtotal = `$${(i.price * i.qty).toFixed(2)}`
      const customization = i.note ? `\n      ✏️ _${i.note}_` : ''
      return `   • ${i.qty}x ${i.name} — ${subtotal}${customization}`
    })
    .join('\n')

  // ── Bloque de entrega ───────────────────────────────────────
  let deliveryBlock = ''
  if (orderType === 'domicilio') {
    deliveryBlock =
      `📍 *Zona:* ${zone.name}\n` +
      `🏠 *Dirección:* ${address}\n` +
      `🛵 *Costo de envío:* $${deliveryCost.toFixed(2)}\n`
  } else if (orderType === 'mesa') {
    deliveryBlock = `🪑 *Mesa:* ${tableNumber}\n`
  }

  // ── Mensaje completo ────────────────────────────────────────
  const lines = [
    `🍽️ *NUEVO PEDIDO — El Rincón de Las Delicias*`,
    ``,
    `👤 *Cliente:* ${customerName}`,
    `📞 *Teléfono:* ${phone}`,
    ``,
    `🛒 *Productos:*`,
    itemsList,
    ``,
    `📦 *Tipo de pedido:* ${ORDER_TYPE_LABELS[orderType]}`,
    deliveryBlock.trim() ? deliveryBlock.trim() : null,
    ``,
    `💳 *Forma de pago:* ${PAYMENT_LABELS[paymentMethod]}`,
    ``,
    orderType === 'domicilio'
      ? `💰 *Subtotal:* $${(total - deliveryCost).toFixed(2)}\n🛵 *Envío:* $${deliveryCost.toFixed(2)}\n💵 *TOTAL: $${total.toFixed(2)}*`
      : `💵 *TOTAL: $${total.toFixed(2)}*`,
    note ? `\n📝 *Nota:* ${note}` : null,
  ]
    .filter(l => l !== null)
    .join('\n')

  const encoded = encodeURIComponent(lines)
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank')
}
