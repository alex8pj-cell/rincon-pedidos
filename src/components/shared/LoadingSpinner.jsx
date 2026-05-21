export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className="flex justify-center items-center p-8">
      <div className={`animate-spin rounded-full border-4 border-brand-dark border-t-brand-gold ${sizes[size]}`} />
    </div>
  )
}
