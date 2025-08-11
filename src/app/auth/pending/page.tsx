"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import { getUserLevelAction } from "@/app/actions/userActions"
import { FaClock } from 'react-icons/fa'

export default function PendingApproval() {
  const router = useRouter()

  useEffect(() => {
    async function checkApprovalStatus() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const level = await getUserLevelAction(user.id)
        if (level) {
          // User is approved, redirect to dashboard
          router.push('/dashboard')
        }
      } else {
        // No user found, redirect to login
        router.push('/login')
      }
    }

    checkApprovalStatus()
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B1020] via-[#0C1226] to-[#0E1530] text-white">
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
            <FaClock className="h-8 w-8 text-amber-400" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
          <p className="text-white/70 mb-6">
            Your account is currently pending approval from an administrator. 
            You will be notified once your account has been approved.
          </p>
          
          <div className="flex items-center justify-center mb-6">
            <div className="loading loading-spinner loading-md text-[#3B82F6]"></div>
          </div>
          
          <p className="text-sm text-white/50">
            Checking approval status...
          </p>
        </div>
      </div>
    </main>
  )
}