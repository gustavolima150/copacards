import { cn } from '../../lib/utils'

export function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
  return src ? (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover ring-2 ring-brand-green/30', sizes[size], className)}
    />
  ) : (
    <div className={cn(
      'rounded-full flex items-center justify-center font-bold text-white',
      'bg-brand-green',
      sizes[size], className
    )}>
      {initials}
    </div>
  )
}
