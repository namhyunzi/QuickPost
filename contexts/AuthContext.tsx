'use client'

import { createContext, useContext, ReactNode } from 'react'

interface AuthContextType {
  // 인증 관련 상태와 함수들을 여기에 정의
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // 인증 로직을 여기에 구현
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
