import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taxdown.es' },
    update: {},
    create: {
      email: 'admin@taxdown.es',
      name: 'Admin TaxDown',
      role: 'ADMIN',
      status: 'APPROVED',
    },
  })
  console.log('✓ Admin user created:', adminUser.email)

  // Create sample ambassadors
  const ambassador1 = await prisma.user.upsert({
    where: { email: 'embajador1@taxdown.es' },
    update: {},
    create: {
      email: 'embajador1@taxdown.es',
      name: 'Juan García',
      role: 'AMBASSADOR',
      status: 'APPROVED',
    },
  })
  console.log('✓ Ambassador 1 created:', ambassador1.email)

  const ambassador2 = await prisma.user.upsert({
    where: { email: 'embajador2@taxdown.es' },
    update: {},
    create: {
      email: 'embajador2@taxdown.es',
      name: 'María López',
      role: 'AMBASSADOR',
      status: 'APPROVED',
    },
  })
  console.log('✓ Ambassador 2 created:', ambassador2.email)

  // Create opportunities
  const opp1 = await prisma.opportunity.upsert({
    where: { id: 'opp1' },
    update: {},
    create: {
      id: 'opp1',
      title: 'Consejos de fiscalidad para freelancers',
      description:
        'Ayuda a otros freelancers compartiendo tus conocimientos sobre fiscalidad',
      category: 'fiscal',
      reward: 5,
      status: 'ACTIVE',
      context:
        'En Reddit, muchas personas preguntan cómo manejar impuestos siendo freelancer',
      suggestedText:
        'Como freelancer, uso TaxDown para simplificar mi declaración de impuestos. Es muy fácil de usar.',
      requirements: { minReputation: 50 },
      maxRedemptions: -1,
      createdBy: adminUser.id,
    },
  })
  console.log('✓ Opportunity 1 created:', opp1.title)

  const opp2 = await prisma.opportunity.upsert({
    where: { id: 'opp2' },
    update: {},
    create: {
      id: 'opp2',
      title: 'IRPF y deducción de gastos',
      description:
        'Habla sobre cómo deducir correctamente los gastos de negocio',
      category: 'impuestos',
      reward: 5,
      status: 'ACTIVE',
      context: 'IRPF es un tema frecuente en r/Spain',
      suggestedText:
        'TaxDown me ayuda a gestionar todas mis deducciones sin complicaciones.',
      maxRedemptions: -1,
      createdBy: adminUser.id,
    },
  })
  console.log('✓ Opportunity 2 created:', opp2.title)

  // Create sample Reddit posts
  const _post1 = await prisma.redditPost.upsert({
    where: { redditId: 'sample_post_1' },
    update: {},
    create: {
      redditId: 'sample_post_1',
      redditUrl: 'https://reddit.com/r/Spain/comments/sample1/',
      title: '¿Cómo declarar impuestos siendo freelancer?',
      author: 'freelancer_confused',
      content:
        'Hola, acabo de empezar a trabajar como freelancer y no sé cómo hacerlo todo correctamente...',
      hasTaxDownMention: false,
      isFiscalityRelated: true,
      sentiment: 'neutral',
      keywords: ['impuestos', 'freelancer', 'declaración'],
      score: 42,
      numComments: 8,
      relevanceScore: 45,
    },
  })
  console.log('✓ Sample post created')

  const post2 = await prisma.redditPost.upsert({
    where: { redditId: 'sample_post_2' },
    update: {},
    create: {
      redditId: 'sample_post_2',
      redditUrl: 'https://reddit.com/r/Spain/comments/sample2/',
      title: 'Mi experiencia positiva con TaxDown',
      author: 'happy_taxpayer',
      content:
        'Hace poco usé TaxDown para hacer mi declaración de impuestos y me sorprendió lo fácil que fue. Muy recomendado para autónomos.',
      hasTaxDownMention: true,
      isFiscalityRelated: true,
      sentiment: 'positive',
      keywords: ['taxdown', 'impuestos', 'autónomo'],
      score: 87,
      numComments: 12,
      relevanceScore: 95,
    },
  })
  console.log('✓ Sample post with TaxDown mention created')

  console.log('✨ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
