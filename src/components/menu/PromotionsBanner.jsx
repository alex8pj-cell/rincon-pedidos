import { usePromotions } from '../../hooks/usePromotions'

export default function PromotionsBanner() {
  const { promotions, loading } = usePromotions(true)

  if (loading || promotions.length === 0) return null

  return (
    <section className="px-4 pt-4">
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {promotions.map(promo => {
          const isRed = promo.color === 'red'
          return (
            <div
              key={promo.id}
              className={`shrink-0 rounded-2xl px-5 py-4 min-w-[200px] max-w-[240px] relative overflow-hidden ${
                isRed ? 'bg-[#E8001C] text-white' : 'bg-[#FFB800] text-[#111111]'
              }`}
            >
              {/* Decorative circles */}
              <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-black/10" />
              <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-black/10" />

              {promo.badge && (
                <span className="text-2xl block mb-1">{promo.badge}</span>
              )}
              <p className="font-bold text-[15px] leading-tight relative z-10">{promo.title}</p>
              {promo.description && (
                <p className={`text-xs mt-1 leading-snug relative z-10 ${isRed ? 'text-red-100' : 'text-black/60'}`}>
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
