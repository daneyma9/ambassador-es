import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifySubmissionRejected } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only admins can reject
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Get submission
    const submission = await db.submission.findUnique({
      where: { id: params.id },
      include: { ambassador: true, opportunity: true },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Update submission status
    const updatedSubmission = await db.submission.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    })

    // Update ambassador statistics
    await db.user.update({
      where: { id: submission.ambassadorId },
      data: {
        rejectedSubmissions: { increment: 1 },
      },
    })

    // Decrement opportunity redemptions
    await db.opportunity.update({
      where: { id: submission.opportunityId },
      data: { currentRedemptions: { decrement: 1 } },
    })

    // Create notification
    await db.notification.create({
      data: {
        userId: submission.ambassadorId,
        type: 'SUBMISSION_REJECTED',
        title: 'Envío Rechazado',
        message: `Tu envío fue rechazado. Razón: ${reason}`,
        relatedId: submission.id,
      },
    })

    // Send email notification
    notifySubmissionRejected({
      ambassadorEmail: submission.ambassador.email,
      ambassadorName: submission.ambassador.name,
      opportunityTitle: submission.opportunity.title,
      reason,
    }).catch((err) => console.error('Email send error:', err))

    return NextResponse.json({
      message: 'Submission rejected',
      submission: updatedSubmission,
    })
  } catch (error) {
    console.error('Rejection error:', error)
    return NextResponse.json(
      { error: 'Error rejecting submission' },
      { status: 500 }
    )
  }
}
