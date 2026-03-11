jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test-id' }),
    },
  })),
}))

import { Resend } from 'resend'
import { sendDigestEmail } from '@/lib/email'
import { Article } from '@/lib/db'

describe('sendDigestEmail', () => {
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'Fed Raises Rates',
      url: 'https://example.com/fed',
      summary: 'The Fed raised rates by 25bps...',
      category: 'Macro',
      importance_score: 9,
      source: 'reuters.com',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
  })

  it('sends emails to all subscribers', async () => {
    const mockSend = jest.fn().mockResolvedValue({ id: 'test-id' })
    ;(Resend as jest.Mock).mockImplementation(() => ({
      emails: { send: mockSend },
    }))

    await sendDigestEmail(mockArticles, ['a@b.com', 'c@d.com'])
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('does nothing when no subscribers', async () => {
    const mockSend = jest.fn()
    ;(Resend as jest.Mock).mockImplementation(() => ({
      emails: { send: mockSend },
    }))

    await sendDigestEmail(mockArticles, [])
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('throws when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY
    await expect(sendDigestEmail(mockArticles, ['a@b.com'])).rejects.toThrow('Missing RESEND_API_KEY')
  })
})
