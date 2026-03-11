/** @jest-environment node */

jest.mock('@/lib/db', () => ({
  addSubscriber: jest.fn(),
}))

import { POST } from '@/app/api/subscribe/route'
import { addSubscriber } from '@/lib/db'
import { NextRequest } from 'next/server'

describe('POST /api/subscribe', () => {
  it('subscribes valid email', async () => {
    ;(addSubscriber as jest.Mock).mockResolvedValue(undefined)
    const req = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 400 for invalid email', async () => {
    const req = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 409 for duplicate email', async () => {
    ;(addSubscriber as jest.Mock).mockRejectedValue(new Error('Email already subscribed'))
    const req = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })
})
