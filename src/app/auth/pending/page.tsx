"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import { getUserLevel } from '@/app/lib/dbFunction'

export default function PendingApproval() {
  const router = useRouter()

  useEffect(() => {
    async function checkApprovalStatus() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const level = await getUserLevel(user.id)
        if (level) {
          // User is approved, redirect to dashboard
          router.push('/dashboard')
        }
      } else {
        // No user found, redirect to login
        router.push('/auth/login')
      }
    }

    checkApprovalStatus()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is currently pending approval from an administrator.
            You will be notified once your account has been approved.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-center text-sm text-gray-500">
            Please wait while we check your approval status...
          </p>
        </div>
      </div>
    </div>
  )
} 