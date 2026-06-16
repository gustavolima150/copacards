import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Plus, Bell, User, Moon, Sun, LogOut, MessageCircle, BookOpen } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'
import { Avatar } from '../ui/Avatar'
import { useToast } from '../ui/Toast'
import { cn } from '../../lib/utils'

export function Navbar() {
  const { profile, darkMode, toggleDarkMode } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const loc = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast({ title: 'Até logo!', type: 'info' })
    navigate('/login')
  }

  const links = [
    { to: '/feed', icon: Home, label: 'Feed' },
    { to: '/search', icon: Search, label: 'Buscar' },
    { to: '/messages', icon: MessageCircle, label: 'Mensagens' },
    { to: '/collection', icon: BookOpen, label: 'Coleção' },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40 p-4">
        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white font-black text-lg shadow">
            ⚽
          </div>
          <div>
            <span className="font-black text-lg text-brand-green">COPA</span>
            <span className="font-black text-lg text-brand-yellow">CARDS</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
              loc.pathname.startsWith(to)
                ? 'bg-brand-green/10 text-brand-green dark:bg-brand-green/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
            )}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          <Link to="/sticker/new" className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all mt-2',
            'bg-brand-green text-white hover:bg-green-700 shadow-sm hover:shadow-md'
          )}>
            <Plus className="w-5 h-5" />
            Nova Figurinha
          </Link>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4 flex flex-col gap-1">
          <button onClick={toggleDarkMode} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-all">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {darkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <Link to={`/profile/${profile?.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Avatar src={profile?.avatar_url} name={profile?.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{profile?.username || 'Meu Perfil'}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.favorite_selection || ''}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-all">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around px-2 py-1.5 safe-area-bottom">
        {links.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={cn(
            'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all',
            loc.pathname.startsWith(to) ? 'text-brand-green' : 'text-gray-400'
          )}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
        <Link to="/sticker/new" className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-brand-green">
          <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center -mt-4 shadow-lg shadow-brand-green/30">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-medium text-brand-green mt-1">Novo</span>
        </Link>
        <Link to={`/profile/${profile?.id}`} className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-gray-400">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
        <button onClick={toggleDarkMode} className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-gray-400">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-[10px] font-medium">{darkMode ? 'Claro' : 'Escuro'}</span>
        </button>
      </nav>
    </>
  )
}
