import { db } from './db'

// Keywords for fiscal relevance detection
const FISCAL_KEYWORDS = [
  'impuestos',
  'declaración',
  'hacienda',
  'iva',
  'irpf',
  'retención',
  'deducción',
  'freelancer',
  'autónomo',
  'factura',
  'nómina',
  'paro',
  'ccc',
  'seguridad social',
  'fiscal',
  'tributación',
  'impuesto',
]

// Brand keywords
const BRAND_KEYWORDS = ['taxdown', 'tax down', 'software impuestos']

interface AnalysisResult {
  hasBrandMention: boolean
  hasFiscalKeywords: boolean
  keywords: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  relevanceScore: number
}

export class RedditMonitor {
  private minRelevanceScore = 10

  analyzeContent(text: string): AnalysisResult {
    const lowerText = text.toLowerCase()

    // Check for brand mentions
    const hasBrandMention = BRAND_KEYWORDS.some((kw) =>
      lowerText.includes(kw)
    )

    // Check for fiscal keywords
    const matchedKeywords = FISCAL_KEYWORDS.filter((kw) =>
      lowerText.includes(kw)
    )
    const hasFiscalKeywords = matchedKeywords.length > 0

    // Simple sentiment analysis (can be improved)
    const sentiment = this.analyzeSentiment(lowerText)

    // Calculate relevance score
    let score = 0

    // Brand mention is high priority
    if (hasBrandMention) {
      score += 80
    }

    // Fiscal keywords add value
    if (hasFiscalKeywords) {
      score += matchedKeywords.length * 10
    }

    // Positive sentiment boosts score
    if (sentiment === 'positive') {
      score += 15
    } else if (sentiment === 'negative') {
      score -= 10
    }

    // Cap score at 100
    score = Math.min(100, Math.max(0, score))

    return {
      hasBrandMention,
      hasFiscalKeywords,
      keywords: matchedKeywords,
      sentiment,
      relevanceScore: score,
    }
  }

