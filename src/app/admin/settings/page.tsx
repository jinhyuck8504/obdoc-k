'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import RoleGuard from '@/components/auth/RoleGuard';
import SystemSettings from '@/components/admin/SystemSettings';

export default function AdminSettingsPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50">
          <SystemSettings />
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
