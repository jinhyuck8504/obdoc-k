import { supabase } from './supabase'
import { AdminStats, HospitalTypeStats, RevenueData, UserActivityData, SubscriptionAnalytics, SystemMetrics, AdminFilters } from '@/types/admin'

// 개발 환경 체크
const isDevelopment = process.env.NODE_ENV === 'development'
const isDummySupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project') ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here')

// 더미 통계 데이터
const generateDummyStats = (): AdminStats => ({
  // 사용자 통계
  totalUsers: 1247,
  totalDoctors: 89,
  totalPatients: 1158,
  activeUsers: 892,
  newUsersThisMonth: 156,

  // 구독 통계
  totalSubscriptions: 89,
  activeSubscriptions: 67,
  pendingSubscriptions: 12,
  expiredSubscriptions: 10,
  subscriptionRevenue: 45780000,
  monthlyRevenue: 8950000,

  // 병원 유형별 통계
  hospitalTypeStats: [
    { type: '종합병원', count: 25, activeCount: 22, revenue: 18500000, percentage: 28.1 },
    { type: '내과', count: 18, activeCount: 15, revenue: 12400000, percentage: 22.5 },
    { type: '가정의학과', count: 15, activeCount: 12, revenue: 8900000, percentage: 17.9 },
    { type: '비만클리닉', count: 12, activeCount: 10, revenue: 7200000, percentage: 14.9 },
    { type: '기타', count: 19, activeCount: 8, revenue: 6780000, percentage: 16.6 }
  ],

  // 커뮤니티 통계
  totalPosts: 2847,
  totalComments: 8934,
  activeDiscussions: 234,
  reportedContent: 23,

  // 예약 통계
  totalAppointments: 5672,
  completedAppointments: 4891,
  cancelledAppointments: 456,
  upcomingAppointments: 325,

  // 시스템 통계
  systemHealth: 'healthy',
  lastUpdated: new Date().toISOString()
})

const generateDummyRevenueData = (): RevenueData[] => [
  { month: '2024-01', revenue: 6200000, subscriptions: 45, newSubscriptions: 8 },
  { month: '2024-02', revenue: 7100000, subscriptions: 52, newSubscriptions: 12 },
  { month: '2024-03', revenue: 8300000, subscriptions: 58, newSubscriptions: 15 },
  { month: '2024-04', revenue: 7800000, subscriptions: 61, newSubscriptions: 9 },
  { month: '2024-05', revenue: 8900000, subscriptions: 67, newSubscriptions: 18 },
  { month: '2024-06', revenue: 9200000, subscriptions: 72, newSubscriptions: 14 }
]

const generateDummyUserActivity = (): UserActivityData[] => {
  const data: UserActivityData[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 200) + 600,
      newUsers: Math.floor(Math.random() * 20) + 5,
      posts: Math.floor(Math.random() * 50) + 10,
      comments: Math.floor(Math.random() * 150) + 30,
      appointments: Math.floor(Math.random() * 80) + 20
    })
  }

  return data
}

const generateDummySubscriptionAnalytics = (): SubscriptionAnalytics => ({
  planDistribution: [
    { plan: '1month', count: 15, revenue: 1650000, percentage: 22.4 },
    { plan: '6months', count: 28, revenue: 14784000, percentage: 41.8 },
    { plan: '12months', count: 24, revenue: 19176000, percentage: 35.8 }
  ],
  conversionRate: 78.5,
  churnRate: 12.3,
  averageLifetime: 8.7
})

const generateDummySystemMetrics = (): SystemMetrics => ({
  responseTime: 245,
  uptime: 99.8,
  errorRate: 0.12,
  activeConnections: 1247,
  databaseSize: 2.4,
  storageUsed: 15.7
})

