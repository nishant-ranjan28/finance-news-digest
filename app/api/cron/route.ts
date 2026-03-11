import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { fetchFinanceNews } from '@/lib/tavily'
import { summarizeArticle } from '@/lib/summarize'
import { articleExists, saveArticle, getArticlesByDate, getActiveSubscribers } from '@/lib/db'
import { sendDigestEmail } from '@/lib/email'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function safeCompare(a: string, b: string): boolean {
  // Compare HMAC digests - always 32 bytes, prevents length oracle attack
  const key = Buffer.from('finance-news-digest-cron-compare')
  const hmacA = createHmac('sha256', key).update(a).digest()
  const hmacB = createHmac('sha256', key).update(b).digest()
  return timingSafeEqual(hmacA, hmacB)
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || !authHeader || !safeCompare(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const articles = await fetchFinanceNews()
    console.log(`Fetched ${articles.length} articles from Tavily`)

    let saved = 0
    let skipped = 0

    for (const article of articles) {
      const exists = await articleExists(article.url)
      if (exists) { skipped++; continue }

      try {
        const result = await summarizeArticle({ title: article.title, content: article.content })
        await saveArticle({
          title: article.title,
          url: article.url,
          summary: result.summary,
          category: result.category,
          importance_score: result.importance_score,
          source: article.source,
          published_date: article.published_date,
        })
        saved++
        await sleep(500)
      } catch (err) {
        console.error(`Failed to process article "${article.title}":`, err)
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const todayArticles = await getArticlesByDate(today)
    const top10 = todayArticles.slice(0, 10)
    const subscribers = await getActiveSubscribers()
    const emails = subscribers.map((s) => s.email)

    if (emails.length > 0 && top10.length > 0) {
      await sendDigestEmail(top10, emails)
    }

    return NextResponse.json({ success: true, saved, skipped, emailsSent: emails.length })
  } catch (err) {
    console.error('Cron pipeline error:', err)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
