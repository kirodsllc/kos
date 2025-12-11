import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Forward request to backend server
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/brands`;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    const response = await fetch(`${backendUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Brands API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.error('[BRANDS POST] ========== ROUTE HANDLER CALLED ==========');
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/api/brands/route.ts:POST',message:'Brands API POST request started',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
  // #endregion

  try {
    console.error('[BRANDS POST] Inside try block, about to verify token');
    const user = verifyToken(request);
    console.error('[BRANDS POST] Token verified, user:', user ? 'exists' : 'null');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[BRANDS POST] About to read request body');
    const body = await request.json();
    console.error('[BRANDS POST] Body received:', JSON.stringify(body));
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/api/brands/route.ts:POST_body',message:'Request body received',data:{body},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
    // #endregion

    // Forward request to backend server
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/brands`;
    console.error('[BRANDS POST] Backend URL:', backendUrl);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/api/brands/route.ts:POST_before_backend',message:'Before backend request',data:{backendUrl,body},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
    // #endregion

    console.error('[BRANDS POST] About to fetch backend');
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.error('[BRANDS POST] Backend response status:', response.status);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/api/brands/route.ts:POST_backend_fetch',message:'Backend fetch completed',data:{status:response.status,ok:response.ok,contentType:response.headers.get('content-type')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
    // #endregion

    const data = await response.json();
    console.error('[BRANDS POST] Backend data received:', JSON.stringify(data).substring(0, 200));
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/api/brands/route.ts:POST_backend_response',message:'Backend response received',data:{status:response.status,ok:response.ok,data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      console.error('[BRANDS POST] Backend returned error, status:', response.status);
      return NextResponse.json(data, { status: response.status });
    }

    console.error('[BRANDS POST] Success, returning data');
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[BRANDS POST] Exception caught:', error.message);
    console.error('[BRANDS POST] Stack:', error.stack);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/api/brands/route.ts:POST_exception',message:'Brands API POST exception',data:{error:error.message,stack:error.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      { error: 'Failed to create brand', message: error.message },
      { status: 500 }
    );
  }
}

