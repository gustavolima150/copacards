import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ui/Toast'
import { Modal } from '../components/ui/Modal'
import { Avatar } from '../components/ui/Avatar'
import { Spinner } from '../components/ui/Spinner'
import { SELECTIONS } from '../lib/utils'
import { Camera } from 'lucide-react'

export function EditProfileModal({ open, onClose, profile, onSaved }) {
  const { user } = useStore()
  const { toast } = useToast()
  const { register, handleSubmit } = useForm({
    defaultValues: { username: profile?.username, bio: profile?.bio, favorite_selection: profile?.favorite_selection },
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url)

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      console.log('📤 Uploading avatar to:', path)
      
      const { error, data: uploadData } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      console.log('Upload response:', { error, uploadData })
      
      if (error) {
        console.error('❌ Upload error:', error)
        toast({ title: 'Erro no upload', description: error.message, type: 'error' })
        setUploading(false)
        return
      }
      
      const { data, error: urlError } = supabase.storage.from('avatars').getPublicUrl(path)
      console.log('URL response:', { data, urlError })
      
      if (!data?.publicUrl) {
        console.error('❌ No public URL returned')
        toast({ title: 'Erro ao gerar URL', type: 'error' })
        setUploading(false)
        return
      }
      
      console.log('✅ Public URL:', data.publicUrl)
      setPreviewUrl(data.publicUrl)
    } catch (err) {
      console.error('❌ Exception:', err)
      toast({ title: 'Erro inesperado', description: err.message, type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data) {
    setSaving(true)
    const updates = { id: user.id, username: data.username, bio: data.bio, favorite_selection: data.favorite_selection }
    if (previewUrl !== profile?.avatar_url) updates.avatar_url = previewUrl
    const { data: updated, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
    setSaving(false)
    if (error) return toast({ title: 'Erro ao salvar', type: 'error' })
    toast({ title: 'Perfil atualizado! ✅', type: 'success' })
    onSaved?.(updated)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar src={previewUrl} name={profile?.username} size="xl" />
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-brand-green rounded-full flex items-center justify-center cursor-pointer shadow-md">
              {uploading ? <Spinner size="sm" className="text-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400">Clique no ícone para alterar a foto</p>
        </div>
        <div>
          <label className="label">Nome de usuário</label>
          <input {...register('username', { required: true })} className="input" />
        </div>
        <div>
          <label className="label">Biografia</label>
          <textarea {...register('bio')} className="input resize-none" rows={3} placeholder="Conte um pouco sobre você..." />
        </div>
        <div>
          <label className="label">Seleção Favorita</label>
          <select {...register('favorite_selection')} className="input">
            {SELECTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" disabled={saving || uploading} className="btn-primary w-full py-3">
          {saving ? <Spinner size="sm" className="text-white" /> : 'Salvar alterações'}
        </button>
      </form>
    </Modal>
  )
}
