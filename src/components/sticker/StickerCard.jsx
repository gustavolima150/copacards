import { FLAGS, STATUS_LABELS } from '../../lib/utils'

export function StickerCard({ sticker, onClick, compact = false }) {
  const flag = FLAGS[sticker.selection] || '🏳️'
  const status = STATUS_LABELS[sticker.status]

  return (
    <div
      onClick={() => onClick?.(sticker)}
      className="sticker-card sticker-shine group relative"
    >
      {/* Image */}
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-blue/10 to-brand-green/10 ${compact ? 'h-32' : 'h-48'}`}>
        {sticker.image_url ? (
          <img
            src={sticker.image_url}
            alt={sticker.athlete_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
          />
        ) : null}
        <div className={`${sticker.image_url ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center text-5xl`}>
          {flag}
        </div>
        {/* Number badge */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-black rounded-lg px-2 py-0.5">
          #{sticker.shirt_number}
        </div>
        {/* Status badge */}
        {sticker.status && (
          <div className={`absolute top-2 right-2 badge ${status?.color} shadow-sm`}>
            {status?.label}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{sticker.athlete_name}</h3>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">{flag} {sticker.selection}</span>
          <span className="text-xs font-medium text-brand-green">{sticker.position}</span>
        </div>
        {sticker.description && !compact && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{sticker.description}</p>
        )}
      </div>
    </div>
  )
}
