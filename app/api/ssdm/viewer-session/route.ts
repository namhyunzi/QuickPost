import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { jwt, requiredFields, viewerType } = await request.json()
    
    if (!jwt || !requiredFields || !viewerType) {
      return NextResponse.json(
        { error: 'JWT, requiredFields, viewerType이 필요합니다' },
        { status: 400 }
      )
    }
    
    // SSDM 서버로 뷰어 세션 요청
    const ssdmResponse = await fetch(`${process.env.SSDM_API_URL}/api/viewer-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`, // 받은 JWT를 헤더로 전달
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requiredFields,
        viewerType
      })
    })
    
    if (!ssdmResponse.ok) {
      return NextResponse.json(
        { error: 'SSDM 뷰어 세션 요청 실패' },
        { status: ssdmResponse.status }
      )
    }
    
    const viewerData = await ssdmResponse.json()
    
    return NextResponse.json({
      success: true,
      viewerUrl: viewerData.viewerUrl,
      sessionId: viewerData.sessionId,
      expiresAt: viewerData.expiresAt
    })
    
  } catch (error) {
    console.error('뷰어 세션 요청 에러:', error)
    return NextResponse.json(
      { error: '뷰어 세션 요청 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
