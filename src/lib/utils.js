import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export const POSITIONS = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante']

export const SELECTIONS = [
  'Brasil','Argentina','França','Alemanha','Espanha','Inglaterra','Portugal',
  'Holanda','Bélgica','Itália','Croácia','Uruguai','Colômbia','México',
  'Estados Unidos','Japão','Coreia do Sul','Marrocos','Senegal','Gana',
  'Nigéria','Camarões','Costa Rica','Equador','Peru','Chile','Austrália',
  'Polônia','Dinamarca','Suíça','Sérvia','Hungria','República Checa',
  'Turquia','Ucrânia','Áustria','Suécia','Noruega','Rússia','Outro'
]

export const STATUS_LABELS = {
  tenho: { label: 'Tenho', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  quero: { label: 'Quero', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  repetida: { label: 'Repetida', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' },
}

export const FLAGS = {
  'Brasil': '🇧🇷', 'Argentina': '🇦🇷', 'França': '🇫🇷', 'Alemanha': '🇩🇪',
  'Espanha': '🇪🇸', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Portugal': '🇵🇹', 'Holanda': '🇳🇱',
  'Bélgica': '🇧🇪', 'Itália': '🇮🇹', 'Croácia': '🇭🇷', 'Uruguai': '🇺🇾',
  'Colômbia': '🇨🇴', 'México': '🇲🇽', 'Estados Unidos': '🇺🇸', 'Japão': '🇯🇵',
  'Coreia do Sul': '🇰🇷', 'Marrocos': '🇲🇦', 'Senegal': '🇸🇳', 'Gana': '🇬🇭',
  'Nigéria': '🇳🇬', 'Camarões': '🇨🇲', 'Costa Rica': '🇨🇷', 'Equador': '🇪🇨',
  'Peru': '🇵🇪', 'Chile': '🇨🇱', 'Austrália': '🇦🇺', 'Polônia': '🇵🇱',
  'Dinamarca': '🇩🇰', 'Suíça': '🇨🇭', 'Sérvia': '🇷🇸', 'Outro': '🏳️',
}
