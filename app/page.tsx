'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { listenToDeliveryRequests, DeliveryRequest } from "@/lib/firebase-realtime"

export default function HomePage() {
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // 실시간 데이터 리스너 등록
    const unsubscribe = listenToDeliveryRequests((requests) => {
      setDeliveryRequests(requests)
    })

    return () => unsubscribe()
  }, [])

  // 검색 필터링
  const filteredRequests = deliveryRequests.filter(request =>
    request.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.mallName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="text-yellow-600 font-medium">송장출력대기</span>
      case 'processing':
        return <span className="text-blue-600 font-medium">송장출력중</span>
      case 'completed':
        return <span className="text-green-600 font-medium">처리완료</span>
      default:
        return <span className="text-gray-600 font-medium">{status}</span>
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
      {/* 헤더 */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center">
            <Image 
              src="/quickpost-logo.png" 
              alt="QuickPost Logo" 
              width={200}
              height={120}
              className="mx-auto mb-6"
            />
            
            {/* 검색바 */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="주문번호, 쇼핑몰로 검색..."
                className="pl-10 pr-4 py-4 text-lg rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          운송 요청 ({filteredRequests.length}건)
        </h2>
        
        <div>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <svg 
                  className="mx-auto h-24 w-24 text-gray-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 요청된 정보가 없습니다</h3>
              <p className="text-gray-500">쇼핑몰에서 배송 요청이 들어오면 여기에 표시됩니다.</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <Link key={request.id} href={`/detail?id=${request.id}`} className="block mb-6">
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="font-bold text-lg text-gray-900">{request.orderNumber}</span>
                        <span className="ml-3">{getStatusBadge(request.status)}</span>
                      </div>
                      <div className="mb-1">
                        <span className="text-gray-600">{request.mallName} • {new Date(request.requestDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">상품: {request.items.map(item => item.title).join(', ')}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
