import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId가 필요합니다' },
        { status: 400 }
      )
    }
    
    // SSDM 서버로 연장 요청
    const ssdmResponse = await fetch(`${process.env.SSDM_API_URL}/api/extend-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!ssdmResponse.ok) {
      return NextResponse.json(
        { error: 'SSDM 세션 연장 요청 실패' },
        { status: ssdmResponse.status }
      )
    }
    
    const result = await ssdmResponse.json()
    
    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      newExpiresAt: result.newExpiresAt,
      extensionCount: result.extensionCount,
      remainingExtensions: result.remainingExtensions,
      message: result.message
    })
    
  } catch (error) {
    console.error('세션 연장 에러:', error)
    return NextResponse.json(
      { error: '세션 연장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
