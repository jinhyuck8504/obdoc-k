import { test, expect } from '@playwright/test'

test.describe('Full System Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/')
  })

  test('complete user journey - doctor registration to patient management', async ({ page }) => {
    // 1. Doctor Registration
    await page.goto('/signup')
    
    await page.getByLabel(/이름/i).fill('테스트 의사')
    await page.getByLabel(/이메일/i).fill(`doctor-${Date.now()}@test.com`)
    await page.getByLabel(/비밀번호/i).fill('TestPassword123!')
    await page.getByLabel(/비밀번호 확인/i).fill('TestPassword123!')
    await page.selectOption('[name="role"]', 'doctor')
    await page.getByLabel(/의료진 면허번호/i).fill('12345-67890')
    await page.getByLabel(/전문분야/i).fill('비만의학과')
    
    await page.getByRole('button', { name: /회원가입/i }).click()
    
    // Wait for registration success or email verification
    await expect(page.getByText(/회원가입이 완료되었습니다|이메일 인증/i)).toBeVisible({ timeout: 10000 })
    
    // 2. Login (assuming email verification is bypassed in test)
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill(`doctor-${Date.now()}@test.com`)
    await page.getByLabel(/비밀번호/i).fill('TestPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    // 3. Verify doctor dashboard access
    await expect(page).toHaveURL(/\/dashboard\/doctor/)
    await expect(page.getByRole('heading', { name: /의사 대시보드/i })).toBeVisible()
    
    // 4. Patient Management
    const patientManagementLink = page.getByRole('link', { name: /환자 관리/i })
    if (await patientManagementLink.isVisible()) {
      await patientManagementLink.click()
      await expect(page.getByText(/환자 목록/i)).toBeVisible()
    }
    
    // 5. Add new patient
    const addPatientButton = page.getByRole('button', { name: /환자 추가|새 환자/i })
    if (await addPatientButton.isVisible()) {
      await addPatientButton.click()
      
      await page.getByLabel(/환자 이름/i).fill('테스트 환자')
      await page.getByLabel(/이메일/i).fill(`patient-${Date.now()}@test.com`)
      await page.getByLabel(/전화번호/i).fill('010-1234-5678')
      await page.selectOption('[name="gender"]', 'male')
      
      await page.getByRole('button', { name: /저장|추가/i }).click()
      await expect(page.getByText(/환자가 추가되었습니다/i)).toBeVisible()
    }
    
    // 6. Logout
    await page.getByRole('button', { name: /로그아웃/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('patient user journey - registration to health tracking', async ({ page }) => {
    // 1. Patient Registration
    await page.goto('/signup')
    
    await page.getByLabel(/이름/i).fill('테스트 환자')
    await page.getByLabel(/이메일/i).fill(`patient-${Date.now()}@test.com`)
    await page.getByLabel(/비밀번호/i).fill('TestPassword123!')
    await page.getByLabel(/비밀번호 확인/i).fill('TestPassword123!')
    await page.selectOption('[name="role"]', 'patient')
    
    await page.getByRole('button', { name: /회원가입/i }).click()
    
    // 2. Login
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill(`patient-${Date.now()}@test.com`)
    await page.getByLabel(/비밀번호/i).fill('TestPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    // 3. Verify patient dashboard access
    await expect(page).toHaveURL(/\/dashboard\/patient/)
    await expect(page.getByRole('heading', { name: /환자 대시보드/i })).toBeVisible()
    
    // 4. Health data input
    const weightInputButton = page.getByRole('button', { name: /체중 입력/i })
    if (await weightInputButton.isVisible()) {
      await weightInputButton.click()
      
      await page.getByLabel(/체중/i).fill('70.5')
      await page.getByRole('button', { name: /저장/i }).click()
      
      await expect(page.getByText(/체중이 저장되었습니다/i)).toBeVisible()
    }
    
    // 5. Community access
    const communityLink = page.getByRole('link', { name: /커뮤니티/i })
    if (await communityLink.isVisible()) {
      await communityLink.click()
      await expect(page).toHaveURL('/community')
    }
  })

  test('admin user journey - dashboard and user management', async ({ page }) => {
    // 1. Admin Login (assuming admin account exists)
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('admin@test.com')
    await page.getByLabel(/비밀번호/i).fill('AdminPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    // 2. Verify admin dashboard access
    await expect(page).toHaveURL(/\/dashboard\/admin/)
    await expect(page.getByRole('heading', { name: /관리자 대시보드/i })).toBeVisible()
    
    // 3. Check statistics
    await expect(page.getByText(/총 사용자/i)).toBeVisible()
    await expect(page.getByText(/활성 의사/i)).toBeVisible()
    await expect(page.getByText(/월간 수익/i)).toBeVisible()
    
    // 4. User management
    const userManagementLink = page.getByRole('link', { name: /사용자 관리/i })
    if (await userManagementLink.isVisible()) {
      await userManagementLink.click()
      await expect(page.getByText(/사용자 목록/i)).toBeVisible()
    }
  })

  test('cross-role interaction - doctor-patient appointment flow', async ({ page, context }) => {
    // This test requires multiple browser contexts to simulate different users
    const doctorPage = await context.newPage()
    const patientPage = await context.newPage()
    
    // Doctor creates appointment slot
    await doctorPage.goto('/login')
    await doctorPage.getByLabel(/이메일/i).fill('doctor@test.com')
    await doctorPage.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await doctorPage.getByRole('button', { name: /로그인/i }).click()
    
    await doctorPage.waitForURL(/\/dashboard\/doctor/)
    
    const scheduleButton = doctorPage.getByRole('button', { name: /일정 관리|예약 관리/i })
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click()
      
      // Add available time slot
      const addSlotButton = doctorPage.getByRole('button', { name: /시간 추가|예약 시간 추가/i })
      if (await addSlotButton.isVisible()) {
        await addSlotButton.click()
        
        await doctorPage.getByLabel(/날짜/i).fill('2024-12-31')
        await doctorPage.getByLabel(/시간/i).fill('14:00')
        await doctorPage.getByRole('button', { name: /저장/i }).click()
      }
    }
    
    // Patient books appointment
    await patientPage.goto('/login')
    await patientPage.getByLabel(/이메일/i).fill('patient@test.com')
    await patientPage.getByLabel(/비밀번호/i).fill('PatientPassword123!')
    await patientPage.getByRole('button', { name: /로그인/i }).click()
    
    await patientPage.waitForURL(/\/dashboard\/patient/)
    
    const bookingButton = patientPage.getByRole('button', { name: /예약하기|상담 예약/i })
    if (await bookingButton.isVisible()) {
      await bookingButton.click()
      
      // Select doctor and time
      const doctorSelect = patientPage.getByLabel(/의사 선택/i)
      if (await doctorSelect.isVisible()) {
        await doctorSelect.selectOption({ label: /테스트 의사/i })
      }
      
      const timeSlot = patientPage.getByText(/14:00/)
      if (await timeSlot.isVisible()) {
        await timeSlot.click()
        await patientPage.getByRole('button', { name: /예약 확정/i }).click()
        
        await expect(patientPage.getByText(/예약이 완료되었습니다/i)).toBeVisible()
      }
    }
    
    // Verify appointment appears in doctor's schedule
    await doctorPage.reload()
    await expect(doctorPage.getByText(/테스트 환자/i)).toBeVisible()
    
    await doctorPage.close()
    await patientPage.close()
  })

  test('data consistency across user actions', async ({ page }) => {
    // Test data consistency when multiple operations are performed
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Add patient
    const addPatientButton = page.getByRole('button', { name: /환자 추가/i })
    if (await addPatientButton.isVisible()) {
      await addPatientButton.click()
      
      const patientName = `일관성테스트환자-${Date.now()}`
      await page.getByLabel(/환자 이름/i).fill(patientName)
      await page.getByLabel(/이메일/i).fill(`consistency-${Date.now()}@test.com`)
      await page.getByRole('button', { name: /저장/i }).click()
      
      // Verify patient appears in list
      await expect(page.getByText(patientName)).toBeVisible()
      
      // Navigate away and back
      await page.getByRole('link', { name: /대시보드/i }).click()
      await page.getByRole('link', { name: /환자 관리/i }).click()
      
      // Verify patient still exists
      await expect(page.getByText(patientName)).toBeVisible()
    }
  })

  test('error handling and recovery', async ({ page }) => {
    // Test system behavior under error conditions
    await page.goto('/login')
    
    // Test invalid login
    await page.getByLabel(/이메일/i).fill('invalid@test.com')
    await page.getByLabel(/비밀번호/i).fill('wrongpassword')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await expect(page.getByText(/로그인 실패|잘못된 이메일|비밀번호/i)).toBeVisible()
    
    // Test network error simulation (if possible)
    await page.route('**/api/**', route => route.abort())
    
    await page.getByLabel(/이메일/i).fill('test@test.com')
    await page.getByLabel(/비밀번호/i).fill('password123')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    // Should show network error message
    await expect(page.getByText(/네트워크 오류|연결 실패/i)).toBeVisible()
    
    // Restore network and retry
    await page.unroute('**/api/**')
    await page.getByRole('button', { name: /다시 시도|재시도/i }).click()
  })

  test('performance under load simulation', async ({ page }) => {
    // Simulate multiple rapid actions
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Rapid navigation test
    const startTime = Date.now()
    
    for (let i = 0; i < 5; i++) {
      await page.getByRole('link', { name: /환자 관리/i }).click()
      await page.waitForLoadState('networkidle')
      
      await page.getByRole('link', { name: /대시보드/i }).click()
      await page.waitForLoadState('networkidle')
    }
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Should complete within reasonable time (adjust threshold as needed)
    expect(totalTime).toBeLessThan(30000) // 30 seconds
  })
})