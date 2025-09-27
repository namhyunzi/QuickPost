'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquareText, ShieldCheck, Eye, Printer, LockKeyhole } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getDeliveryRequestById, updateDeliveryRequestStatus, updateDeliveryRequestSession, getDeliveryRequestSession } from "@/lib/firebase-realtime"
import { DeliveryRequest } from "@/lib/firebase-realtime"
import "@/styles/print.css"

function DetailContent() {
  const [deliveryRequest, setDeliveryRequest] = useState<DeliveryRequest | null>(null)
  const [personalInfo, setPersonalInfo] = useState<any>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionState, setSessionState] = useState({
    sessionId: null as string | null,
    extensionCount: 0,
    remainingExtensions: 2
  })
  const searchParams = useSearchParams()
  const requestId = searchParams.get('id')

  useEffect(() => {
    if (requestId) {
      loadDeliveryRequest(requestId)
      loadSessionData(requestId)
    }
  }, [requestId])

  const loadSessionData = async (id: string) => {
    console.log('=== detail 페이지 세션 데이터 로드 시작 ===')
    console.log('주문 ID:', id)
    
    try {
      console.log('Firebase에서 세션 정보 조회 중...')
      const sessionData = await getDeliveryRequestSession(id)
      console.log('Firebase에서 조회한 세션 데이터:', sessionData)
      
      if (sessionData) {
        const constructedUrl = `${process.env.NEXT_PUBLIC_SSDM_URL}/secure-viewer?sessionId=${sessionData.sessionId}`
        console.log('환경변수 NEXT_PUBLIC_SSDM_URL:', process.env.NEXT_PUBLIC_SSDM_URL)
        console.log('구성된 viewerUrl:', constructedUrl)
        
        // Firebase에서 세션 정보 조회
        setViewerUrl(constructedUrl)
        console.log('setViewerUrl 호출 완료')
        
        setSessionState({
          sessionId: sessionData.sessionId,
          extensionCount: sessionData.extensionCount,
          remainingExtensions: sessionData.remainingExtensions
        })
        console.log('세션 상태 설정 완료')
      } else {
        console.log('세션 데이터 없음')
      }
    } catch (error) {
      console.error('세션 데이터 로드 에러:', error)
    }
  }

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
    if (!deliveryRequest || !requestId) return

    // Firebase에서 세션 확인
    const sessionData = await getDeliveryRequestSession(requestId)
    
    if (!sessionData) {
      alert('개인정보 확인을 먼저 해주세요.')
      return
    }

    // 현재 페이지 인쇄
    window.print()
  }

  const handleViewPersonalInfo = async () => {
    if (!deliveryRequest) return

    try {
      const response = await fetch('/api/ssdm/viewer-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jwt: deliveryRequest.ssdmJWT,
          requiredFields: ['name', 'phone', 'address', 'email'],
          viewerType: 'delivery'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setViewerUrl(data.viewerUrl)
        
        // Firebase에 세션 정보 저장
        if (requestId) {
          await updateDeliveryRequestSession(requestId, {
            sessionId: data.sessionId,
            sessionExpiresAt: data.expiresAt,
            extensionCount: 0,
            remainingExtensions: 2
          })
        }
        
        // 세션 상태 업데이트
        setSessionState({
          sessionId: data.sessionId,
          extensionCount: 0,
          remainingExtensions: 2
        })
      } else {
        // 에러 응답 처리 (한 번만 json() 호출)
        let errorMessage = '개인정보 확인에 실패했습니다. 다시 시도해주세요.'
        
        try {
          const errorData = await response.json()
          console.error('API 에러 응답:', errorData)
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          console.error('JSON 파싱 에러:', jsonError)
          const errorText = await response.text()
          console.error('원본 응답:', errorText)
        }
        
        // 상태 코드에 따른 메시지 조정
        if (response.status === 401) {
          errorMessage = '주문 정보를 확인할 수 없습니다. 주문을 다시 확인해주세요.'
        } else if (response.status === 403) {
          errorMessage = '주문 정보가 만료되었습니다. 새로고침 후 다시 시도해주세요.'
        }
        
        alert(errorMessage)
      }
    } catch (error) {
      console.error('뷰어 세션 요청 에러:', error)
      
      // TypeScript unknown 타입 처리
      const errorObj = error as Error
      
      // 네트워크 에러 등 예외 상황
      if (errorObj.name === 'AbortError') {
        alert('요청이 취소되었습니다. 다시 시도해주세요.')
      } else if (errorObj.name === 'TypeError' && (
        errorObj.message.includes('Failed to fetch') ||
        errorObj.message.includes('NetworkError') ||
        errorObj.message.includes('fetch') ||
        errorObj.message.includes('network') ||
        errorObj.message.includes('connection')
      )) {
        alert('인터넷 연결을 확인하고 다시 시도해주세요.')
      } else if (errorObj.name === 'SyntaxError') {
        alert('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.')
      } else {
        alert('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    }
  }

  const handleExtendSession = async () => {
    if (!requestId) return
    
    // Firebase에서 현재 세션 정보 조회
    const sessionData = await getDeliveryRequestSession(requestId)
    if (!sessionData) {
      alert('세션 정보를 찾을 수 없습니다.')
      return
    }
    
    try {
      const response = await fetch('/api/ssdm/extend-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionData.sessionId })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        alert(result.error)  // SSDM에서 받은 에러 메시지 표시
        return
      }
      
      if (result.success) {
        // Firebase에 업데이트된 세션 정보 저장
        await updateDeliveryRequestSession(requestId, {
          sessionId: result.sessionId,
          sessionExpiresAt: result.newExpiresAt,
          extensionCount: result.extensionCount,
          remainingExtensions: result.remainingExtensions
        })
        
        setSessionState(prev => ({
          ...prev,
          extensionCount: result.extensionCount,
          remainingExtensions: result.remainingExtensions
        }))
        
        alert(result.message)
      } else {
        alert(result.error)  // SSDM에서 받은 구체적인 에러 메시지
      }
    } catch (error) {
      alert('세션 연장에 실패했습니다.')
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
      <div className="bg-white border-b border-gray-200 no-print">
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
                  <p className="font-medium text-gray-900">
                    {typeof deliveryRequest.totalAmount === 'number' 
                      ? deliveryRequest.totalAmount.toLocaleString() + '원'
                      : deliveryRequest.totalAmount}
                  </p>
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
                      <div className="text-right">
                        <div className="text-sm text-gray-400 line-through">
                          {typeof item.price === 'number' ? item.price.toLocaleString() : item.price}원
                        </div>
                        <div className="font-medium text-gray-900">
                          {typeof item.price === 'number' ? Math.floor(item.price * 0.9).toLocaleString() : item.price}원
                        </div>
                      </div>
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
              {viewerUrl ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">SSDM 보안뷰어</h3>
                    <iframe 
                      src={viewerUrl}
                      width="100%" 
                      height="400px"
                      frameBorder="0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                      className="rounded-lg"
                    />
                    <div className="flex justify-end mt-4 no-print">
                      <Button 
                        onClick={handleExtendSession} 
                        variant="outline" 
                        disabled={sessionState.remainingExtensions <= 0}
                      >
                        12시간 연장 ({sessionState.extensionCount}/2)
                      </Button>
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
