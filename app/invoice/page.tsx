'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquareText, ShieldCheck, Eye, Printer, LockKeyhole } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getDeliveryRequestById } from "@/lib/firebase-realtime"
import { DeliveryRequest } from "@/lib/firebase-realtime"

function InvoiceContent() {
  const [deliveryRequest, setDeliveryRequest] = useState<DeliveryRequest | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const requestId = searchParams.get('id')

  useEffect(() => {
    if (requestId) {
      loadDeliveryRequest(requestId)
    }
    
    // 저장된 세션 확인
    const savedSession = localStorage.getItem('viewerSession')
    
    if (!savedSession) {
      alert('개인정보 확인을 먼저 해주세요.')
      // detail 페이지로 리다이렉트
      window.location.href = `/detail?id=${requestId}`
      return
    }
    
    // 세션이 있으면 뷰어 표시
    const session = JSON.parse(savedSession)
    setViewerUrl(session.viewerUrl)
  }, [requestId])

  const loadDeliveryRequest = async (id: string) => {
    try {
      const request = await getDeliveryRequestById(id)
      setDeliveryRequest(request)
    } catch (error) {
      console.error('배송 요청 로드 에러:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩중...</div>
  }

  if (!deliveryRequest) {
    return <div className="min-h-screen flex items-center justify-center">배송 요청을 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* QuickPost 로고 및 배송 송장 헤더 */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-gray-300 pb-4">
          <div className="flex items-center space-x-4">
            <Image 
              src="/quickpost-logo.png" 
              alt="QuickPost Logo" 
              width={120}
              height={80}
              className="cursor-pointer"
            />
          </div>
          <div className="text-right">
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">송장번호: {deliveryRequest.orderNumber}</p>
              <p className="text-sm text-gray-600">발행일: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* 주문 정보 섹션 */}
        <div className="mb-6 border-2 border-dashed border-gray-300 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">주문 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">주문번호</p>
              <p className="font-medium text-gray-900">{deliveryRequest.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">쇼핑몰</p>
              <p className="font-medium text-gray-900">{deliveryRequest.mallName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">요청일시</p>
              <p className="font-medium text-gray-900">{new Date(deliveryRequest.requestDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 금액</p>
              <p className="font-medium text-gray-900">
                {typeof deliveryRequest.totalAmount === 'number' 
                  ? deliveryRequest.totalAmount.toLocaleString() + '원'
                  : deliveryRequest.totalAmount}
              </p>
            </div>
          </div>
        </div>

        {/* 상품 목록 섹션 */}
        <div className="mb-6 border-2 border-dashed border-gray-300 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">상품 목록</h2>
          <div className="space-y-4">
            {deliveryRequest.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start border-b border-gray-200 pb-3">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 line-through">
                    {typeof item.price === 'number' ? item.price.toLocaleString() : item.price}원
                  </div>
                  <div className="font-medium text-gray-900">
                    {typeof item.price === 'number' ? Math.floor(item.price * 0.9).toLocaleString() : item.price}원
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 배송 정보 섹션 (iframe) */}
        <div className="mb-6 border-2 border-dashed border-gray-300 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">배송 정보</h2>
          {viewerUrl ? (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">SSDM 보안뷰어</h3>
              <iframe 
                src={viewerUrl}
                width="100%" 
                height="400px"
                frameBorder="0"
                sandbox="allow-scripts allow-same-origin"
                className="rounded-lg"
              />
            </div>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-red-50">
                <LockKeyhole className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">개인정보 보안뷰어</h3>
                <p className="text-sm text-gray-400 leading-relaxed">개인정보 확인을 위해 SSDM 보안 뷰어를 활성화해주세요.</p>
              </div>
              <Button 
                className="text-white py-4 text-base font-normal"
                style={{ backgroundColor: 'rgb(191, 80, 80)' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgb(168, 68, 68)'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgb(191, 80, 80)'}
              >
                <Eye className="w-5 h-5 mr-2" />
                개인정보 확인
              </Button>
            </div>
          )}
        </div>

        {/* 배송 메모 섹션 */}
        <div className="mb-6 border-2 border-dashed border-gray-300 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">배송 메모</h2>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquareText className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-600">배송 메모</span>
            </div>
            <p className="text-sm text-blue-600">{deliveryRequest.deliveryMemo}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩중...</div>}>
      <InvoiceContent />
    </Suspense>
  )
}
