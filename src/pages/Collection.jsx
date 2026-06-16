import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { StickerCard } from '../components/sticker/StickerCard'
import { Spinner } from '../components/ui/Spinner'
import { Plus, Filter, Search } from 'lucide-react'
import { SELECTIONS, STATUS_LABELS } from '../lib/utils'

const STATUSES = ['todos', 'tenho', 'quero', 'repetida']

export function Collection() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [stickers, setStickers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('todos')
  const [selectionFilter, setSelectionFilter] = useState('todas')
  const [search, setSearch] = useState('')

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('stickers').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setStickers(data || [])
    setLoading(false)
  }

  const filtered = stickers.filter(s => {
    const matchStatus = statusFilter === 'todos' || s.status === statusFilter
    const matchSel = selectionFilter === 'todas' || s.selection === selectionFilter
    const matchSearch = !search || s.athlete_name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSel && matchSearch
  })

  const stats = {
    total: stickers.length,
    tenho: stickers.filter(s => s.status === 'tenho').length,
    quero: stickers.filter(s => s.status === 'quero').length,
    repetida: stickers.filter(s => s.status === 'repetida').length,
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl text-gray-900 dark:text-white">📦 Minha Coleção</h1>
        <Link to="/sticker/new" className="btn-primary text-xs px-3 py-1.5">
          <Plus className="w-4 h-4" /> Adicionar
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900 dark:text-white' },
          { label: 'Tenho', value: stats.tenho, color: 'text-brand-green' },
          { label: 'Quero', value: stats.quero, color: 'text-brand-blue' },
          { label: 'Repetida', value: stats.repetida, color: 'text-yellow-600' },
        ].map(s => (
          <div key={s.label} className="card p-2 text-center">
            <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9" placeholder="Buscar atleta..." />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
              {s === 'todos' ? 'Todos' : STATUS_LABELS[s].label}
            </button>
          ))}
        </div>
        <select value={selectionFilter} onChange={e => setSelectionFilter(e.target.value)} className="input text-xs">
          <option value="todas">Todas as seleções</option>
          {SELECTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" className="text-brand-green" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📦</div>
          <p className="font-semibold text-gray-900 dark:text-white">Nenhuma figurinha encontrada</p>
          <p className="text-sm text-gray-400 mt-1">Tente outro filtro ou adicione novas figurinhas</p>
          <Link to="/sticker/new" className="btn-primary mt-4 inline-flex">Adicionar figurinha</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map(s => (
            <StickerCard key={s.id} sticker={s} onClick={() => navigate(`/sticker/${s.id}`)} compact />
          ))}
        </div>
      )}
    </div>
  )
}
