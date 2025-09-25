'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquareText, ShieldCheck, Eye, Printer, LockKeyhole } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getDeliveryRequestById, updateDeliveryRequestStatus } from "@/lib/firebase-realtime"
import { DeliveryRequest } from "@/lib/firebase-realtime"

function DetailContent() {
  const [deliveryRequest, setDeliveryRequest] = useState<DeliveryRequest | null>(null)
  const [personalInfo, setPersonalInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const requestId = searchParams.get('id')

  useEffect(() => {
    if (requestId) {
      loadDeliveryRequest(requestId)
    }
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

  const handlePrintInvoice = async () => {
    if (!deliveryRequest) return

    try {
      // 상태를 processing으로 변경
      await updateDeliveryRequestStatus(deliveryRequest.id!, 'processing')
      
      // 실제 송장 출력 로직 (택배사 API 호출)
      console.log('송장 출력 시작:', deliveryRequest.orderNumber)
      
      // 모의 처리 완료 (실제로는 택배사 API 응답 후)
      setTimeout(async () => {
        await updateDeliveryRequestStatus(deliveryRequest.id!, 'completed')
        alert('송장 출력이 완료되었습니다.')
      }, 2000)
      
    } catch (error) {
      console.error('송장 출력 에러:', error)
      alert('송장 출력에 실패했습니다.')
    }
  }

  const handleViewPersonalInfo = async () => {
    if (!deliveryRequest) return

    try {
      const response = await fetch('/api/verify-delivery-jwt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jwt: deliveryRequest.ssdmJWT,
          requiredFields: ['name', 'phone', 'address']
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPersonalInfo(data.personalInfo)
      } else {
        alert('개인정보 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('개인정보 조회 에러:', error)
      alert('개인정보 조회에 실패했습니다.')
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩중...</div>
  }

  if (!deliveryRequest) {
    return <div className="min-h-screen flex items-center justify-center">배송 요청을 찾을 수 없습니다.</div>
  }


  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Image 
                  src="/quickpost-logo.png" 
                  alt="QuickPost Logo" 
                  width={120}
                  height={80}
                  className="mx-auto cursor-pointer"
                />
              </Link>
            </div>
            <Button 
              className="text-white"
              style={{ backgroundColor: 'rgb(191, 80, 80)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgb(168, 68, 68)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgb(191, 80, 80)'}
              onClick={handlePrintInvoice}
              disabled={deliveryRequest.status === 'completed'}
            >
              <Printer className="w-4 h-4 mr-2" />
              {deliveryRequest.status === 'pending' ? '송장 출력' : 
               deliveryRequest.status === 'processing' ? '송장 출력중...' : '처리 완료'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽 컬럼 - 주문 정보 */}
          <div className="space-y-6">
            {/* 주문 정보 카드 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">주문 정보</h2>
                <Badge className={`text-sm px-3 py-1 ${
                  deliveryRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  deliveryRequest.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {deliveryRequest.status === 'pending' ? '송장출력대기' :
                   deliveryRequest.status === 'processing' ? '송장출력중' : '처리완료'}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">주문번호</p>
                  <p className="font-medium text-gray-900">{deliveryRequest.orderNumber}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">쇼핑몰</p>
                  <p className="font-medium text-gray-900">{deliveryRequest.mallName}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">요청일시</p>
                  <p className="font-medium text-gray-900">{new Date(deliveryRequest.requestDate).toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">총 금액</p>
                  <p className="font-medium text-gray-900">{deliveryRequest.totalAmount}</p>
                </div>
              </div>
            </Card>

            {/* 상품 목록 카드 */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">상품 목록</h2>
              <div className="space-y-4">
                {deliveryRequest.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-400">수량: {item.quantity}개</p>
                      </div>
                      <span className="font-medium text-gray-900">{item.price}</span>
                    </div>
                    {index < deliveryRequest.items.length - 1 && (
                      <div className="border-t border-gray-200 mt-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* 배송 메모 카드 */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">배송 메모</h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <MessageSquareText className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-medium text-blue-600">배송 메모</span>
                </div>
                <p className="text-sm text-blue-600 mt-2">{deliveryRequest.deliveryMemo}</p>
              </div>
            </Card>
          </div>

          {/* 오른쪽 컬럼 - SSDM 보안뷰어 */}
          <div>
            <Card className="p-6 min-h-[375px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">개인정보 (SSDM 보안)</h2>
                <div className="w-6 h-6 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
              </div>
              {personalInfo ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">개인정보</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">이름:</span> {personalInfo.name}</div>
                      <div><span className="font-medium">전화번호:</span> {personalInfo.phone}</div>
                      <div><span className="font-medium">주소:</span> {personalInfo.address}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgb(255, 235, 235)' }}>
                    <LockKeyhole className="w-10 h-10" style={{ color: 'rgb(191, 80, 80)' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">보안 뷰어 접근</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">개인정보 확인을 위해 SSDM 보안 뷰어를 활성화해주세요.</p>
                  </div>
                  <Button 
                    className="w-2/5 text-white py-4 text-base font-normal"
                    style={{ backgroundColor: 'rgb(191, 80, 80)' }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgb(168, 68, 68)'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgb(191, 80, 80)'}
                    onClick={handleViewPersonalInfo}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    개인정보 확인
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShippingDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩중...</div>}>
      <DetailContent />
    </Suspense>
  )
}
