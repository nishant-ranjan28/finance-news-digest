/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import ArticleCard from '@/components/ArticleCard'

const mockArticle = {
  id: '1',
  title: 'Fed Raises Rates',
  url: 'https://example.com/fed',
  summary: 'The Federal Reserve raised rates by 25bps...',
  category: 'Macro',
  importance_score: 9,
  source: 'reuters.com',
}

describe('ArticleCard', () => {
  it('renders title and summary', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('Fed Raises Rates')).toBeInTheDocument()
    expect(screen.getByText(/Federal Reserve raised/)).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('Macro')).toBeInTheDocument()
  })

  it('renders Read More link pointing to article URL', () => {
    render(<ArticleCard article={mockArticle} />)
    const link = screen.getByRole('link', { name: /read more/i })
    expect(link).toHaveAttribute('href', 'https://example.com/fed')
  })
})
