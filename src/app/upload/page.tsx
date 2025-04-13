'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function UploadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Confirm your env key is loaded
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title) {
      alert('File and title are required')
      return
    }

    setLoading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('downloads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('downloads')
        .getPublicUrl(filePath)

      const publicUrl = data?.publicUrl
      if (!publicUrl) throw new Error('Failed to generate public URL')

      // Insert into database (requires `creator_email`)
      const { error: dbError, data: insertData } = await supabase
        .from('resources')
        .insert([
          {
            resource_title: title,
            resource_desc: desc,
            file_url: publicUrl,
            creator_email: 'test@email.com',  // must be filled
            color_theme: 'standard',
          }
        ])
        .select()

      console.log('Insert result:', insertData)

      if (dbError) throw dbError

      router.push('/')
    } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Upload error:', err.message)
          alert(`Upload failed: ${err.message}`)
        } else {
          console.error('Unexpected error', err)
          alert('Unexpected error occurred')
        }
      }
      

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">📤 Upload Your Resource</h1>
      <form onSubmit={handleUpload} className="space-y-4">
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
          <label className="block mb-1 font-medium">Upload File (PDF, etc)</label>
          <input
            type="file"
            accept=".pdf,.docx,.png,.jpg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  )
}
