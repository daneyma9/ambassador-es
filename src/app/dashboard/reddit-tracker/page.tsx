import { db } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RedditFeed } from '@/components/dashboard/reddit-feed'

export default async function RedditTrackerPage() {
  const redditPosts = await db.redditPost.findMany({
    where: {
      OR: [
        { hasTaxDownMention: true },
        { isFiscalityRelated: true },
      ],
    },
    orderBy: { scannedAt: 'desc' },
    take: 20,
  })

  const redditComments = await db.redditComment.findMany({
    where: {
      OR: [
        { hasTaxDownMention: true },
        { isFiscalityRelated: true },
      ],
    },
    orderBy: { scannedAt: 'desc' },
    take: 20,
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rastreo de Reddit</h1>
        <p className="text-gray-600 mt-2">
          Posts y comentarios relevantes sobre fiscalidad en r/Spain
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Posts Totales</p>
              <p className="text-2xl font-bold text-indigo-600">
                {redditPosts.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Con TaxDown</p>
              <p className="text-2xl font-bold text-green-600">
                {redditPosts.filter((p) => p.hasTaxDownMention).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Comentarios</p>
              <p className="text-2xl font-bold text-blue-600">
                {redditComments.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Actualizado</p>
              <p className="text-sm font-medium text-gray-900">
                Cada 30 min
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 border-b border-gray-200 pb-4">
              <button className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-medium">
                📄 Posts
              </button>
              <button className="px-4 py-2 border-b-2 border-transparent text-gray-600 font-medium hover:border-gray-200">
                💬 Comentarios
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Feed */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts Relevantes</h2>
        <RedditFeed
          items={redditPosts as any}
          type="posts"
        />
      </div>

      {/* Comments Feed */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comentarios Relevantes</h2>
        <RedditFeed
          items={redditComments as any}
          type="comments"
        />
      </div>
    </div>
  )
}
