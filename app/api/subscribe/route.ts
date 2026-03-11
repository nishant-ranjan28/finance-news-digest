import { NextRequest, NextResponse } from 'next/server'
import { addSubscriber } from '@/lib/db'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = (body?.email ?? '').trim().toLowerCase()

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    await addSubscriber(email)
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = (err as Error).message
    if (msg === 'Email already subscribed') {
      return NextResponse.json({ error: msg }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
