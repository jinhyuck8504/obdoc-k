import React from 'react'
import { Metadata } from 'next'
import AuthGuard from '@/components/auth/AuthGuard'
import RoleGuard from '@/components/auth/RoleGuard'
import Layout from '@/components/common/Layout'
import HospitalCodeManager from '@/components/doctor/HospitalCodeManager'

export const metadata: Metadata = {
  title: '병원 가입 코드 관리 | Obdoc',
  description: '병원 가입 코드를 생성하고 관리하세요',
}

export default function HospitalCodesPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['doctor']}>
        <Layout>
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <HospitalCodeManager />
            </div>
          </div>
        </Layout>
      </RoleGuard>
    </AuthGuard>
  )
}
