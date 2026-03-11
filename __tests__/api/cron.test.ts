/** @jest-environment node */

jest.mock('@/lib/tavily', () => ({ fetchFinanceNews: jest.fn() }))
jest.mock('@/lib/summarize', () => ({ summarizeArticle: jest.fn() }))
jest.mock('@/lib/db', () => ({
  articleExists: jest.fn(),
  saveArticle: jest.fn(),
  getArticlesByDate: jest.fn(),
  getActiveSubscribers: jest.fn(),
}))
jest.mock('@/lib/email', () => ({ sendDigestEmail: jest.fn() }))

import { GET } from '@/app/api/cron/route'
import { fetchFinanceNews } from '@/lib/tavily'
import { summarizeArticle } from '@/lib/summarize'
import { articleExists, saveArticle, getArticlesByDate, getActiveSubscribers } from '@/lib/db'
import { sendDigestEmail } from '@/lib/email'
import { NextRequest } from 'next/server'

describe('GET /api/cron', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'test-secret'
  })

  it('returns 401 without auth', async () => {
    const req = new NextRequest('http://localhost/api/cron')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('runs pipeline with correct auth', async () => {
    ;(fetchFinanceNews as jest.Mock).mockResolvedValue([
      { title: 'Test', url: 'https://example.com', content: 'Content', source: 'example.com' },
    ])
    ;(articleExists as jest.Mock).mockResolvedValue(false)
    ;(summarizeArticle as jest.Mock).mockResolvedValue({
      summary: 'Test summary',
      category: 'Markets',
      importance_score: 7,
    })
    ;(saveArticle as jest.Mock).mockResolvedValue(undefined)
    ;(getArticlesByDate as jest.Mock).mockResolvedValue([])
    ;(getActiveSubscribers as jest.Mock).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/cron', {
      headers: { authorization: 'Bearer test-secret' },
    })
    const res = await GET(req)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.saved).toBe(1)
  })
})
