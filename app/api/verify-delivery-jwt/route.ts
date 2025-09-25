import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { jwt, requiredFields } = await request.json()

    if (!jwt || !requiredFields) {
      return NextResponse.json(
        { error: 'JWT와 requiredFields가 필요합니다' },
        { status: 400 }
      )
    }

    // SSDM API 호출 (실제 SSDM 서버로 요청)
    const ssdmResponse = await fetch(`${process.env.SSDM_API_URL}/api/verify-delivery-jwt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        jwt,
        requiredFields
      })
    })

    if (!ssdmResponse.ok) {
      return NextResponse.json(
        { error: 'SSDM API 호출에 실패했습니다' },
        { status: ssdmResponse.status }
      )
    }

    const personalInfo = await ssdmResponse.json()
    
    return NextResponse.json({
      success: true,
      personalInfo
    })

  } catch (error) {
    console.error('개인정보 조회 에러:', error)
    return NextResponse.json(
      { error: '개인정보 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
