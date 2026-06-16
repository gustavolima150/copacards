import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'
import { SELECTIONS, POSITIONS, FLAGS } from '../lib/utils'
import { ArrowLeft, Upload, Image } from 'lucide-react'

const STATUSES = [
  { value: 'tenho', label: '✅ Tenho' },
  { value: 'quero', label: '⭐ Quero' },
  { value: 'repetida', label: '🔁 Repetida' },
]

export function StickerForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: { status: 'tenho', selection: 'Brasil' } })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const imageUrl = watch('image_url')
  const selectedSelection = watch('selection')

  useEffect(() => {
    if (imageUrl && imageUrl.startsWith('http')) setImagePreview(imageUrl)
  }, [imageUrl])

  useEffect(() => {
    if (isEdit) loadSticker()
  }, [id])

  async function loadSticker() {
    const { data } = await supabase.from('stickers').select('*').eq('id', id).single()
    if (data) {
      reset(data)
      setImagePreview(data.image_url || '')
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `stickers/${user.id}/${Date.now()}.${ext}`
      console.log('📤 Uploading to:', path)
      
      const { error, data: uploadData } = await supabase.storage.from('stickers').upload(path, file, { upsert: true })
      console.log('Upload response:', { error, uploadData })
      
      if (error) {
        console.error('❌ Upload error:', error)
        toast({ title: 'Erro no upload', description: error.message, type: 'error' })
        setUploading(false)
        return
      }
      
      const { data, error: urlError } = supabase.storage.from('stickers').getPublicUrl(path)
      console.log('URL response:', { data, urlError })
      
      if (!data?.publicUrl) {
        console.error('❌ No public URL returned')
        toast({ title: 'Erro ao gerar URL', type: 'error' })
        setUploading(false)
        return
      }
      
      console.log('✅ Public URL:', data.publicUrl)
      reset(v => ({ ...v, image_url: data.publicUrl }))
      setImagePreview(data.publicUrl)
      toast({ title: 'Imagem enviada! ✅', type: 'success' })
    } catch (err) {
      console.error('❌ Exception:', err)
      toast({ title: 'Erro inesperado', description: err.message, type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data) {
    setLoading(true)
    const payload = { ...data, user_id: user.id, shirt_number: parseInt(data.shirt_number) || null }
    let error
    if (isEdit) {
      const res = await supabase.from('stickers').update(payload).eq('id', id).eq('user_id', user.id)
      error = res.error
    } else {
      const res = await supabase.from('stickers').insert(payload).select().single()
      error = res.error
    }
    setLoading(false)
    if (error) return toast({ title: 'Erro ao salvar', description: error.message, type: 'error' })
    toast({ title: isEdit ? 'Figurinha atualizada! ✅' : 'Figurinha criada! 🎉', type: 'success' })
    navigate('/collection')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-xl text-gray-900 dark:text-white">
          {isEdit ? 'Editar Figurinha' : 'Nova Figurinha'} ⚽
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-5 flex flex-col gap-4">
        {/* Image */}
        <div>
          <label className="label">Imagem do Atleta</label>
          <div className="flex flex-col gap-2">
            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden h-48 bg-gradient-to-br from-brand-green/10 to-brand-blue/10">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-2xl px-2 py-1 rounded-lg">
                  {FLAGS[selectedSelection] || '🏳️'}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input {...register('image_url')} className="input flex-1" placeholder="URL da imagem (https://...)" />
              <label className={`btn-secondary cursor-pointer shrink-0 ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? <Spinner size="sm" /> : <Upload className="w-4 h-4" />}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Nome do Atleta *</label>
            <input {...register('athlete_name', { required: 'Nome obrigatório' })} className="input" placeholder="Ex: Vini Jr." />
            {errors.athlete_name && <p className="text-red-500 text-xs mt-1">{errors.athlete_name.message}</p>}
          </div>
          <div>
            <label className="label">Seleção *</label>
            <select {...register('selection', { required: true })} className="input">
              {SELECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Posição *</label>
            <select {...register('position', { required: true })} className="input">
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Nº Camisa</label>
            <input {...register('shirt_number')} type="number" min="1" max="99" className="input" placeholder="10" />
          </div>
          <div>
            <label className="label">Status *</label>
            <select {...register('status', { required: true })} className="input">
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Descrição curta</label>
            <textarea {...register('description')} className="input resize-none" rows={2}
              placeholder="Ex: Atacante revelação da Copa do Mundo 2026..." />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 py-3">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? <Spinner size="sm" className="text-white" /> : isEdit ? 'Salvar' : 'Criar Figurinha'}
          </button>
        </div>
      </form>
    </div>
  )
}
