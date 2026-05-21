import { usePromotions } from '../../hooks/usePromotions'

export default function PromotionsBanner() {
  const { promotions, loading } = usePromotions(true)

  if (loading || promotions.length === 0) return null

  return (
    <section className="mb-1">
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {promotions.map(promo => {
          const isRed  = promo.color === 'red'
          const bg     = isRed ? 'bg-brand-red'  : 'bg-brand-gold'
          const text   = isRed ? 'text-white'     : 'text-black'
          const sub    = isRed ? 'text-red-100'   : 'text-black/60'
          return (
            <div
              key={promo.id}
              className={`${bg} ${text} shrink-0 rounded-2xl px-5 py-4 min-w-[220px] max-w-[260px] relative overflow-hidden`}
            >
              {/* Círculo decorativo */}
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-black/10" />
              <div className="absolute -right-1 -bottom-1 w-10 h-10 rounded-full bg-black/10" />

              {promo.badge && (
                <span className="text-2xl block mb-1">{promo.badge}</span>
              )}
              <p className="font-black text-base leading-tight relative z-10">{promo.title}</p>
              {promo.description && (
                <p className={`text-xs mt-1 leading-snug relative z-10 ${sub}`}>
                  {promo.description}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
