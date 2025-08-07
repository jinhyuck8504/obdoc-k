import { supabase } from './supabase'
import { AdminStats, HospitalTypeStats, RevenueData, UserActivityData, SubscriptionAnalytics, SystemMetrics, AdminFilters } from '@/types/admin'

export const adminService = {
  // 관리자 통계 조회
  async getAdminStats(filters?: AdminFilters): Promise<AdminStats> {
    try {
      console.log('🔍 관리자 통계 데이터 조회 시작...')
      
      const [
        usersData,
        subscriptionsData,
        postsData,
        appointmentsData,
        doctorsData
      ] = await Promise.all([
        supabase.from('users').select('role, created_at'),
        supabase.from('subscriptions').select('plan_type, status, amount, created_at'),
        supabase.from('community_posts').select('created_at'),
        supabase.from('appointments').select('status, created_at'),
        supabase.from('doctors').select('hospital_type, subscription_status, created_at')
      ])

      console.log('Supabase에서 가져온 데이터:', {
        users: usersData.data?.length || 0,
        subscriptions: subscriptionsData.data?.length || 0,
        posts: postsData.data?.length || 0,
        appointments: appointmentsData.data?.length || 0,
        doctors: doctorsData.data?.length || 0
      })
      
      // 이번 달 신규 사용자 계산
      const thisMonth = new Date().toISOString().substring(0, 7)
      const newUsersThisMonth = usersData.data?.filter(u => 
        u.created_at?.substring(0, 7) === thisMonth
      ).length || 0

      // 월별 매출 계산 (이번 달)
      const monthlyRevenue = subscriptionsData.data?.filter(s => 
        s.created_at?.substring(0, 7) === thisMonth && s.status === 'active'
      ).reduce((sum, s) => sum + (s.amount || 0), 0) || 0

      // 병원 유형별 통계 계산
      const hospitalTypeMap = new Map<string, { count: number, activeCount: number }>()
      doctorsData.data?.forEach(doctor => {
        const type = doctor.hospital_type || '기타'
        const current = hospitalTypeMap.get(type) || { count: 0, activeCount: 0 }
        current.count += 1
        if (doctor.subscription_status === 'active') {
          current.activeCount += 1
        }
        hospitalTypeMap.set(type, current)
      })

      const hospitalTypeStats = Array.from(hospitalTypeMap.entries()).map(([type, stats]) => ({
        type,
        count: stats.count,
        activeCount: stats.activeCount,
        revenue: 0, // 실제 수익 계산 필요
        percentage: (stats.count / (doctorsData.data?.length || 1)) * 100
      }))

      const stats: AdminStats = {
        totalUsers: usersData.data?.length || 0,
        totalDoctors: usersData.data?.filter(u => u.role === 'doctor').length || 0,
        totalPatients: usersData.data?.filter(u => u.role === 'patient').length || 0,
        activeUsers: usersData.data?.length || 0, // 실제 활성 사용자 로직 필요
        newUsersThisMonth,

        totalSubscriptions: subscriptionsData.data?.length || 0,
        activeSubscriptions: subscriptionsData.data?.filter(s => s.status === 'active').length || 0,
        pendingSubscriptions: subscriptionsData.data?.filter(s => s.status === 'pending').length || 0,
        expiredSubscriptions: subscriptionsData.data?.filter(s => s.status === 'expired').length || 0,
        subscriptionRevenue: subscriptionsData.data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0,
        monthlyRevenue,

        hospitalTypeStats,

        totalPosts: postsData.data?.length || 0,
        totalComments: 0, // 댓글 테이블이 있다면 조회 필요
        activeDiscussions: 0, // 활성 토론 계산 로직 필요
        reportedContent: 0, // 신고 테이블이 있다면 조회 필요

        totalAppointments: appointmentsData.data?.length || 0,
        completedAppointments: appointmentsData.data?.filter(a => a.status === 'completed').length || 0,
        cancelledAppointments: appointmentsData.data?.filter(a => a.status === 'cancelled').length || 0,
        upcomingAppointments: appointmentsData.data?.filter(a => a.status === 'scheduled').length || 0,

        systemHealth: 'healthy',
        lastUpdated: new Date().toISOString()
      }

      return stats
    } catch (error) {
      console.error('관리자 통계 조회 실패:', error)
      // 오류 시 기본값 반환
      return {
        totalUsers: 0,
        totalDoctors: 0,
        totalPatients: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pendingSubscriptions: 0,
        expiredSubscriptions: 0,
        subscriptionRevenue: 0,
        monthlyRevenue: 0,
        hospitalTypeStats: [],
        totalPosts: 0,
        totalComments: 0,
        activeDiscussions: 0,
        reportedContent: 0,
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        upcomingAppointments: 0,
        systemHealth: 'warning',
        lastUpdated: new Date().toISOString()
      }
    }
  },

  // 수익 데이터 조회
  async getRevenueData(filters?: AdminFilters): Promise<RevenueData[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('amount, created_at, plan_type')
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (error) throw error

      // 월별 수익 데이터 집계
      const revenueMap = new Map<string, { revenue: number, subscriptions: number, newSubscriptions: number }>()

      data?.forEach(subscription => {
        const month = subscription.created_at.substring(0, 7) // YYYY-MM
        const current = revenueMap.get(month) || { revenue: 0, subscriptions: 0, newSubscriptions: 0 }

        current.revenue += subscription.amount || 0
        current.subscriptions += 1
        current.newSubscriptions += 1

        revenueMap.set(month, current)
      })

      return Array.from(revenueMap.entries()).map(([month, data]) => ({
        month,
        ...data
      }))
    } catch (error) {
      console.error('수익 데이터 조회 실패:', error)
      return []
    }
  },

  // 사용자 활동 데이터 조회
  async getUserActivityData(filters?: AdminFilters): Promise<UserActivityData[]> {
    try {
      // 최근 30일 데이터 조회
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [
        usersData,
        postsData,
        appointmentsData
      ] = await Promise.all([
        supabase.from('users').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('community_posts').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('appointments').select('created_at').gte('created_at', thirtyDaysAgo.toISOString())
      ])

      // 일별 데이터 집계
      const activityMap = new Map<string, UserActivityData>()
      const today = new Date()

      // 30일간의 기본 데이터 구조 생성
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        activityMap.set(dateStr, {
          date: dateStr,
          activeUsers: 0,
          newUsers: 0,
          posts: 0,
          comments: 0,
          appointments: 0
        })
      }

      // 실제 데이터로 업데이트
      usersData.data?.forEach(user => {
        const date = user.created_at.split('T')[0]
        const activity = activityMap.get(date)
        if (activity) {
          activity.newUsers += 1
        }
      })

      postsData.data?.forEach(post => {
        const date = post.created_at.split('T')[0]
        const activity = activityMap.get(date)
        if (activity) {
          activity.posts += 1
        }
      })

      appointmentsData.data?.forEach(appointment => {
        const date = appointment.created_at.split('T')[0]
        const activity = activityMap.get(date)
        if (activity) {
          activity.appointments += 1
        }
      })

      return Array.from(activityMap.values())
    } catch (error) {
      console.error('사용자 활동 데이터 조회 실패:', error)
      return []
    }
  },

  // 구독 분석 데이터 조회
  async getSubscriptionAnalytics(filters?: AdminFilters): Promise<SubscriptionAnalytics> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type, amount, status, created_at')

      if (error) throw error

      // 구독 플랜별 분석
      const planStats = new Map<string, { count: number, revenue: number }>()
      let totalCount = 0
      let totalRevenue = 0

      data?.forEach(subscription => {
        const current = planStats.get(subscription.plan_type) || { count: 0, revenue: 0 }
        current.count += 1
        current.revenue += subscription.amount || 0
        planStats.set(subscription.plan_type, current)

        totalCount += 1
        totalRevenue += subscription.amount || 0
      })

      const planDistribution = Array.from(planStats.entries()).map(([plan, stats]) => ({
        plan: plan as '1month' | '6months' | '12months',
        count: stats.count,
        revenue: stats.revenue,
        percentage: totalCount > 0 ? (stats.count / totalCount) * 100 : 0
      }))

      return {
        planDistribution,
        conversionRate: 0, // 실제 계산 로직 필요
        churnRate: 0, // 실제 계산 로직 필요
        averageLifetime: 0 // 실제 계산 로직 필요
      }
    } catch (error) {
      console.error('구독 분석 데이터 조회 실패:', error)
      return {
        planDistribution: [],
        conversionRate: 0,
        churnRate: 0,
        averageLifetime: 0
      }
    }
  },

  // 시스템 메트릭 조회
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // 실제 시스템 메트릭은 모니터링 도구에서 가져와야 함
      return {
        responseTime: 0,
        uptime: 99.9,
        errorRate: 0,
        activeConnections: 0,
        databaseSize: 0,
        storageUsed: 0
      }
    } catch (error) {
      console.error('시스템 메트릭 조회 실패:', error)
      return {
        responseTime: 0,
        uptime: 0,
        errorRate: 0,
        activeConnections: 0,
        databaseSize: 0,
        storageUsed: 0
      }
    }
  },

  // 병원 유형별 통계 조회
  async getHospitalTypeStats(filters?: AdminFilters): Promise<HospitalTypeStats[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          hospital_type,
          subscription_status,
          subscriptions(amount)
        `)

      if (error) throw error

      // 병원 유형별 통계 집계
      const typeStats = new Map<string, { count: number, activeCount: number, revenue: number }>()
      let totalCount = 0

      data?.forEach(doctor => {
        const type = doctor.hospital_type || '기타'
        const current = typeStats.get(type) || { count: 0, activeCount: 0, revenue: 0 }

        current.count += 1
        if (doctor.subscription_status === 'active') {
          current.activeCount += 1
        }

        typeStats.set(type, current)
        totalCount += 1
      })

      return Array.from(typeStats.entries()).map(([type, stats]) => ({
        type,
        count: stats.count,
        activeCount: stats.activeCount,
        revenue: stats.revenue,
        percentage: totalCount > 0 ? (stats.count / totalCount) * 100 : 0
      }))
    } catch (error) {
      console.error('병원 유형별 통계 조회 실패:', error)
      return []
    }
  }
}
