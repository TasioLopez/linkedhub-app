'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      let fileUrl = ''

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('downloads')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('downloads').getPublicUrl(filePath)
        if (!data?.publicUrl) throw new Error('Failed to retrieve file URL')
        fileUrl = data.publicUrl
      }

      const { error } = await supabase.from('resources').insert([
        {
          resource_title: title,
          resource_desc: desc,
          file_url: fileUrl || null, // optional fallback
        },
      ])

      if (error) throw error

      alert('Upload successful!')
      setTitle('')
      setDesc('')
      setFile(null)
    } catch (err: unknown) {
      const error = err as { message?: string }
      console.error('Upload error:', error)
      alert(error?.message || 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">📤 Upload Your Resource</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload File (PDF, PNG, etc)</label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
