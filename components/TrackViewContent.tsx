'use client'
import { useEffect } from 'react'
import { track } from '@/lib/pixel'

export default function TrackViewContent({ id, name, price, category }: { id: string; name: string; price: number; category?: string }) {
  useEffect(() => {
    track('ViewContent', { content_ids: [id], content_name: name, content_type: 'product', content_category: category, value: price, currency: 'CLP' })
  }, [id, name, price, category])
  return null
}