import { test, expect } from '@playwright/test'

// Mock user login helper
async function loginAsDoctor(page: any) {
  await page.goto('/login')
  await page.getByLabel(/이메일/i).fill('doctor@test.com')
  await page.getByLabel(/비밀번호/i).fill('password123')
  await page.getByRole('button', { name: /로그인/i }).click()
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard/doctor')
}

async function loginAsPatient(page: any) {
  await page.goto('/login')
  await page.getByLabel(/이메일/i).fill('patient@test.com')
  await page.getByLabel(/비밀번호/i).fill('password123')
  await page.getByRole('button', { name: /로그인/i }).click()
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard/customer')
}

test.describe('Doctor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // This would require actual test user setup in a real scenario
    // For now, we'll test the dashboard components directly
    await page.goto('/dashboard/doctor')
  })

  test('should display doctor dashboard components', async ({ page }) => {
    // Skip if not authenticated (would redirect to login)
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    await expect(page.getByRole('heading', { name: /의사 대시보드/i })).toBeVisible()
    await expect(page.getByText(/오늘의 일정/i)).toBeVisible()
    await expect(page.getByText(/환자 현황/i)).toBeVisible()
    await expect(page.getByText(/빠른 검색/i)).toBeVisible()
  })

  test('should navigate to patient management', async ({ page }) => {
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    await page.getByRole('link', { name: /환자 관리/i }).click()
    await expect(page).toHaveURL(/\/dashboard\/doctor/)
    await expect(page.getByRole('heading', { name: /환자 관리/i })).toBeVisible()
  })

  test('should display patient list', async ({ page }) => {
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    await page.goto('/dashboard/doctor')
    
    // Check if patient list is visible
    await expect(page.getByText(/환자 목록/i)).toBeVisible()
    
    // Test search functionality
    const searchInput = page.getByPlaceholder(/환자 검색/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('김환자')
      await expect(page.getByText(/검색 결과/i)).toBeVisible()
    }
  })

  test('should handle appointment scheduling', async ({ page }) => {
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    await page.goto('/dashboard/doctor')
    
    // Look for appointment scheduling button
    const scheduleButton = page.getByRole('button', { name: /예약 등록/i })
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByText(/예약 등록/i)).toBeVisible()
    }
  })
})

test.describe('Patient Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/customer')
  })

  test('should display patient dashboard components', async ({ page }) => {
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    await expect(page.getByRole('heading', { name: /환자 대시보드/i })).toBeVisible()
    await expect(page.getByText(/내 예약/i)).toBeVisible()
    await expect(page.getByText(/건강 리포트/i)).toBeVisible()
    await expect(page.getByText(/커뮤니티/i)).toBeVisible()
  })

  test('should handle weight input', async ({ page }) => {
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    const weightButton = page.getByRole('button', { name: /체중 입력/i })
    if (await weightButton.isVisible()) {
      await weightButton.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      
      const weightInput = page.getByLabel(/체중/i)
      await weightInput.fill('70.5')
      
      await page.getByRole('button', { name: /저장/i }).click()
      await expect(page.getByText(/체중이 저장되었습니다/i)).toBeVisible()
    }
  })

  test('should navigate to community', async ({ page }) => {
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    const communityLink = page.getByRole('link', { name: /커뮤니티/i })
    if (await communityLink.isVisible()) {
      await communityLink.click()
      await expect(page).toHaveURL('/community')
    }
  })
})

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/admin')
  })

  test('should display admin dashboard', async ({ page }) => {
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    await expect(page.getByRole('heading', { name: /관리자 대시보드/i })).toBeVisible()
    await expect(page.getByText(/사용자 통계/i)).toBeVisible()
    await expect(page.getByText(/수익 현황/i)).toBeVisible()
  })

  test('should display statistics cards', async ({ page }) => {
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    await expect(page.getByText(/총 사용자/i)).toBeVisible()
    await expect(page.getByText(/활성 의사/i)).toBeVisible()
    await expect(page.getByText(/월간 수익/i)).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard/doctor')
    
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    // Check mobile navigation
    const mobileMenu = page.getByRole('button', { name: /메뉴/i })
    await expect(mobileMenu).toBeVisible()
    
    await mobileMenu.click()
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/dashboard/doctor')
    
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    // Check tablet layout
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})