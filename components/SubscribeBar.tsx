'use client'

import { useState } from 'react'

export default function SubscribeBar() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else if (res.status === 409) {
        setStatus('duplicate')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
      <p className="text-sm font-medium text-green-800 mb-3">
        Get the daily finance digest in your inbox
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {status === 'success' && <p className="text-xs text-green-700 mt-2">Subscribed! Check your inbox tomorrow morning.</p>}
      {status === 'duplicate' && <p className="text-xs text-amber-600 mt-2">You&apos;re already subscribed.</p>}
      {status === 'error' && <p className="text-xs text-red-600 mt-2">Something went wrong. Try again.</p>}
    </div>
  )
}
