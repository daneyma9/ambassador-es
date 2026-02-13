export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function extractRedditIds(url: string): {
  postId?: string
  commentId?: string
} {
  const postIdMatch = url.match(/\/r\/\w+\/comments\/([a-z0-9]+)/i)
  const commentIdMatch = url.match(/\/comments\/[a-z0-9]+\/.*?\/([a-z0-9]+)/i)

  return {
    postId: postIdMatch?.[1],
    commentId: commentIdMatch?.[1],
  }
}

export function maskIban(iban: string): string {
  if (iban.length < 4) return '****'
  return '*'.repeat(iban.length - 4) + iban.slice(-4)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
