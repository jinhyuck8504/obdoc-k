import {
  UserRole,
  getDefaultDashboardRoute,
  isRouteAllowed,
  isPublicRoute,
  isProtectedRoute,
  getRedirectPath,
  getNavigationItems,
  getDashboardNavigationItems
} from '../roleUtils'

describe('roleUtils', () => {
  describe('getDefaultDashboardRoute', () => {
    it('should return correct default routes for each role', () => {
      expect(getDefaultDashboardRoute('doctor')).toBe('/dashboard/doctor')
      expect(getDefaultDashboardRoute('customer')).toBe('/dashboard/customer')
      expect(getDefaultDashboardRoute('admin')).toBe('/dashboard/admin')
    })
  })

  describe('isRouteAllowed', () => {
    it('should allow correct routes for doctor role', () => {
      expect(isRouteAllowed('/dashboard/doctor', 'doctor')).toBe(true)
      expect(isRouteAllowed('/dashboard/doctor/patients', 'doctor')).toBe(true)
      expect(isRouteAllowed('/community', 'doctor')).toBe(true)
      expect(isRouteAllowed('/profile', 'doctor')).toBe(true)
      
      // 제한된 라우트
      expect(isRouteAllowed('/dashboard/customer', 'doctor')).toBe(false)
      expect(isRouteAllowed('/dashboard/admin', 'doctor')).toBe(false)
    })

    it('should allow correct routes for customer role', () => {
      expect(isRouteAllowed('/dashboard/customer', 'customer')).toBe(true)
      expect(isRouteAllowed('/dashboard/customer/appointments', 'customer')).toBe(true)
      expect(isRouteAllowed('/community', 'customer')).toBe(true)
      expect(isRouteAllowed('/profile', 'customer')).toBe(true)
      
      // 제한된 라우트
      expect(isRouteAllowed('/dashboard/doctor', 'customer')).toBe(false)
      expect(isRouteAllowed('/dashboard/admin', 'customer')).toBe(false)
    })

    it('should allow all routes for admin role', () => {
      expect(isRouteAllowed('/dashboard/admin', 'admin')).toBe(true)
      expect(isRouteAllowed('/dashboard/doctor', 'admin')).toBe(true)
      expect(isRouteAllowed('/dashboard/customer', 'admin')).toBe(true)
      expect(isRouteAllowed('/community', 'admin')).toBe(true)
      expect(isRouteAllowed('/profile', 'admin')).toBe(true)
    })
  })

  describe('isPublicRoute', () => {
    it('should identify public routes correctly', () => {
      expect(isPublicRoute('/')).toBe(true)
      expect(isPublicRoute('/login')).toBe(true)
      expect(isPublicRoute('/signup')).toBe(true)
      expect(isPublicRoute('/terms')).toBe(true)
      expect(isPublicRoute('/privacy')).toBe(true)
      expect(isPublicRoute('/unauthorized')).toBe(true)
      
      // 보호된 라우트
      expect(isPublicRoute('/dashboard')).toBe(false)
      expect(isPublicRoute('/community')).toBe(false)
      expect(isPublicRoute('/profile')).toBe(false)
    })
  })

  describe('isProtectedRoute', () => {
    it('should identify protected routes correctly', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true)
      expect(isProtectedRoute('/dashboard/doctor')).toBe(true)
      expect(isProtectedRoute('/community')).toBe(true)
      expect(isProtectedRoute('/profile')).toBe(true)
      expect(isProtectedRoute('/settings')).toBe(true)
      
      // 공개 라우트
      expect(isProtectedRoute('/')).toBe(false)
      expect(isProtectedRoute('/login')).toBe(false)
      expect(isProtectedRoute('/signup')).toBe(false)
    })
  })

  describe('getRedirectPath', () => {
    it('should return null for public routes', () => {
      expect(getRedirectPath('doctor', '/')).toBeNull()
      expect(getRedirectPath('customer', '/login')).toBeNull()
      expect(getRedirectPath('admin', '/signup')).toBeNull()
    })

    it('should return null for allowed routes', () => {
      expect(getRedirectPath('doctor', '/dashboard/doctor')).toBeNull()
      expect(getRedirectPath('customer', '/dashboard/customer')).toBeNull()
      expect(getRedirectPath('admin', '/dashboard/admin')).toBeNull()
    })

    it('should return default dashboard for disallowed routes', () => {
      expect(getRedirectPath('doctor', '/dashboard/customer')).toBe('/dashboard/doctor')
      expect(getRedirectPath('customer', '/dashboard/doctor')).toBe('/dashboard/customer')
      expect(getRedirectPath('doctor', '/dashboard/admin')).toBe('/dashboard/doctor')
    })
  })

  describe('getNavigationItems', () => {
    it('should return global navigation items for all roles', () => {
      const doctorNav = getNavigationItems('doctor')
      const customerNav = getNavigationItems('customer')
      const adminNav = getNavigationItems('admin')
      
      // 모든 역할에서 동일한 전역 네비게이션
      expect(doctorNav).toEqual([
        { name: '커뮤니티', href: '/community', icon: 'MessageCircle' },
        { name: '프로필', href: '/profile', icon: 'User' }
      ])
      
      expect(customerNav).toEqual(doctorNav)
      expect(adminNav).toEqual(doctorNav)
    })

    it('should not include dashboard-specific items in global navigation', () => {
      const doctorNav = getNavigationItems('doctor')
      
      // 대시보드 전용 메뉴는 포함되지 않아야 함
      expect(doctorNav.find(item => item.name === '고객 관리')).toBeUndefined()
      expect(doctorNav.find(item => item.name === '예약 관리')).toBeUndefined()
      expect(doctorNav.find(item => item.name === '사용자 관리')).toBeUndefined()
    })
  })

  describe('getDashboardNavigationItems', () => {
    it('should return correct dashboard navigation for doctor', () => {
      const doctorDashboardNav = getDashboardNavigationItems('doctor')
      
      expect(doctorDashboardNav).toEqual([
        { name: '고객 관리', href: '/dashboard/doctor/customers', icon: 'Users' },
        { name: '예약 관리', href: '/dashboard/doctor/appointments', icon: 'Calendar' }
      ])
    })

    it('should return correct dashboard navigation for customer', () => {
      const customerDashboardNav = getDashboardNavigationItems('customer')
      
      expect(customerDashboardNav).toEqual([
        { name: '내 예약', href: '/dashboard/customer/appointments', icon: 'Calendar' },
        { name: '건강 기록', href: '/dashboard/customer/health', icon: 'Activity' }
      ])
    })

    it('should return correct dashboard navigation for admin', () => {
      const adminDashboardNav = getDashboardNavigationItems('admin')
      
      expect(adminDashboardNav).toEqual([
        { name: '사용자 관리', href: '/admin/users', icon: 'Users' },
        { name: '시스템 설정', href: '/admin/settings', icon: 'Settings' }
      ])
    })

    it('should return empty array for unknown role', () => {
      const unknownRoleNav = getDashboardNavigationItems('unknown' as UserRole)
      expect(unknownRoleNav).toEqual([])
    })
  })

  describe('Navigation Separation', () => {
    it('should ensure no overlap between global and dashboard navigation', () => {
      const roles: UserRole[] = ['doctor', 'customer', 'admin']
      
      roles.forEach(role => {
        const globalNav = getNavigationItems(role)
        const dashboardNav = getDashboardNavigationItems(role)
        
        // 전역 네비게이션과 대시보드 네비게이션 간 중복 확인
        globalNav.forEach(globalItem => {
          const isDuplicated = dashboardNav.some(dashItem => 
            dashItem.name === globalItem.name || dashItem.href === globalItem.href
          )
          expect(isDuplicated).toBe(false)
        })
      })
    })

    it('should ensure dashboard navigation contains role-specific items only', () => {
      const doctorNav = getDashboardNavigationItems('doctor')
      const customerNav = getDashboardNavigationItems('customer')
      const adminNav = getDashboardNavigationItems('admin')
      
      // 의사 네비게이션에는 고객/관리자 전용 메뉴가 없어야 함
      expect(doctorNav.find(item => item.name.includes('내 예약'))).toBeUndefined()
      expect(doctorNav.find(item => item.name.includes('사용자 관리'))).toBeUndefined()
      
      // 고객 네비게이션에는 의사/관리자 전용 메뉴가 없어야 함
      expect(customerNav.find(item => item.name.includes('고객 관리'))).toBeUndefined()
      expect(customerNav.find(item => item.name.includes('사용자 관리'))).toBeUndefined()
      
      // 관리자 네비게이션에는 의사/고객 전용 메뉴가 없어야 함
      expect(adminNav.find(item => item.name.includes('고객 관리'))).toBeUndefined()
      expect(adminNav.find(item => item.name.includes('내 예약'))).toBeUndefined()
    })
  })
})