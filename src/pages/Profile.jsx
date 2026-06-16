import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ui/Toast'
import { Avatar } from '../components/ui/Avatar'
import { StickerCard } from '../components/sticker/StickerCard'
import { Spinner, PageSpinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'
import { Edit2, MessageCircle, UserPlus, UserMinus } from 'lucide-react'
import { FLAGS } from '../lib/utils'
import { EditProfileModal } from './EditProfile'

export function Profile() {
  const { id } = useParams()
  const { user, profile: myProfile, setProfile } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [profile, setProfileState] = useState(null)
  const [stickers, setStickers] = useState([])
  const [posts, setPosts] = useState([])
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('stickers')
  const [editOpen, setEditOpen] = useState(false)
  const isOwner = user?.id === id

  useEffect(() => { if (id) load() }, [id, user])

  async function load() {
    setLoading(true)
    const [profileRes, stickersRes, postsRes, followersRes, followingRes, isFollowRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('stickers').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('posts').select('*, stickers(*), likes(user_id), comments(id)').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', id),
      supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', id),
      user ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', id).single() : Promise.resolve({ data: null }),
    ])
    setProfileState(profileRes.data)
    setStickers(stickersRes.data || [])
    setPosts((postsRes.data || []).map(p => ({
      ...p, likes_count: p.likes?.length || 0, comments_count: p.comments?.length || 0,
    })))
    setFollowers(followersRes.count || 0)
    setFollowing(followingRes.count || 0)
    setIsFollowing(!!isFollowRes.data)
    setLoading(false)
  }

  async function toggleFollow() {
    if (!user) return navigate('/login')
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id)
      setFollowers(f => f - 1)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: id })
      setFollowers(f => f + 1)
      setIsFollowing(true)
      toast({ title: `Você seguiu ${profile?.username}! 🎉`, type: 'success' })
    }
  }

  async function handleMessage() {
    if (!user) return navigate('/login')
    navigate(`/messages?with=${id}`)
  }

  function handleStickerClick(s) { navigate(`/sticker/${s.id}`) }

  if (loading) return <PageSpinner />

  const flag = FLAGS[profile?.favorite_selection] || '🏳️'
  const tenho = stickers.filter(s => s.status === 'tenho').length
  const quero = stickers.filter(s => s.status === 'quero').length
  const repetida = stickers.filter(s => s.status === 'repetida').length

  return (
    <div className="flex flex-col gap-4">
      {/* Profile header */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <Avatar src={profile?.avatar_url} name={profile?.username} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="font-black text-xl text-gray-900 dark:text-white">{profile?.username}</h1>
                <p className="text-sm text-brand-green font-medium">{flag} {profile?.favorite_selection}</p>
              </div>
              {isOwner ? (
                <button onClick={() => setEditOpen(true)} className="btn-secondary text-xs px-3 py-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={toggleFollow} className={isFollowing ? 'btn-secondary text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}>
                    {isFollowing ? <><UserMinus className="w-3.5 h-3.5" /> Seguindo</> : <><UserPlus className="w-3.5 h-3.5" /> Seguir</>}
                  </button>
                  <button onClick={handleMessage} className="btn-secondary text-xs px-3 py-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            {profile?.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{profile.bio}</p>}
            <div className="flex gap-5 mt-3 text-sm">
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{stickers.length}</p>
                <p className="text-gray-400 text-xs">Figurinhas</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{followers}</p>
                <p className="text-gray-400 text-xs">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{following}</p>
                <p className="text-gray-400 text-xs">Seguindo</p>
              </div>
            </div>
          </div>
        </div>
        {/* Collection stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-xl py-2">
            <p className="font-bold text-brand-green text-lg">{tenho}</p>
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">Tenho</p>
          </div>
          <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-xl py-2">
            <p className="font-bold text-brand-blue text-lg">{quero}</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Quero</p>
          </div>
          <div className="text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-xl py-2">
            <p className="font-bold text-yellow-600 text-lg">{repetida}</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-500 font-medium">Repetida</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[['stickers', 'Figurinhas'], ['posts', 'Postagens']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === key ? 'bg-white dark:bg-gray-900 text-brand-green shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'stickers' ? (
        stickers.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm">Nenhuma figurinha na coleção</p>
            {isOwner && <Link to="/sticker/new" className="btn-primary mt-3 inline-flex text-sm">Adicionar figurinha</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stickers.map(s => <StickerCard key={s.id} sticker={s} onClick={handleStickerClick} compact />)}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          {posts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">Nenhuma postagem ainda</p>
            </div>
          ) : posts.map(p => (
            <div key={p.id} className="card p-3 flex gap-3 items-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/sticker/${p.stickers?.id}`)}>
              {p.stickers?.image_url
                ? <img src={p.stickers.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                : <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl shrink-0">{FLAGS[p.stickers?.selection] || '⚽'}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{p.stickers?.athlete_name}</p>
                <p className="text-xs text-gray-400 truncate">{p.caption || 'Sem legenda'}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>❤️ {p.likes_count}</span>
                  <span>💬 {p.comments_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} profile={profile} onSaved={(p) => { setProfileState(p); setProfile(p) }} />
    </div>
  )
}
