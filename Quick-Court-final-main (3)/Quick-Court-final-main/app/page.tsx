"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginPage from './login/page'

// Root path shows the login screen (no sidebar/header via client-layout config)
export default function Home() {
  const router = useRouter()
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      const hasCookie = document.cookie.split(';').some(c=>c.trim().startsWith('authToken='))
      if (userStr && hasCookie) {
        const u = JSON.parse(userStr)
        if (u.role === 'owner') router.replace('/facility-dashboard')
        else router.replace('/user-home')
      }
    } catch {}
  }, [router])
  return <LoginPage />
}
