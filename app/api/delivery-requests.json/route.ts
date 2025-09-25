import { NextRequest, NextResponse } from 'next/server'
import { createDeliveryRequest } from '@/lib/firebase-realtime'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 🔍 디버깅: 실제로 받는 데이터 확인
    console.log('=== 택배사 API에서 받은 데이터 ===')
    console.log('전체 body:', JSON.stringify(body, null, 2))
    console.log('body 타입:', typeof body)
    console.log('body 키들:', Object.keys(body))
    
    // 🔍 디버깅: 각 필드별 확인
    console.log('--- 필드별 값 확인 ---')
    console.log('orderNumber:', body.orderNumber, '(타입:', typeof body.orderNumber, ')')
    console.log('mallName:', body.mallName, '(타입:', typeof body.mallName, ')')
    console.log('requestDate:', body.requestDate, '(타입:', typeof body.requestDate, ')')
    console.log('totalAmount:', body.totalAmount, '(타입:', typeof body.totalAmount, ')')
    console.log('items:', body.items, '(타입:', typeof body.items, ')')
    console.log('deliveryMemo:', body.deliveryMemo, '(타입:', typeof body.deliveryMemo, ')')
    console.log('ssdmJWT:', body.ssdmJWT ? '존재함 (길이: ' + body.ssdmJWT.length + ')' : '없음')
    
    // 🔍 디버깅: undefined 체크
    console.log('--- undefined 체크 ---')
    console.log('orderNumber가 undefined인가?', body.orderNumber === undefined)
    console.log('mallName이 undefined인가?', body.mallName === undefined)
    console.log('mallName이 null인가?', body.mallName === null)
    console.log('mallName이 빈 문자열인가?', body.mallName === '')
    
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
    
    // 🔍 디버깅: 구조분해할당 후 값 확인
    console.log('--- 구조분해할당 후 값 ---')
    console.log('orderNumber:', orderNumber)
    console.log('mallName:', mallName)
    console.log('requestDate:', requestDate)
    console.log('totalAmount:', totalAmount)
    console.log('items:', items)
    console.log('deliveryMemo:', deliveryMemo)
    console.log('ssdmJWT:', ssdmJWT ? '존재함' : '없음')

    // 🔍 디버깅: Firebase 저장 전 데이터 확인
    console.log('--- Firebase 저장 전 데이터 ---')
    const deliveryRequestData = {
      orderNumber,
      mallName,
      requestDate: requestDate || new Date().toISOString(),
      totalAmount,
      items,
      deliveryMemo,
      ssdmJWT,
      status: 'pending' // 항상 pending으로 시작
    }
    console.log('저장할 데이터:', JSON.stringify(deliveryRequestData, null, 2))
    console.log('mallName이 undefined인가?', deliveryRequestData.mallName === undefined)
    console.log('mallName이 null인가?', deliveryRequestData.mallName === null)
    console.log('mallName이 빈 문자열인가?', deliveryRequestData.mallName === '')
    
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
