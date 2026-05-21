import { useState, useEffect } from 'react'
import { useRestaurantConfig } from '../../hooks/useRestaurantConfig'

export default function ConfigPanel() {
  const { config, loading, updateConfig } = useRestaurantConfig()
  const [form, setForm]   = useState({ name: '', coverUrl: '', logoUrl: '', phone: '' })
  const [zones, setZones] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    if (!loading) {
      setForm({
        name:     config.name ?? '',
        coverUrl: config.coverUrl ?? '',
        logoUrl:  config.logoUrl ?? '',
        phone:    config.phone ?? '',
      })
      setZones(config.deliveryZones ?? [])
    }
  }, [loading])

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    await updateConfig({ ...form, deliveryZones: zones })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function updateZone(id, key, value) {
    setZones(z => z.map(z => z.id === id ? { ...z, [key]: key === 'cost' ? parseFloat(value) || 0 : value } : z))
  }

  function addZone() {
    const id = `zone_${Date.now()}`
    setZones(z => [...z, { id, name: '', description: '', emoji: '📍', cost: 0 }])
  }

  function removeZone(id) {
    setZones(z => z.filter(z => z.id !== id))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-[#E5E7EB] border-t-[#FFB800] animate-spin" />
    </div>
  )

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">

      {/* ── Restaurant info ── */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <h3 className="font-bold text-[#111111] text-base mb-4">Información del restaurante</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#111111] mb-1.5">Nombre del restaurante</label>
            <input className="field" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="El Rincón de Las Delicias" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#111111] mb-1.5">Teléfono WhatsApp</label>
            <input className="field" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="527731477760" />
            <p className="text-xs text-[#6B7280] mt-1">Incluye código de país sin "+" (ej: 5277…)</p>
          </div>
        </div>
      </section>

      {/* ── Media ── */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <h3 className="font-bold text-[#111111] text-base mb-4">Fotos del restaurante</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#111111] mb-1.5">URL Foto de portada</label>
            <input className="field" value={form.coverUrl}
              onChange={e => setForm(p => ({ ...p, coverUrl: e.target.value }))}
              placeholder="https://…/portada.jpg" />
            {form.coverUrl && (
              <img src={form.coverUrl} alt="Cover preview" className="mt-2 w-full h-28 object-cover rounded-xl" />
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#111111] mb-1.5">URL Logo (circular)</label>
            <input className="field" value={form.logoUrl}
              onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
              placeholder="https://…/logo.png" />
            {form.logoUrl && (
              <img src={form.logoUrl} alt="Logo preview" className="mt-2 w-16 h-16 rounded-full object-cover border border-[#E5E7EB]" />
            )}
          </div>
        </div>
      </section>

      {/* ── Delivery zones ── */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#111111] text-base">Zonas de entrega</h3>
          <button type="button" onClick={addZone}
            className="text-sm font-bold text-[#FFB800] hover:text-[#111111] transition-colors">
            + Agregar zona
          </button>
        </div>
        <div className="space-y-3">
          {zones.map(z => (
            <div key={z.id} className="rounded-xl border border-[#E5E7EB] p-3 space-y-2">
              <div className="flex gap-2">
                <input className="field w-12 text-center px-2" value={z.emoji}
                  onChange={e => updateZone(z.id, 'emoji', e.target.value)}
                  placeholder="📍" maxLength={2} />
                <input className="field flex-1" value={z.name}
                  onChange={e => updateZone(z.id, 'name', e.target.value)}
                  placeholder="Nombre de la zona" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-[#6B7280] font-medium">$</span>
                  <input className="field w-20 text-right" type="number" min="0" step="0.5"
                    value={z.cost}
                    onChange={e => updateZone(z.id, 'cost', e.target.value)}
                    placeholder="0" />
                </div>
                <button type="button" onClick={() => removeZone(z.id)}
                  className="text-[#E8001C] hover:opacity-70 text-lg shrink-0">×</button>
              </div>
              <input className="field text-sm" value={z.description}
                onChange={e => updateZone(z.id, 'description', e.target.value)}
                placeholder="Descripción (colonias incluidas…)" />
            </div>
          ))}
          {zones.length === 0 && (
            <p className="text-center text-[#6B7280] text-sm py-4">Sin zonas de entrega configuradas</p>
          )}
        </div>
      </section>

      {/* Save */}
      <button type="submit" disabled={saving}
        className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-40 ${
          saved ? 'bg-green-500 text-white' : 'bg-[#FFB800] text-[#111111] shadow-float hover:bg-[#e6a600]'
        }`}>
        {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </form>
  )
}
