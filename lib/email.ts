import { Resend } from 'resend'
import { Article } from './db'

const CATEGORY_COLORS: Record<string, string> = {
  Markets: '#16a34a',
  Macro: '#2563eb',
  Crypto: '#7c3aed',
  Earnings: '#d97706',
  Policy: '#dc2626',
}

function buildEmailHtml(articles: Article[], date: string): string {
  const articleRows = articles
    .map((a) => {
      const color = CATEGORY_COLORS[a.category ?? ''] ?? '#6b7280'
      return `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:16px;background:#ffffff;">
        <div style="margin-bottom:8px;">
          <span style="background:${color};color:white;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">
            ${a.category ?? 'General'}
          </span>
          <span style="color:#9ca3af;font-size:12px;margin-left:8px;">${a.source ?? ''}</span>
          ${a.importance_score ? `<span style="color:#9ca3af;font-size:12px;margin-left:8px;">⭐ ${a.importance_score}/10</span>` : ''}
        </div>
        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">
          <a href="${a.url}" style="color:#111827;text-decoration:none;">${a.title}</a>
        </h2>
        <p style="margin:0 0 12px;color:#4b5563;font-size:14px;line-height:1.6;">
          ${a.summary ?? ''}
        </p>
        <a href="${a.url}" style="color:#16a34a;font-size:14px;font-weight:600;text-decoration:none;">
          Read More →
        </a>
      </div>`
    })
    .join('')

  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:20px;">
    <div style="max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;border-radius:12px;margin-bottom:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:28px;">Finance News Digest</h1>
        <p style="color:#dcfce7;margin:8px 0 0;">${date} — Top finance stories today</p>
      </div>
      ${articleRows}
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:24px;">
        You are receiving this because you subscribed at Finance News Digest.
      </p>
    </div>
  </body>
  </html>`
}

export async function sendDigestEmail(
  articles: Article[],
  subscriberEmails: string[]
): Promise<void> {
  if (subscriberEmails.length === 0) return

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('Missing RESEND_API_KEY')

  const resend = new Resend(apiKey)
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const html = buildEmailHtml(articles, date)

  await Promise.allSettled(
    subscriberEmails.map((email) =>
      resend.emails.send({
        from: 'Finance News Digest <onboarding@resend.dev>',
        to: email,
        subject: `Finance News Digest — ${date}`,
        html,
      })
    )
  )
}
