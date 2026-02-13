import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validation'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'

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

    const { email, name, password } = result.data

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

    // Hash password
    // TODO: For MVP, storing plain password. In production, use bcrypt properly
    const hashedPassword = password // Placeholder - implement bcrypt in production

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        role: 'AMBASSADOR',
        status: 'PENDING_VERIFICATION',
      },
    })

    // TODO: Send verification email with code

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
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
