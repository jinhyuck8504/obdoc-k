import { Handler, HandlerResponse } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const handler: Handler = async (event, context): Promise<HandlerResponse> => {
  // CORS headers with explicit typing
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': 'https://obdoc.co.kr',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  try {
    const startTime = Date.now()
    
    // Database health check
    const { data: dbHealth, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    const dbStatus = dbError ? 'unhealthy' : 'healthy'
    const responseTime = Date.now() - startTime
    
    // System health metrics
    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`,
          error: dbError?.message || null
        },
        netlify: {
          status: 'healthy',
          region: process.env.AWS_REGION || 'unknown'
        }
      }
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503
    
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }

    return {
      statusCode,
      headers: responseHeaders,
      body: JSON.stringify(health)
    }
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }

    return {
      statusCode: 503,
      headers: errorHeaders,
      body: JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
        services: {
          database: { status: 'unknown' }
        }
      })
    }
  }
}
