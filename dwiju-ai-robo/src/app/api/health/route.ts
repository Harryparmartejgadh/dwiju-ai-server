import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // This should check actual MongoDB connection
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
      },
      uptime: process.uptime()
    };

    return NextResponse.json(healthData);
  } catch (error) {
    return NextResponse.json(
      { status: 'ERROR', error: error.message },
      { status: 500 }
    );
  }
}
