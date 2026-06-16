import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Trash2, Edit2, MoreVertical } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../store/useStore'
import { useToast } from '../ui/Toast'
import { Avatar } from '../ui/Avatar'
import { FLAGS, STATUS_LABELS, formatDate } from '../../lib/utils'
import { Spinner } from '../ui/Spinner'

export function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(post.user_liked)
  const [likeCount, setLikeCount] = useState(post.likes_count || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const isOwner = user?.id === post.profiles?.id

  const flag = FLAGS[post.stickers?.selection] || '🏳️'
  const status = STATUS_LABELS[post.stickers?.status]

  async function toggleLike() {
    if (!user) return
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(c => newLiked ? c + 1 : c - 1)
    if (newLiked) {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
    } else {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
    }
  }

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(id, username, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    setLoadingComment(true)
    const { data, error } = await supabase.from('comments').insert({
      post_id: post.id,
      user_id: user.id,
      content: commentText.trim(),
    }).select('*, profiles(id, username, avatar_url)').single()
    setLoadingComment(false)
    if (!error && data) {
      setComments(c => [...c, data])
      setCommentText('')
    }
  }

  async function handleDeleteComment(commentId) {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(c => c.filter(x => x.id !== commentId))
  }

  async function handleDelete() {
    await supabase.from('posts').delete().eq('id', post.id)
    toast({ title: 'Postagem removida', type: 'info' })
    onDelete?.(post.id)
    setShowMenu(false)
  }

  useEffect(() => {
    if (showComments) loadComments()
  }, [showComments])

  return (
    <div className="card p-4 flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to={`/profile/${post.profiles?.id}`} className="flex items-center gap-2.5 group">
          <Avatar src={post.profiles?.avatar_url} name={post.profiles?.username} size="sm" />
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-green transition-colors">
              {post.profiles?.username}
            </p>
            <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
          </div>
        </Link>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-10 overflow-hidden min-w-[130px]">
                <Link to={`/post/edit/${post.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  onClick={() => setShowMenu(false)}>
                  <Edit2 className="w-4 h-4" /> Editar
                </Link>
                <button onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 w-full">
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="text-sm text-gray-800 dark:text-gray-200">{post.caption}</p>
      )}

      {/* Sticker */}
      {post.stickers && (
        <div
          onClick={() => navigate(`/sticker/${post.stickers.id}`)}
          className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-brand-blue/5 to-brand-green/5 cursor-pointer hover:shadow-md transition-shadow sticker-shine"
        >
          {post.stickers.image_url && (
            <img src={post.stickers.image_url} alt={post.stickers.athlete_name}
              className="w-full h-56 object-cover" />
          )}
          <div className="p-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{flag} {post.stickers.athlete_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{post.stickers.selection} · #{post.stickers.shirt_number} · {post.stickers.position}</p>
            </div>
            {post.stickers.status && status && (
              <span className={`badge ${status.color}`}>{status.label}</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <button onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90 ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
          <span>{likeCount}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-brand-green transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count || 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-3">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2">
              <Link to={`/profile/${c.profiles?.id}`}>
                <Avatar src={c.profiles?.avatar_url} name={c.profiles?.username} size="xs" />
              </Link>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{c.profiles?.username}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
              </div>
              {user?.id === c.user_id && (
                <button onClick={() => handleDeleteComment(c.id)} className="text-gray-300 hover:text-red-400 mt-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <form onSubmit={handleComment} className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="input flex-1"
              placeholder="Adicionar comentário..."
            />
            <button type="submit" disabled={loadingComment || !commentText.trim()} className="btn-primary px-3 py-2">
              {loadingComment ? <Spinner size="sm" className="text-white" /> : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
