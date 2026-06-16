import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { PostCard } from '../components/post/PostCard'
import { Spinner } from '../components/ui/Spinner'
import { Plus, Flame } from 'lucide-react'

export function Feed() {
  const { user, profile } = useStore()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPosts() }, [user])

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles(id, username, avatar_url),
        stickers(*),
        likes(user_id),
        comments(id)
      `)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) {
      const enriched = data.map(p => ({
        ...p,
        user_liked: p.likes?.some(l => l.user_id === user?.id) || false,
        likes_count: p.likes?.length || 0,
        comments_count: p.comments?.length || 0,
      }))
      setPosts(enriched)
    }
    setLoading(false)
  }

  function handleDelete(id) { setPosts(ps => ps.filter(p => p.id !== id)) }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-brand-yellow" />
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">Feed</h1>
        </div>
        <Link to="/post/new" className="btn-primary text-xs px-3 py-1.5">
          <Plus className="w-4 h-4" /> Publicar
        </Link>
      </div>

      {/* Welcome banner */}
      {profile && (
        <div className="rounded-2xl bg-brand-green p-4 text-white flex items-center gap-3">
          <div className="text-3xl">⚽</div>
          <div>
            <p className="font-bold">Olá, {profile.username}!</p>
            <p className="text-white/80 text-xs">Explore as figurinhas dos colecionadores</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" className="text-brand-green" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="text-6xl">⚽</div>
          <h2 className="font-bold text-gray-900 dark:text-white">Nenhuma postagem ainda</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Seja o primeiro a compartilhar uma figurinha!</p>
          <Link to="/post/new" className="btn-primary">Publicar figurinha</Link>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))
      )}
    </div>
  )
}
