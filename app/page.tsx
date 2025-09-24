'use client'

import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
      {/* 로고 */}
      <div className="mb-3">
        <Image 
          src="/quickpost-logo.png" 
          alt="QuickPost Logo" 
          width={360}
          height={230}
          className="mx-auto"
        />
      </div>

      {/* 중앙 텍스트 */}
      <div className="mb-3 text-center">
        <p className="text-base text-gray-500 mb-2">쇼핑몰에서 요청된 배송 건을</p>
        <p className="text-base text-gray-500">확인하고 처리하세요.</p>
      </div>

      {/* 운송요청 확인 버튼 */}
      <div className="flex flex-col items-center">
        <Link href="/shipping/detail">
          <button 
            className="text-white px-10 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ backgroundColor: '#BF5050' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#a84444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#BF5050'}
          >
            운송 요청 확인
          </button>
        </Link>
      </div>
    </div>
  )
}
