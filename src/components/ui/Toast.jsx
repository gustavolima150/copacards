import { create } from 'zustand'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export const useToast = create((set) => ({
  toasts: [],
  toast: ({ title, description, type = 'success' }) => {
    const id = Date.now()
    set((s) => ({ toasts: [...s.toasts, { id, title, description, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

const icons = {
  success: <CheckCircle className="w-5 h-5 text-brand-green" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-brand-blue" />,
}

export function Toaster() {
  const { toasts, remove } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map(t => (
        <div key={t.id} className="card p-4 flex items-start gap-3 shadow-lg animate-slide-up">
          {icons[t.type]}
          <div className="flex-1 min-w-0">
            {t.title && <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.title}</p>}
            {t.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => remove(t.id)} className="shrink-0 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  )
}
