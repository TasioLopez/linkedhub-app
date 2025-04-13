'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Resource = {
  id: string
  resource_title: string
  resource_desc: string
  file_url: string
  created_at: string
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resources:', error)
      } else {
        setResources(data || [])
      }

      setLoading(false)
    }

    fetchResources()
  }, [])

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">📄 My Shared Resources</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : resources.length === 0 ? (
        <p className="text-center text-gray-600">No resources found.</p>
      ) : (
        <ul className="space-y-6">
          {resources.map((res) => (
            <li
              key={res.id}
              className="border border-gray-200 rounded-md p-4 shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-800">{res.resource_title}</h2>
              <p className="text-gray-600 mb-2">{res.resource_desc}</p>
              <a
                href={res.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-600 hover:underline font-medium"
              >
                Download File →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
