import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { encryptIBAN } from '@/lib/encryption'
import { z } from 'zod'

const bankAccountSchema = z.object({
  bankAccount: z
    .string()
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, 'IBAN inválido'),
})

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

    const body = await request.json()

    // Validate input
    const result = bankAccountSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'IBAN inválido',
          details: result.error.errors,
        },
        { status: 400 }
      )
    }

    const { bankAccount } = result.data

    // Encrypt IBAN
    const encryptedIBAN = encryptIBAN(bankAccount)

    // Update user with encrypted IBAN
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        bankAccount: encryptedIBAN,
        bankAccountVerified: false, // Reset verification when updated
      },
    })

    return NextResponse.json(
      {
        message: 'Bank account updated',
        maskedIban: '*'.repeat(bankAccount.length - 4) + bankAccount.slice(-4),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Bank account update error:', error)
    return NextResponse.json(
      { error: 'Error updating bank account' },
      { status: 500 }
    )
  }
}
