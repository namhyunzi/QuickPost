import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== 내부 API: viewer-session 요청 시작 ===')
  
  try {
    const { jwt, requiredFields, viewerType } = await request.json()
    console.log('받은 요청 데이터:', { 
      jwt: jwt, 
      requiredFields, 
      viewerType 
    })
    
    if (!jwt || !requiredFields || !viewerType) {
      console.log('필수 파라미터 누락:', { jwt: !!jwt, requiredFields: !!requiredFields, viewerType: !!viewerType })
      return NextResponse.json(
        { error: 'JWT, requiredFields, viewerType이 필요합니다' },
        { status: 400 }
      )
    }
    
    console.log('환경변수 확인:', {
      SSDM_API_URL: process.env.SSDM_API_URL ? '설정됨' : '없음'
    })
    
    const ssdmUrl = `${process.env.SSDM_API_URL}/api/viewer-session`
    console.log('SSDM 서버 요청 URL:', ssdmUrl)
    
    // SSDM 서버로 뷰어 세션 요청
    console.log('SSDM 서버로 요청 전송 중...')
    const ssdmResponse = await fetch(ssdmUrl, {
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
    
    console.log('SSDM 서버 응답 상태:', ssdmResponse.status, ssdmResponse.statusText)
    
    if (!ssdmResponse.ok) {
      const errorText = await ssdmResponse.text()
      console.error('SSDM 서버 에러 응답:', errorText)
      return NextResponse.json(
        { error: 'SSDM 뷰어 세션 요청 실패' },
        { status: ssdmResponse.status }
      )
    }
    
    const viewerData = await ssdmResponse.json()
    console.log('SSDM 서버 성공 응답:', viewerData)
    
    const response = {
      success: true,
      viewerUrl: viewerData.viewerUrl,
      sessionId: viewerData.sessionId,
      expiresAt: viewerData.expiresAt
    }
    console.log('클라이언트로 반환할 응답:', response)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('뷰어 세션 요청 에러:', error)
    
    // TypeScript unknown 타입 처리
    const errorObj = error as Error
    
    // JWT 만료 오류 구분
    if (errorObj.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: '주문 정보가 만료되었습니다. 새로고침 후 다시 시도해주세요.' },
        { status: 401 }
      )
    }
    
    // 기타 오류
    return NextResponse.json(
      { error: '개인정보 확인에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
