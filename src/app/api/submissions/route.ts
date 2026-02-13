import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { submissionSchema } from '@/lib/validation'
import { db } from '@/lib/db'
import { extractRedditIds } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's submissions
    const submissions = await db.submission.findMany({
      where: { ambassadorId: user.id },
      include: { opportunity: true },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Submissions fetch error:', error)
    return NextResponse.json(
      { error: 'Error fetching submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify user is approved
    if (user.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Tu cuenta no está aprobada para enviar entregas' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const result = submissionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { redditUrl, opportunityId, description } = result.data

    // Verify opportunity exists
    const opportunity = await db.opportunity.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Oportunidad no encontrada' },
        { status: 404 }
      )
    }

    // Verify opportunity is active
    if (opportunity.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Esta oportunidad no está activa' },
        { status: 400 }
      )
    }

    // Check for duplicate submissions of the same comment
    const existingSubmission = await db.submission.findFirst({
      where: {
        redditUrl: redditUrl,
        ambassadorId: user.id,
      },
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Ya has enviado este comentario' },
        { status: 409 }
      )
    }

    // Extract Reddit IDs
    const redditIds = extractRedditIds(redditUrl)

    // Create submission
    const submission = await db.submission.create({
      data: {
        ambassadorId: user.id,
        opportunityId: opportunityId,
        redditUrl: redditUrl,
        redditPostId: redditIds.postId,
        redditCommentId: redditIds.commentId,
        description: description,
        amount: opportunity.reward,
        status: 'PENDING_REVIEW',
        redditMetadata: {
          extractedAt: new Date().toISOString(),
        },
      },
      include: { opportunity: true },
    })

    // Update opportunity redemption count
    await db.opportunity.update({
      where: { id: opportunityId },
      data: { currentRedemptions: { increment: 1 } },
    })

    // TODO: Send notification email

    return NextResponse.json(
      {
        message: 'Envío registrado exitosamente',
        submission,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submission creation error:', error)
    return NextResponse.json(
      { error: 'Error al crear envío' },
      { status: 500 }
    )
  }
}