export const adminService = {
  // 관리자 통계 조회
  async getAdminStats(filters?: AdminFilters): Promise<AdminStats> {
    if (isDevelopment && isDummySupabase) {
      console.log('개발 모드: 더미 관리자 통계 데이터 사용', filters)
      // 필터에 따라 약간의 변화를 주어 실제처럼 보이게 함
      const stats = generateDummyStats()
      if (filters?.dateRange === 'today') {
        stats.newUsersThisMonth = Math.floor(stats.newUsersThisMonth * 0.1)
        stats.monthlyRevenue = Math.floor(stats.monthlyRevenue * 0.8)
      }
      return stats
    }

    try {
      // 실제 데이터베이스에서 통계 조회
      const [
        usersData,
        subscriptionsData,
        postsData,
        appointmentsData
      ] = await Promise.all([
        supabase.from('users').select('role, created_at'),
        supabase.from('subscriptions').select('plan, status, amount, created_at'),
        supabase.from('community_posts').select('created_at'),
        supabase.from('appointments').select('status, created_at')
      ])

      // 통계 계산 로직 구현
      const stats: AdminStats = {
        totalUsers: usersData.data?.length || 0,
        totalDoctors: usersData.data?.filter((u: any) => u.role === 'doctor').length || 0,
        totalPatients: usersData.data?.filter((u: any) => u.role === 'patient').length || 0,
        activeUsers: 0, // 실제 활성 사용자 계산 필요
        newUsersThisMonth: 0, // 이번 달 신규 사용자 계산 필요

        totalSubscriptions: subscriptionsData.data?.length || 0,
        activeSubscriptions: subscriptionsData.data?.filter((s: any) => s.status === 'active').length || 0,
        pendingSubscriptions: subscriptionsData.data?.filter((s: any) => s.status === 'pending').length || 0,
        expiredSubscriptions: subscriptionsData.data?.filter((s: any) => s.status === 'expired').length || 0,
        subscriptionRevenue: subscriptionsData.data?.reduce((sum: number, s: any) => sum + (s.amount || 0), 0) || 0,
        monthlyRevenue: 0, // 월별 매출 계산 필요

        hospitalTypeStats: [], // 병원 유형별 통계 계산 필요

        totalPosts: postsData.data?.length || 0,
        totalComments: 0, // 댓글 수 계산 필요
        activeDiscussions: 0, // 활성 토론 계산 필요
        reportedContent: 0, // 신고된 콘텐츠 계산 필요

        totalAppointments: appointmentsData.data?.length || 0,
        completedAppointments: appointmentsData.data?.filter((a: any) => a.status === 'completed').length || 0,
        cancelledAppointments: appointmentsData.data?.filter((a: any) => a.status === 'cancelled').length || 0,
        upcomingAppointments: appointmentsData.data?.filter((a: any) => a.status === 'scheduled').length || 0,

        systemHealth: 'healthy',
        lastUpdated: new Date().toISOString()
      }

      return stats
    } catch (error) {
      console.error('관리자 통계 조회 실패:', error)
      throw error
    }
  },

  // 수익 데이터 조회
  async getRevenueData(filters?: AdminFilters): Promise<RevenueData[]> {
    if (isDevelopment && isDummySupabase) {
      console.log('개발 모드: 더미 수익 데이터 사용')
      return generateDummyRevenueData()
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('amount, created_at, plan')
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
      throw error
    }
  },

  // 사용자 활동 데이터 조회
  async getUserActivityData(filters?: AdminFilters): Promise<UserActivityData[]> {
    if (isDevelopment && isDummySupabase) {
      console.log('개발 모드: 더미 사용자 활동 데이터 사용')
      return generateDummyUserActivity()
    }

    try {
      // 실제 사용자 활동 데이터 조회 로직 구현
      // 여기서는 간단한 더미 데이터 반환
      return generateDummyUserActivity()
    } catch (error) {
      console.error('사용자 활동 데이터 조회 실패:', error)
      throw error
    }
  },

  // 구독 분석 데이터 조회
  async getSubscriptionAnalytics(filters?: AdminFilters): Promise<SubscriptionAnalytics> {
    if (isDevelopment && isDummySupabase) {
      console.log('개발 모드: 더미 구독 분석 데이터 사용')
      return generateDummySubscriptionAnalytics()
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, amount, status, created_at')

      if (error) throw error

      // 구독 플랜별 분석
      const planStats = new Map<string, { count: number, revenue: number }>()
      let totalCount = 0
      let totalRevenue = 0

      data?.forEach(subscription => {
        const current = planStats.get(subscription.plan) || { count: 0, revenue: 0 }
        current.count += 1
        current.revenue += subscription.amount || 0
        planStats.set(subscription.plan, current)

        totalCount += 1
        totalRevenue += subscription.amount || 0
      })

      const planDistribution = Array.from(planStats.entries()).map(([plan, stats]) => ({
        plan: plan as '1month' | '6months' | '12months',
        count: stats.count,
        revenue: stats.revenue,
        percentage: (stats.count / totalCount) * 100
      }))

      return {
        planDistribution,
        conversionRate: 78.5, // 실제 계산 필요
        churnRate: 12.3, // 실제 계산 필요
        averageLifetime: 8.7 // 실제 계산 필요
      }
    } catch (error) {
      console.error('구독 분석 데이터 조회 실패:', error)
      throw error
    }
  },

  // 시스템 메트릭 조회
  async getSystemMetrics(): Promise<SystemMetrics> {
    if (isDevelopment && isDummySupabase) {
      console.log('개발 모드: 더미 시스템 메트릭 데이터 사용')
      return generateDummySystemMetrics()
    }

    try {
      // 실제 시스템 메트릭 조회 로직
      return generateDummySystemMetrics()
    } catch (error) {
      console.error('시스템 메트릭 조회 실패:', error)
      throw error
    }
  },

  // 병원 유형별 통계 조회
  async getHospitalTypeStats(filters?: AdminFilters): Promise<HospitalTypeStats[]> {
    if (isDevelopment && isDummySupabase) {
      console.log('개발 모드: 더미 병원 유형 통계 사용')
      return generateDummyStats().hospitalTypeStats
    }

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

        // 구독 수익 계산 (실제로는 더 복잡한 로직 필요)
        current.revenue += 0 // subscriptions 데이터에서 계산

        typeStats.set(type, current)
        totalCount += 1
      })

      return Array.from(typeStats.entries()).map(([type, stats]) => ({
        type,
        count: stats.count,
        activeCount: stats.activeCount,
        revenue: stats.revenue,
        percentage: (stats.count / totalCount) * 100
      }))
    } catch (error) {
      console.error('병원 유형별 통계 조회 실패:', error)
      throw error
    }
  }
}
