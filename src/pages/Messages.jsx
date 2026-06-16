import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { Avatar } from '../components/ui/Avatar'
import { Spinner } from '../components/ui/Spinner'
import { Send, ArrowLeft, MessageCircle } from 'lucide-react'
import { formatDate } from '../lib/utils'

export function Messages() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const withId = params.get('with')
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => { loadConversations() }, [user])
  useEffect(() => {
    if (withId) openOrCreateConversation(withId)
  }, [withId, conversations])
  useEffect(() => {
    if (activeConv) loadMessages(activeConv.id)
  }, [activeConv])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('conversations')
      .select(`*, participant_a:profiles!conversations_participant_a_fkey(id, username, avatar_url),
                participant_b:profiles!conversations_participant_b_fkey(id, username, avatar_url),
                messages(content, created_at, sender_id)`)
      .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
      .order('updated_at', { ascending: false })
    setConversations(data || [])
    setLoading(false)
  }

  async function openOrCreateConversation(otherId) {
    if (!user) return
    // Check if conversation exists
    const existing = conversations.find(c =>
      (c.participant_a === user.id && c.participant_b === otherId) ||
      (c.participant_b === user.id && c.participant_a === otherId)
    )
    if (existing) { setActiveConv(existing); return }
    // Create new
    const { data } = await supabase.from('conversations').insert({
      participant_a: user.id,
      participant_b: otherId,
    }).select(`*, participant_a:profiles!conversations_participant_a_fkey(id, username, avatar_url),
               participant_b:profiles!conversations_participant_b_fkey(id, username, avatar_url)`).single()
    if (data) {
      setConversations(c => [data, ...c])
      setActiveConv(data)
    }
  }

  async function loadMessages(convId) {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(id, username, avatar_url)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim() || !activeConv || !user) return
    setSending(true)
    const { data } = await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: newMsg.trim(),
    }).select('*, profiles(id, username, avatar_url)').single()
    if (data) setMessages(m => [...m, data])
    setNewMsg('')
    setSending(false)
    // Update conversation
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeConv.id)
  }

  function getOtherProfile(conv) {
    if (!conv || !user) return null
    return conv.participant_a?.id === user.id ? conv.participant_b : conv.participant_a
  }

  const otherProfile = getOtherProfile(activeConv)

  return (
    <div className="flex flex-col gap-4">
      {!activeConv ? (
        <>
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">💬 Mensagens</h1>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner className="text-brand-green" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gray-900 dark:text-white">Nenhuma conversa</p>
              <p className="text-sm text-gray-400 mt-1">Visite perfis de colecionadores para iniciar uma conversa</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {conversations.map(conv => {
                const other = getOtherProfile(conv)
                const lastMsg = conv.messages?.slice(-1)[0]
                return (
                  <div key={conv.id} onClick={() => setActiveConv(conv)}
                    className="card p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                    <Avatar src={other?.avatar_url} name={other?.username} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{other?.username}</p>
                      {lastMsg && <p className="text-xs text-gray-400 truncate">{lastMsg.content}</p>}
                    </div>
                    {lastMsg && <p className="text-xs text-gray-400 shrink-0">{formatDate(lastMsg.created_at)}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
          {/* Chat header */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <button onClick={() => setActiveConv(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div onClick={() => navigate(`/profile/${otherProfile?.id}`)} className="flex items-center gap-2 cursor-pointer">
              <Avatar src={otherProfile?.avatar_url} name={otherProfile?.username} size="sm" />
              <p className="font-semibold text-gray-900 dark:text-white hover:text-brand-green transition-colors">{otherProfile?.username}</p>
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2">
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>Nenhuma mensagem ainda</p>
                <p>Diga olá! 👋</p>
              </div>
            )}
            {messages.map(m => {
              const isMine = m.sender_id === user?.id
              return (
                <div key={m.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                  {!isMine && <Avatar src={m.profiles?.avatar_url} name={m.profiles?.username} size="xs" className="shrink-0 mb-1" />}
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-brand-green text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  }`}>
                    <p>{m.content}</p>
                    <p className={`text-[10px] mt-0.5 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>{formatDate(m.created_at)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          {/* Input */}
          <form onSubmit={sendMessage} className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              className="input flex-1"
              placeholder="Mensagem..."
            />
            <button type="submit" disabled={sending || !newMsg.trim()} className="btn-primary px-4 py-2">
              {sending ? <Spinner size="sm" className="text-white" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
