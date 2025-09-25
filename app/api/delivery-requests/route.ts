import { NextRequest, NextResponse } from 'next/server'
import { createDeliveryRequest, getDeliveryRequests, updateDeliveryRequestStatus } from '@/lib/firebase-realtime'

export async function GET() {
  try {
    const requests = await getDeliveryRequests()
    return NextResponse.json({ success: true, requests })
  } catch (error) {
    console.error('배송 요청 목록 조회 에러:', error)
    return NextResponse.json(
      { error: '배송 요청 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNumber, mallName, totalAmount, items, deliveryMemo, ssdmJWT } = body

    const result = await createDeliveryRequest({
      orderNumber,
      mallName,
      requestDate: new Date().toISOString(),
      totalAmount,
      items,
      deliveryMemo,
      ssdmJWT,
      status: 'pending'
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        requestId: result.requestId 
      })
    } else {
      return NextResponse.json(
        { error: '배송 요청 생성에 실패했습니다' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('배송 요청 생성 에러:', error)
    return NextResponse.json(
      { error: '배송 요청 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status } = body

    const result = await updateDeliveryRequestStatus(requestId, status)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: '상태 업데이트에 실패했습니다' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('상태 업데이트 에러:', error)
    return NextResponse.json(
      { error: '상태 업데이트에 실패했습니다' },
      { status: 500 }
    )
  }
}
