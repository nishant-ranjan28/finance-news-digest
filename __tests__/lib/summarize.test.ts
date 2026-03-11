import { summarizeArticle, SummarizeResult } from '@/lib/summarize'

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({ generateContent: jest.fn() }),
  })),
}))

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn() } },
  }))
})

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn() } },
  }))
})

import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import OpenAI from 'openai'

describe('summarizeArticle', () => {
  const mockArticle = { title: 'Fed raises rates', content: 'The Federal Reserve raised rates...' }

  const validResult: SummarizeResult = {
    summary: 'A 3-4 sentence summary.',
    category: 'Markets',
    importance_score: 8,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GEMINI_API_KEY = 'test-gemini-key'
    process.env.GROQ_API_KEY = 'test-groq-key'
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key'
  })

  it('returns parsed result from Groq on success', async () => {
    ;(Groq as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(validResult) } }],
          }),
        },
      },
    }))
    const result = await summarizeArticle(mockArticle)
    expect(result.category).toBe('Markets')
    expect(result.importance_score).toBe(8)
    expect(result.summary).toBeDefined()
  })

  it('falls back to OpenRouter when Groq fails', async () => {
    ;(Groq as unknown as jest.Mock).mockImplementation(() => ({
      chat: { completions: { create: jest.fn().mockRejectedValue(new Error('Rate limit')) } },
    }))
    ;(OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(validResult) } }],
          }),
        },
      },
    }))
    const result = await summarizeArticle(mockArticle)
    expect(result.summary).toBeDefined()
  })

  it('falls back to Gemini when Groq and OpenRouter fail', async () => {
    ;(Groq as unknown as jest.Mock).mockImplementation(() => ({
      chat: { completions: { create: jest.fn().mockRejectedValue(new Error('fail')) } },
    }))
    ;(OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: { completions: { create: jest.fn().mockRejectedValue(new Error('fail')) } },
    }))
    ;(GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => JSON.stringify(validResult) },
        }),
      }),
    }))
    const result = await summarizeArticle(mockArticle)
    expect(result.summary).toBeDefined()
  })

  it('throws when all providers fail', async () => {
    ;(Groq as unknown as jest.Mock).mockImplementation(() => ({
      chat: { completions: { create: jest.fn().mockRejectedValue(new Error('fail')) } },
    }))
    ;(OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: { completions: { create: jest.fn().mockRejectedValue(new Error('fail')) } },
    }))
    ;(GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockRejectedValue(new Error('fail')),
      }),
    }))
    await expect(summarizeArticle(mockArticle)).rejects.toThrow()
  })
})
