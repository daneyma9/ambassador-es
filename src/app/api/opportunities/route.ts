import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'ACTIVE'
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    const opportunities = await db.opportunity.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    })

    const total = await db.opportunity.count({ where })

    return NextResponse.json({
      opportunities,
      total,
      limit,
      skip,
    })
  } catch (error) {
    console.error('Opportunities fetch error:', error)
    return NextResponse.json(
      { error: 'Error fetching opportunities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can create opportunities
    if ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const opportunity = await db.opportunity.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        reward: body.reward,
        context: body.context,
        suggestedText: body.suggestedText,
        requirements: body.requirements || {},
        maxRedemptions: body.maxRedemptions || -1,
        createdBy: session.user?.email || 'admin',
      },
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    console.error('Opportunity creation error:', error)
    return NextResponse.json(
      { error: 'Error creating opportunity' },
      { status: 500 }
    )
  }
}
