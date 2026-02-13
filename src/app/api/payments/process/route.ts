import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifyPaymentProcessed } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { ambassadorIds } = body

    if (!ambassadorIds || ambassadorIds.length === 0) {
      return NextResponse.json(
        { error: 'No ambassadors selected' },
        { status: 400 }
      )
    }

    // Process payments for each ambassador
    const paymentResults = []
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    for (const ambassadorId of ambassadorIds) {
      // Get ambassador
      const ambassador = await db.user.findUnique({
        where: { id: ambassadorId },
      })

      if (!ambassador) {
        continue
      }

      // Verify bank account
      if (!ambassador.bankAccount) {
        continue
      }

      // Get pending submissions
      const pendingSubmissions = await db.submission.findMany({
        where: {
          ambassadorId: ambassadorId,
          status: 'PAYMENT_PENDING',
        },
      })

      if (pendingSubmissions.length === 0) {
        continue
      }

      // Calculate total amount
      const totalAmount = pendingSubmissions.reduce(
        (sum, sub) => sum + sub.amount,
        0
      )

      // Create payment record
      const paymentRecord = await db.paymentRecord.create({
        data: {
          ambassadorId: ambassadorId,
          amount: totalAmount,
          currency: 'EUR',
          status: 'COMPLETED', // In MVP, mark as completed immediately
          batchId,
          submissions: pendingSubmissions.map((s) => s.id),
          submissionCount: pendingSubmissions.length,
          paymentMethod: 'bank_transfer',
          bankAccount: ambassador.bankAccount,
          reference: `${batchId}_${ambassadorId.slice(0, 8)}`,
          paidAt: new Date(),
        },
      })

      // Update submissions to PAID
      await Promise.all(
        pendingSubmissions.map((sub) =>
          db.submission.update({
            where: { id: sub.id },
            data: { status: 'PAID' },
          })
        )
      )

      // Update ambassador total earnings
      await db.user.update({
        where: { id: ambassadorId },
        data: {
          totalEarnings: { increment: totalAmount },
        },
      })

      // Create notification
      await db.notification.create({
        data: {
          userId: ambassadorId,
          type: 'PAYMENT_PROCESSED',
          title: 'Pago Procesado',
          message: `Se procesó un pago de ${totalAmount}€ por ${pendingSubmissions.length} envío(s) aprobado(s).`,
          relatedId: paymentRecord.id,
        },
      })

      // Send email notification
      notifyPaymentProcessed({
        ambassadorEmail: ambassador.email,
        ambassadorName: ambassador.name,
        amount: totalAmount,
        count: pendingSubmissions.length,
      }).catch((err) => console.error('Email send error:', err))

      paymentResults.push({
        ambassadorId,
        ambassadorName: ambassador.name,
        amount: totalAmount,
        submissionCount: pendingSubmissions.length,
        paymentId: paymentRecord.id,
      })
    }

    return NextResponse.json(
      {
        message: 'Payments processed successfully',
        batchId,
        processedCount: paymentResults.length,
        payments: paymentResults,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Error processing payments' },
      { status: 500 }
    )
  }
}
