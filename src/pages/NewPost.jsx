import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'
import { StickerCard } from '../components/sticker/StickerCard'
import { ArrowLeft, Search } from 'lucide-react'

export function NewPost() {
  const { user } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselected = params.get('sticker')
  const [stickers, setStickers] = useState([])
  const [selected, setSelected] = useState(null)
  const [caption, setCaption] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)

  useEffect(() => { loadStickers() }, [user])
  useEffect(() => {
    if (preselected && stickers.length > 0) {
      const s = stickers.find(x => x.id === preselected)
      if (s) setSelected(s)
    }
  }, [preselected, stickers])

  async function loadStickers() {
    setLoading(true)
    const { data } = await supabase.from('stickers').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setStickers(data || [])
    setLoading(false)
  }

  async function handlePost() {
    if (!selected) return toast({ title: 'Selecione uma figurinha!', type: 'error' })
    setPosting(true)
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      sticker_id: selected.id,
      caption: caption.trim() || null,
    })
    setPosting(false)
    if (error) return toast({ title: 'Erro ao publicar', type: 'error' })
    toast({ title: 'Figurinha publicada! 🎉', type: 'success' })
    navigate('/feed')
  }

  const filtered = stickers.filter(s => s.athlete_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-xl text-gray-900 dark:text-white">Nova Postagem</h1>
      </div>

      {/* Caption */}
      <div className="card p-4 flex flex-col gap-3">
        <label className="label">Legenda (opcional)</label>
        <textarea value={caption} onChange={e => setCaption(e.target.value)}
          className="input resize-none" rows={3} placeholder="O que você quer compartilhar sobre essa figurinha?" />
      </div>

      {/* Selected sticker preview */}
      {selected && (
        <div className="card p-4">
          <p className="label mb-2">Figurinha selecionada:</p>
          <div className="max-w-[150px]">
            <StickerCard sticker={selected} compact />
          </div>
          <button onClick={() => setSelected(null)} className="text-xs text-red-500 hover:underline mt-2">Remover</button>
        </div>
      )}

      {/* Select sticker */}
      {!selected && (
        <div className="card p-4 flex flex-col gap-3">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Escolha uma figurinha da sua coleção:</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Buscar atleta..." />
          </div>
          {loading ? (
            <div className="flex justify-center py-4"><Spinner className="text-brand-green" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">Nenhuma figurinha encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {filtered.map(s => (
                <StickerCard key={s.id} sticker={s} compact onClick={() => setSelected(s)} />
              ))}
            </div>
          )}
        </div>
      )}

      <button onClick={handlePost} disabled={posting || !selected} className="btn-primary py-3">
        {posting ? <Spinner size="sm" className="text-white" /> : '⚽ Publicar no Feed'}
      </button>
    </div>
  )
}
