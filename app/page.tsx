'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  // 샘플 운송 요청 데이터
  const shippingRequests = [
    {
      id: "ORD-2024-001",
      store: "스마트 온라인몰",
      date: "2024-01-15",
      items: "무선 이어폰, 핸드폰 케이스"
    },
    {
      id: "ORD-2024-002", 
      store: "패션 플러스",
      date: "2024-01-14",
      items: "원피스, 구두"
    },
    {
      id: "ORD-2024-003",
      store: "생활용품 마트", 
      date: "2024-01-13",
      items: "세제, 화장지, 샴푸"
    }
  ]

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
              />
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">운송 요청 (3건)</h2>
        
        <div>
          {shippingRequests.map((request, index) => (
            <Link key={request.id} href="/detail" className="block mb-6">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="font-bold text-lg text-gray-900">{request.id}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-gray-600">{request.store} • {request.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">상품: {request.items}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