  private analyzeSentiment(
    text: string
  ): 'positive' | 'neutral' | 'negative' {
    const positiveWords = [
      'excelente',
      'bueno',
      'útil',
      'recomendado',
      'perfecto',
      'fácil',
      'rápido',
    ]
    const negativeWords = [
      'malo',
      'difícil',
      'lento',
      'problema',
      'error',
      'decepción',
      'horrible',
    ]

    const positiveCount = positiveWords.filter((w) => text.includes(w)).length
    const negativeCount = negativeWords.filter((w) => text.includes(w)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  async syncRedditContent() {
    // This is a placeholder for real Reddit API integration
    // In production, use PRAW or similar library
    console.log('Syncing Reddit content...')

    try {
      // TODO: Implement actual Reddit API calls
      // For now, this is just the structure
      const posts: any[] = []
      const comments: any[] = []

      // Process posts
      for (const post of posts) {
        await this.processPost(post)
      }

      // Process comments
      for (const comment of comments) {
        await this.processComment(comment)
      }

      return {
        success: true,
        postsProcessed: posts.length,
        commentsProcessed: comments.length,
      }
    } catch (error) {
      console.error('Reddit sync error:', error)
      throw error
    }
  }

  private async processPost(post: any) {
    // Check if post already exists
    const existing = await db.redditPost.findUnique({
      where: { redditId: post.id },
    })

    if (existing) return

    const analysis = this.analyzeContent(`${post.title} ${post.selftext}`)

    if (analysis.relevanceScore >= this.minRelevanceScore) {
      await db.redditPost.create({
        data: {
          redditId: post.id,
          redditUrl: post.url,
          title: post.title,
          author: post.author,
          content: post.selftext,
          hasTaxDownMention: analysis.hasBrandMention,
          isFiscalityRelated: analysis.hasFiscalKeywords,
          sentiment: analysis.sentiment,
          keywords: analysis.keywords,
          score: post.score,
          numComments: post.num_comments,
          relevanceScore: analysis.relevanceScore,
        },
      })
    }
  }

  private async processComment(comment: any) {
    // Check if comment already exists
    const existing = await db.redditComment.findUnique({
      where: { redditId: comment.id },
    })

    if (existing) return

    const analysis = this.analyzeContent(comment.body)

    if (analysis.relevanceScore >= this.minRelevanceScore) {
      await db.redditComment.create({
        data: {
          redditId: comment.id,
          redditUrl: comment.permalink,
          postId: comment.link_id,
          author: comment.author,
          content: comment.body,
          hasTaxDownMention: analysis.hasBrandMention,
          isFiscalityRelated: analysis.hasFiscalKeywords,
          score: comment.score,
        },
      })
    }
  }

  // Generate sample data for testing
  async generateSampleData() {
    const samplePosts = [
      {
        redditId: 'post1',
        redditUrl: 'https://reddit.com/r/Spain/comments/post1',
        title: '¿Cuál es la mejor forma de declarar impuestos siendo freelancer?',
        author: 'user123',
        content:
          'Hola, soy freelancer y no sé cómo declarar correctamente mis impuestos. ¿Alguien usa algún software que me recomiende?',
        hasTaxDownMention: false,
        isFiscalityRelated: true,
        sentiment: 'neutral',
        keywords: ['impuestos', 'declaración', 'freelancer'],
        score: 45,
        numComments: 8,
        relevanceScore: 45,
      },
      {
        redditId: 'post2',
        redditUrl: 'https://reddit.com/r/Spain/comments/post2',
        title: 'Experiencia positiva con TaxDown para declaración de impuestos',
        author: 'happy_taxpayer',
        content:
          'Acaba de usar TaxDown para hacer la declaración de impuestos y fue muy fácil. Recomendado para todos los autónomos.',
        hasTaxDownMention: true,
        isFiscalityRelated: true,
        sentiment: 'positive',
        keywords: ['taxdown', 'impuestos', 'autónomo'],
        score: 92,
        numComments: 15,
        relevanceScore: 95,
      },
      {
        redditId: 'post3',
        redditUrl: 'https://reddit.com/r/Spain/comments/post3',
        title: 'Guía completa sobre IRPF en España 2024',
        author: 'tax_expert',
        content:
          'He preparado una guía completa sobre cómo funciona el IRPF. Todo autónomo debería saber esto.',
        hasTaxDownMention: false,
        isFiscalityRelated: true,
        sentiment: 'neutral',
        keywords: ['irpf', 'autónomo', 'impuestos'],
        score: 134,
        numComments: 24,
        relevanceScore: 50,
      },
    ]

    const sampleComments = [
      {
        redditId: 'comment1',
        redditUrl: 'https://reddit.com/r/Spain/comments/post1/_/comment1',
        postId: 'post1',
        author: 'helpful_user',
        content:
          'Yo uso TaxDown y me facilita mucho la declaración. Muy recomendado.',
        hasTaxDownMention: true,
        isFiscalityRelated: true,
        score: 23,
        relevanceScore: 85,
      },
      {
        redditId: 'https://reddit.com/r/Spain/comments/post1/_/comment2',
        postId: 'post1',
        author: 'tax_consultant',
        content:
          'La declaración de impuestos como freelancer requiere declarar todos tus ingresos.',
        hasTaxDownMention: false,
        isFiscalityRelated: true,
        score: 18,
        relevanceScore: 35,
      },
    ]

    // Upsert posts
    for (const post of samplePosts) {
      await db.redditPost.upsert({
        where: { redditId: post.redditId },
        update: post,
        create: post,
      })
    }

    // Upsert comments (handle the typo in sample data)
    for (const comment of sampleComments) {
      await db.redditComment.upsert({
        where: { redditId: comment.redditId },
        update: {
          redditUrl: comment.redditId,
          postId: comment.postId,
          author: comment.author,
          content: comment.content,
          hasTaxDownMention: comment.hasTaxDownMention,
          isFiscalityRelated: comment.isFiscalityRelated,
          score: comment.score,
        },
        create: {
          redditId: comment.redditId,
          redditUrl: comment.redditId,
          postId: comment.postId,
          author: comment.author,
          content: comment.content,
          hasTaxDownMention: comment.hasTaxDownMention,
          isFiscalityRelated: comment.isFiscalityRelated,
          score: comment.score,
        },
      })
    }

    return {
      postsCreated: samplePosts.length,
      commentsCreated: sampleComments.length,
    }
  }
}

export const redditMonitor = new RedditMonitor()
