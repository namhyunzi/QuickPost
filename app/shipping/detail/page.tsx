'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Info, MessageSquareText, ShieldCheck, Eye, Printer, LockKeyhole } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ShippingDetailPage() {
  // 샘플 주문 데이터
  const orderInfo = {
    id: "ORD-2024-001",
    shoppingMall: "스마트 온라인몰",
    requestDate: "2024-01-15",
    totalAmount: "119,000원",
    products: [
      { name: "무선 이어폰", quantity: 1, price: "89,000원" },
      { name: "핸드폰 케이스", quantity: 2, price: "30,000원" }
    ],
    specialRequest: "부재시 경비실 보관 요청",
    deliveryMemo: "오후 2시 이후 배송 희망",
    shippingStatus: "송장출력대기",
    trackingNumber: "-",
    estimatedDelivery: "-"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '송장출력대기':
        return <Badge className="bg-yellow-100 text-yellow-800">송장출력대기</Badge>
      case '배송준비중':
        return <Badge className="bg-blue-100 text-blue-800">배송준비중</Badge>
      case '배송중':
        return <Badge className="bg-green-100 text-green-800">배송중</Badge>
      case '배송완료':
        return <Badge className="bg-green-100 text-green-800">배송완료</Badge>
      case '결제완료':
        return <Badge className="bg-purple-100 text-purple-800">결제완료</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(168, 68, 68)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(191, 80, 80)'}
            >
              <Printer className="w-4 h-4 mr-2" />
              송장 출력
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
                <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1">배송준비</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">주문번호</p>
                  <p className="font-medium text-gray-900">{orderInfo.id}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">쇼핑몰</p>
                  <p className="font-medium text-gray-900">{orderInfo.shoppingMall}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">요청일시</p>
                  <p className="font-medium text-gray-900">{orderInfo.requestDate}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">총 금액</p>
                  <p className="font-medium text-gray-900">{orderInfo.totalAmount}</p>
                </div>
              </div>
            </Card>

            {/* 상품 목록 카드 */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">상품 목록</h2>
              <div className="space-y-4">
                {orderInfo.products.map((product, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-400">수량: {product.quantity}개</p>
                      </div>
                      <span className="font-medium text-gray-900">{product.price}</span>
                    </div>
                    {index < orderInfo.products.length - 1 && (
                      <div className="border-t border-gray-200 mt-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* 배송 메모 카드 */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">배송 메모</h2>
              <div className="space-y-3">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Info className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="font-medium text-red-600">특별 요청사항</span>
                  </div>
                  <p className="text-sm text-red-600 mt-2">{orderInfo.specialRequest}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <MessageSquareText className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-medium text-blue-600">배송 메모</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">{orderInfo.deliveryMemo}</p>
                </div>
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
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(168, 68, 68)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(191, 80, 80)'}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  개인정보 확인
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}