import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: /로그인/i })).toBeVisible()
    await expect(page.getByLabel(/이메일/i)).toBeVisible()
    await expect(page.getByLabel(/비밀번호/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /로그인/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await expect(page.getByText(/이메일을 입력해주세요/i)).toBeVisible()
    await expect(page.getByText(/비밀번호를 입력해주세요/i)).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/이메일/i).fill('invalid-email')
    await page.getByLabel(/비밀번호/i).fill('password123')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await expect(page.getByText(/올바른 이메일 형식을 입력해주세요/i)).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('link', { name: /회원가입/i }).click()
    
    await expect(page).toHaveURL('/signup')
    await expect(page.getByRole('heading', { name: /회원가입/i })).toBeVisible()
  })

  test('should display signup form', async ({ page }) => {
    await page.goto('/signup')
    
    await expect(page.getByRole('heading', { name: /회원가입/i })).toBeVisible()
    await expect(page.getByLabel(/이름/i)).toBeVisible()
    await expect(page.getByLabel(/이메일/i)).toBeVisible()
    await expect(page.getByLabel(/비밀번호/i)).toBeVisible()
    await expect(page.getByLabel(/비밀번호 확인/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /회원가입/i })).toBeVisible()
  })

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/signup')
    
    await page.getByLabel(/이름/i).fill('테스트 사용자')
    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.getByLabel(/비밀번호/i).fill('password123')
    await page.getByLabel(/비밀번호 확인/i).fill('password456')
    await page.getByRole('button', { name: /회원가입/i }).click()
    
    await expect(page.getByText(/비밀번호가 일치하지 않습니다/i)).toBeVisible()
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard/doctor')
    
    await expect(page).toHaveURL('/login')
  })

  test('should show unauthorized page for wrong role', async ({ page }) => {
    // This test would require setting up a test user with specific role
    // For now, we'll test the unauthorized page directly
    await page.goto('/unauthorized')
    
    await expect(page.getByRole('heading', { name: /접근 권한이 없습니다/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /홈으로 돌아가기/i })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation to login
    await page.getByRole('link', { name: /로그인/i }).click()
    await expect(page).toHaveURL('/login')
    
    // Test navigation to signup
    await page.getByRole('link', { name: /회원가입/i }).click()
    await expect(page).toHaveURL('/signup')
    
    // Test navigation to terms
    await page.goto('/')
    await page.getByRole('link', { name: /이용약관/i }).click()
    await expect(page).toHaveURL('/terms')
    
    // Test navigation to privacy
    await page.goto('/')
    await page.getByRole('link', { name: /개인정보처리방침/i }).click()
    await expect(page).toHaveURL('/privacy')
  })

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test mobile menu
    await page.setViewportSize({ width: 375, height: 667 })
    
    const mobileMenuButton = page.getByRole('button', { name: /메뉴/i })
    await expect(mobileMenuButton).toBeVisible()
    
    await mobileMenuButton.click()
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})