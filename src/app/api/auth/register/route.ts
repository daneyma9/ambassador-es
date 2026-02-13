import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validation'
import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: result.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, name } = result.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      )
    }

    // TODO: For MVP, storing plain password. In production, use bcrypt properly

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        role: 'AMBASSADOR',
        status: 'PENDING_VERIFICATION',
        verificationCode,
        verificationCodeExpiresAt,
      },
    })

    // Send verification email
    await sendVerificationEmail({
      ambassadorEmail: email,
      ambassadorName: name,
      verificationCode,
    })

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error al registrarse' },
      { status: 500 }
    )
  }
}
