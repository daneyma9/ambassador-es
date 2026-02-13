import { NextRequest, NextResponse } from 'next/server'
import { redditMonitor } from '@/lib/reddit-monitor'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Run the sync
    const result = await redditMonitor.syncRedditContent()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error) {
    console.error('Reddit sync error:', error)
    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Endpoint to generate sample data for testing
export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      )
    }

    const result = await redditMonitor.generateSampleData()

    return NextResponse.json({
      success: true,
      message: 'Sample data generated',
      result,
    })
  } catch (error) {
    console.error('Sample data generation error:', error)
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
