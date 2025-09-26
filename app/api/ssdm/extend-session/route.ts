import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== 세션 연장 API 호출 시작 ===')
    
    const { sessionId } = await request.json()
    console.log('받은 sessionId:', sessionId ? `${sessionId.substring(0, 20)}...` : '없음')
    
    if (!sessionId) {
      console.log('sessionId 누락')
      return NextResponse.json(
        { error: 'sessionId가 필요합니다' },
        { status: 400 }
      )
    }
    
    console.log('환경변수 확인:', {
      SSDM_API_URL: process.env.SSDM_API_URL ? '설정됨' : '없음'
    })
    
    const ssdmUrl = `${process.env.SSDM_API_URL}/api/extend-session`
    console.log('SSDM 요청 URL:', ssdmUrl)
    
    // SSDM 서버로 연장 요청
    const ssdmResponse = await fetch(ssdmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId  // body로 전달
        })
    })
    
    console.log('SSDM 응답 상태:', ssdmResponse.status, ssdmResponse.statusText)
    
    if (!ssdmResponse.ok) {
      const errorData = await ssdmResponse.json()
      console.log('SSDM 에러 응답:', errorData)
      
      return NextResponse.json(
        { error: errorData.error || 'SSDM 세션 연장 요청 실패' },
        { status: ssdmResponse.status }
      )
    }
    
    const result = await ssdmResponse.json()
    console.log('SSDM 성공 응답:', result)
    
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
    console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { error: '세션 연장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
