/** @jest-environment node */
import { fetchFinanceNews } from '@/lib/tavily'

global.fetch = jest.fn()

describe('fetchFinanceNews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.TAVILY_API_KEY = 'test-key'
  })

  it('returns an array of articles', async () => {
    const mockResponse = {
      results: [
        {
          title: 'Fed raises rates',
          url: 'https://example.com/fed',
          content: 'The Fed raised interest rates...',
          source: 'example.com',
          published_date: '2026-03-11',
        },
      ],
    }
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const articles = await fetchFinanceNews()
    expect(Array.isArray(articles)).toBe(true)
    expect(articles.length).toBeGreaterThan(0)
    expect(articles[0]).toHaveProperty('title')
    expect(articles[0]).toHaveProperty('url')
  })

  it('returns empty array on fetch failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 429 })
    const articles = await fetchFinanceNews()
    expect(articles).toEqual([])
  })

  it('throws when TAVILY_API_KEY is missing', async () => {
    delete process.env.TAVILY_API_KEY
    await expect(fetchFinanceNews()).rejects.toThrow('Missing TAVILY_API_KEY')
  })
})
