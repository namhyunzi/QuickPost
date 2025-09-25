import { NextRequest, NextResponse } from 'next/server'
import { createDeliveryRequest } from '@/lib/firebase-realtime'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 쇼핑몰에서 보내는 데이터 구조
    const {
      orderNumber,
      mallName,
      requestDate,
      totalAmount,
      items,
      deliveryMemo,
      ssdmJWT
    } = body

    // Firebase에 배송 요청 저장
    const result = await createDeliveryRequest({
      orderNumber,
      mallName,
      requestDate: requestDate || new Date().toISOString(),
      totalAmount,
      items,
      deliveryMemo,
      ssdmJWT,
      status: 'pending' // 항상 pending으로 시작
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '배송 요청이 성공적으로 등록되었습니다',
        requestId: result.requestId,
        orderNumber,
        status: 'pending'
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: '배송 요청 등록에 실패했습니다' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('배송 요청 등록 에러:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '배송 요청 등록 중 오류가 발생했습니다' 
      },
      { status: 500 }
    )
  }
}
