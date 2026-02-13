import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifySubmissionApproved } from '@/lib/email'

export async function PATCH(
  _request: NextRequest,
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

    // Only admins can approve
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
        status: 'PAYMENT_PENDING',
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    })

    // Update ambassador statistics
    await db.user.update({
      where: { id: submission.ambassadorId },
      data: {
        approvedSubmissions: { increment: 1 },
        totalComments: { increment: 1 },
      },
    })

    // Create notification
    await db.notification.create({
      data: {
        userId: submission.ambassadorId,
        type: 'SUBMISSION_APPROVED',
        title: 'Envío Aprobado',
        message: `Tu envío para "${submission.opportunity.title}" fue aprobado. Recibirás ${submission.amount}€.`,
        relatedId: submission.id,
      },
    })

    // Send email notification
    notifySubmissionApproved({
      ambassadorEmail: submission.ambassador.email,
      ambassadorName: submission.ambassador.name,
      opportunityTitle: submission.opportunity.title,
      amount: submission.amount,
    }).catch((err) => console.error('Email send error:', err))

    return NextResponse.json({
      message: 'Submission approved',
      submission: updatedSubmission,
    })
  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { error: 'Error approving submission' },
      { status: 500 }
    )
  }
}
