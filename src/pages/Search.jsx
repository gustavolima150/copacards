import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { Avatar } from '../components/ui/Avatar'
import { StickerCard } from '../components/sticker/StickerCard'
import { Spinner } from '../components/ui/Spinner'
import { Search as SearchIcon, Users, Layers } from 'lucide-react'
import { FLAGS } from '../lib/utils'

export function Search() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('people')
  const [users, setUsers] = useState([])
  const [stickers, setStickers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => { if (query.trim().length >= 1) doSearch() }, 400)
    return () => clearTimeout(t)
  }, [query, tab])

  async function doSearch() {
    setLoading(true)
    if (tab === 'people') {
      const { data } = await supabase.from('profiles').select('*')
        .ilike('username', `%${query}%`).neq('id', user?.id).limit(20)
      setUsers(data || [])
    } else {
      const { data } = await supabase.from('stickers').select('*, profiles(username)')
        .ilike('athlete_name', `%${query}%`).limit(30)
      setStickers(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-bold text-xl text-gray-900 dark:text-white">🔍 Buscar</h1>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          className="input pl-10 py-3 text-base" placeholder="Buscar pessoas ou figurinhas..." autoFocus />
      </div>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[['people', <Users className="w-4 h-4" />, 'Pessoas'], ['stickers', <Layers className="w-4 h-4" />, 'Figurinhas']].map(([key, icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === key ? 'bg-white dark:bg-gray-900 text-brand-green shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {!query.trim() ? (
        <div className="text-center py-16 text-gray-400">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Digite para buscar {tab === 'people' ? 'colecionadores' : 'figurinhas'}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-brand-green" /></div>
      ) : tab === 'people' ? (
        users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-sm">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map(u => (
              <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)}
                className="card p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                <Avatar src={u.avatar_url} name={u.username} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{u.username}</p>
                  <p className="text-xs text-gray-400 truncate">{FLAGS[u.favorite_selection] || '🏳️'} {u.favorite_selection}</p>
                  {u.bio && <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{u.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        stickers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">Nenhuma figurinha encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stickers.map(s => <StickerCard key={s.id} sticker={s} onClick={() => navigate(`/sticker/${s.id}`)} compact />)}
          </div>
        )
      )}
    </div>
  )
}
