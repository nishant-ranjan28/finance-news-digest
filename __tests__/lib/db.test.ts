/** @jest-environment node */

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

import { createClient } from '@supabase/supabase-js'
import {
  articleExists,
  saveArticle,
  getArticlesByDate,
  getActiveSubscribers,
  addSubscriber,
} from '@/lib/db'

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_ANON_KEY = 'test-key'
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
})

describe('articleExists', () => {
  it('returns true when article found', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ data: { id: '123' }, error: null })
    const result = await articleExists('https://example.com')
    expect(result).toBe(true)
  })

  it('returns false when article not found', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null })
    const result = await articleExists('https://example.com')
    expect(result).toBe(false)
  })
})

describe('saveArticle', () => {
  it('inserts article without error', async () => {
    mockSupabase.insert.mockResolvedValue({ error: null })
    await expect(
      saveArticle({ title: 'Test', url: 'https://example.com', source: 'example.com' })
    ).resolves.not.toThrow()
  })
})

describe('getArticlesByDate', () => {
  it('returns articles for a date', async () => {
    const fakeArticles = [{ id: '1', title: 'Test', url: 'https://example.com' }]
    mockSupabase.order.mockResolvedValue({ data: fakeArticles, error: null })
    const result = await getArticlesByDate('2026-03-11')
    expect(result).toEqual(fakeArticles)
  })
})

describe('getActiveSubscribers', () => {
  it('returns active subscriber emails', async () => {
    mockSupabase.eq.mockResolvedValue({ data: [{ email: 'a@b.com' }], error: null })
    const result = await getActiveSubscribers()
    expect(result[0].email).toBe('a@b.com')
  })
})

describe('addSubscriber', () => {
  it('inserts subscriber without error', async () => {
    mockSupabase.insert.mockResolvedValue({ error: null })
    await expect(addSubscriber('user@example.com')).resolves.not.toThrow()
  })

  it('throws on duplicate email', async () => {
    mockSupabase.insert.mockResolvedValue({ error: { code: '23505', message: 'duplicate' } })
    await expect(addSubscriber('user@example.com')).rejects.toThrow('Email already subscribed')
  })
})
