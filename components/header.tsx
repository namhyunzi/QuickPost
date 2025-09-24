'use client'

import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="text-red-600 font-bold text-3xl">
              QuickPost
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
