'use client'

import { useState } from 'react'

export default function SubscribePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok) { setStatus('success'); setEmail('') }
    else if (res.status === 409) setStatus('duplicate')
    else setStatus('error')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Finance News Digest</h1>
        <p className="text-gray-500 text-sm mb-6">
          Get the top finance, markets, and global economics stories delivered every morning.
        </p>
        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-semibold">You&apos;re subscribed!</p>
            <p className="text-green-600 text-sm mt-1">Expect your first digest tomorrow morning.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe for Free'}
            </button>
            {status === 'duplicate' && <p className="text-xs text-amber-600 text-center">You&apos;re already subscribed.</p>}
            {status === 'error' && <p className="text-xs text-red-600 text-center">Something went wrong. Try again.</p>}
          </form>
        )}
        <p className="text-xs text-gray-400 text-center mt-4">
          <a href="/" className="hover:text-green-600">← Back to digest</a>
        </p>
      </div>
    </main>
  )
}
