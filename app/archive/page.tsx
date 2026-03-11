'use client'

import { useState } from 'react'
import ArticleCard from '@/components/ArticleCard'
import { Article } from '@/lib/db'

export default function ArchivePage() {
  const [date, setDate] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!date) return
    setLoading(true)
    setSearched(true)
    const res = await fetch(`/api/articles?date=${date}`)
    const data = await res.json()
    setArticles(data.articles ?? [])
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <a href="/" className="text-sm text-green-600 hover:underline mb-4 block">← Back to today</a>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Archive</h1>
          <p className="text-gray-500 text-sm">Browse past finance digests</p>
        </div>
        <div className="flex gap-3 mb-8">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Search
          </button>
        </div>
        {loading && <p className="text-gray-400 text-center py-8">Loading...</p>}
        {!loading && searched && articles.length === 0 && (
          <p className="text-gray-400 text-center py-8">No articles found for this date.</p>
        )}
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id ?? article.url} article={article} />
          ))}
        </div>
      </div>
    </main>
  )
}
