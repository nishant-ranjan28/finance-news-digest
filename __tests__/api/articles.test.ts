/** @jest-environment node */

jest.mock('@/lib/db', () => ({
  getArticlesByDate: jest.fn(),
}))

import { GET } from '@/app/api/articles/route'
import { getArticlesByDate } from '@/lib/db'
import { NextRequest } from 'next/server'

describe('GET /api/articles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns articles for today', async () => {
    ;(getArticlesByDate as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Test', url: 'https://example.com' },
    ])
    const req = new NextRequest('http://localhost/api/articles')
    const res = await GET(req)
    const data = await res.json()
    expect(data.articles).toHaveLength(1)
  })

  it('accepts a date query param', async () => {
    ;(getArticlesByDate as jest.Mock).mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/articles?date=2026-03-11')
    const res = await GET(req)
    expect(getArticlesByDate).toHaveBeenCalledWith('2026-03-11')
  })

  it('ignores invalid date format', async () => {
    ;(getArticlesByDate as jest.Mock).mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/articles?date=not-a-date')
    await GET(req)
    const today = new Date().toISOString().split('T')[0]
    expect(getArticlesByDate).toHaveBeenCalledWith(today)
  })
})
