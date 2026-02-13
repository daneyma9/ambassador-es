'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface RedditItem {
  id: string
  redditId: string
  redditUrl: string
  title?: string
  author: string
  content: string
  hasTaxDownMention: boolean
  isFiscalityRelated: boolean
  sentiment?: string
  keywords?: string[]
  score: number
  numComments?: number
  scannedAt: Date
  relevanceScore: number
}

interface RedditFeedProps {
  items: RedditItem[]
  loading?: boolean
  type?: 'posts' | 'comments'
}

export function RedditFeed({
  items,
  loading = false,
  type = 'posts',
}: RedditFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-40 animate-pulse bg-gray-200">
            <div />
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay {type === 'posts' ? 'posts' : 'comentarios'} relevantes en este momento
          </p>
          <p className="text-gray-400 text-sm mt-2">
            El rastreo se ejecuta cada 30 minutos
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className={`hover:shadow-md transition-shadow ${
            item.hasTaxDownMention ? 'border-green-200 border-2' : ''
          }`}
        >
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 flex-1">
                      {item.title || item.content.substring(0, 60)}...
                    </h3>
                    <div className="flex gap-2">
                      {item.hasTaxDownMention && (
                        <Badge variant="success">💚 TaxDown</Badge>
                      )}
                      {item.isFiscalityRelated && (
                        <Badge variant="primary">📊 Fiscal</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content preview */}
              <p className="text-gray-700 text-sm line-clamp-3">
                {item.content}
              </p>

              {/* Keywords */}
              {item.keywords && item.keywords.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {item.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex gap-3">
                  <span>👤 {item.author}</span>
                  <span>⬆️ {item.score} upvotes</span>
                  {item.numComments && (
                    <span>💬 {item.numComments} comments</span>
                  )}
                  <span>{formatDate(new Date(item.scannedAt))}</span>
                </div>

                <a
                  href={item.redditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Ver en Reddit →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
