import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ui/Toast'
import { Spinner, PageSpinner } from '../components/ui/Spinner'
import { Avatar } from '../components/ui/Avatar'
import { FLAGS, STATUS_LABELS, formatDate } from '../lib/utils'
import { ArrowLeft, Edit2, Trash2, Share2 } from 'lucide-react'

export function StickerDetail() {
  const { id } = useParams()
  const { user } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [sticker, setSticker] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('stickers').select('*, profiles(id, username, avatar_url)').eq('id', id).single()
    if (data) { setSticker(data); setOwner(data.profiles) }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que quer excluir esta figurinha?')) return
    await supabase.from('stickers').delete().eq('id', id)
    toast({ title: 'Figurinha excluída', type: 'info' })
    navigate(-1)
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: sticker.athlete_name, url })
    } else {
      navigator.clipboard.writeText(url)
      toast({ title: 'Link copiado!', type: 'success' })
    }
  }

  if (loading) return <PageSpinner />
  if (!sticker) return <div className="text-center py-20 text-gray-400">Figurinha não encontrada</div>

  const flag = FLAGS[sticker.selection] || '🏳️'
  const status = STATUS_LABELS[sticker.status]
  const isOwner = user?.id === sticker.user_id

  return (
    <div className="flex flex-col gap-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 w-fit">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      {/* Sticker display */}
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative h-72 bg-gray-100 dark:bg-gray-800">
          {sticker.image_url ? (
            <img src={sticker.image_url} alt={sticker.athlete_name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-8xl">{flag}</div>
          )}
          {/* Overlay info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/70 text-sm">{flag} {sticker.selection}</p>
                <h1 className="font-black text-2xl text-white">{sticker.athlete_name}</h1>
                <p className="text-brand-yellow font-semibold">{sticker.position} · #{sticker.shirt_number}</p>
              </div>
              {status && (
                <span className={`badge ${status.color} text-sm px-3 py-1`}>{status.label}</span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 flex flex-col gap-4">
          {sticker.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{sticker.description}</p>
          )}

          {/* Owner */}
          <div className="flex items-center justify-between">
            <Link to={`/profile/${owner?.id}`} className="flex items-center gap-2 group">
              <Avatar src={owner?.avatar_url} name={owner?.username} size="sm" />
              <div>
                <p className="text-xs text-gray-400">Colecionador</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-green transition-colors">{owner?.username}</p>
              </div>
            </Link>
            <p className="text-xs text-gray-400">{formatDate(sticker.created_at)}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button onClick={handleShare} className="btn-secondary flex-1 py-2.5">
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
            {isOwner && (
              <>
                <Link to={`/sticker/edit/${id}`} className="btn-secondary px-4 py-2.5">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Post this sticker */}
      {isOwner && (
        <Link to={`/post/new?sticker=${id}`} className="btn-yellow w-full py-3 text-sm font-bold">
          ⚽ Publicar no Feed
        </Link>
      )}
    </div>
  )
}
