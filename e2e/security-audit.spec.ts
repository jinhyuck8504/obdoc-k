import { test, expect } from '@playwright/test'

test.describe('Security Audit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('authentication security checks', async ({ page }) => {
    // Test password requirements
    await page.goto('/signup')
    
    await page.getByLabel(/이름/i).fill('테스트 사용자')
    await page.getByLabel(/이메일/i).fill('test@example.com')
    
    // Test weak password rejection
    await page.getByLabel(/비밀번호/i).fill('123')
    await page.getByRole('button', { name: /회원가입/i }).click()
    
    await expect(page.getByText(/비밀번호는 최소 8자|비밀번호가 너무 짧습니다/i)).toBeVisible()
    
    // Test password without special characters
    await page.getByLabel(/비밀번호/i).fill('password123')
    await page.getByRole('button', { name: /회원가입/i }).click()
    
    await expect(page.getByText(/특수문자를 포함해야|비밀번호 조건/i)).toBeVisible()
    
    // Test SQL injection attempts in login
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill("admin'; DROP TABLE users; --")
    await page.getByLabel(/비밀번호/i).fill('password')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    // Should not cause system error, should show invalid login
    await expect(page.getByText(/로그인 실패|잘못된 이메일/i)).toBeVisible()
  })

  test('XSS protection checks', async ({ page }) => {
    // Test XSS in form inputs
    await page.goto('/signup')
    
    const xssPayload = '<script>alert("XSS")</script>'
    
    await page.getByLabel(/이름/i).fill(xssPayload)
    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.getByLabel(/비밀번호/i).fill('TestPassword123!')
    await page.getByRole('button', { name: /회원가입/i }).click()
    
    // XSS should be sanitized, no alert should appear
    const alertPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null)
    const alert = await alertPromise
    expect(alert).toBeNull()
    
    // Test XSS in URL parameters
    await page.goto('/dashboard/doctor?name=<script>alert("XSS")</script>')
    
    const urlAlertPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null)
    const urlAlert = await urlAlertPromise
    expect(urlAlert).toBeNull()
  })

  test('CSRF protection checks', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Try to make a request without CSRF token (simulate external site attack)
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'CSRF Test Patient',
            email: 'csrf@test.com'
          })
        })
        return response.status
      } catch (error) {
        return 'error'
      }
    })
    
    // Should be rejected due to missing CSRF token
    expect(response).toBe(403)
  })

  test('session security checks', async ({ page, context }) => {
    // Test session timeout
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Simulate session expiry by manipulating cookies
    await context.clearCookies()
    
    // Try to access protected route
    await page.goto('/dashboard/doctor/customers')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
    
    // Test concurrent sessions
    const newContext = await page.context().browser()?.newContext()
    if (newContext) {
      const newPage = await newContext.newPage()
      
      await newPage.goto('/login')
      await newPage.getByLabel(/이메일/i).fill('doctor@test.com')
      await newPage.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
      await newPage.getByRole('button', { name: /로그인/i }).click()
      
      await newPage.waitForURL(/\/dashboard\/doctor/)
      
      // Both sessions should be valid (or implement session limit if required)
      await expect(newPage.getByRole('heading', { name: /의사 대시보드/i })).toBeVisible()
      
      await newContext.close()
    }
  })

  test('data access control checks', async ({ page }) => {
    // Login as patient
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('patient@test.com')
    await page.getByLabel(/비밀번호/i).fill('PatientPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/patient/)
    
    // Try to access doctor-only routes
    await page.goto('/dashboard/doctor')
    await expect(page).toHaveURL('/unauthorized')
    
    // Try to access admin routes
    await page.goto('/dashboard/admin')
    await expect(page).toHaveURL('/unauthorized')
    
    // Try to access other patient's data via API
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/customers/other-customer-id')
        return response.status
      } catch (error) {
        return 'error'
      }
    })
    
    // Should be forbidden
    expect(response).toBe(403)
  })

  test('input validation and sanitization', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Test malicious file upload (if file upload exists)
    const fileInput = page.locator('input[type="file"]').first()
    if (await fileInput.isVisible()) {
      // Create a malicious file
      const maliciousContent = '<?php system($_GET["cmd"]); ?>'
      const buffer = Buffer.from(maliciousContent)
      
      await fileInput.setInputFiles({
        name: 'malicious.php',
        mimeType: 'application/x-php',
        buffer: buffer
      })
      
      const uploadButton = page.getByRole('button', { name: /업로드|저장/i })
      if (await uploadButton.isVisible()) {
        await uploadButton.click()
        
        // Should reject PHP files
        await expect(page.getByText(/지원하지 않는 파일|파일 형식 오류/i)).toBeVisible()
      }
    }
    
    // Test oversized input
    const longString = 'A'.repeat(10000)
    const nameInput = page.getByLabel(/이름|환자 이름/i).first()
    if (await nameInput.isVisible()) {
      await nameInput.fill(longString)
      
      const saveButton = page.getByRole('button', { name: /저장|추가/i }).first()
      if (await saveButton.isVisible()) {
        await saveButton.click()
        
        // Should show validation error
        await expect(page.getByText(/너무 깁니다|길이 초과/i)).toBeVisible()
      }
    }
  })

  test('API security headers check', async ({ page }) => {
    // Check security headers on API responses
    const response = await page.request.get('/api/health')
    
    const headers = response.headers()
    
    // Check for security headers
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBeTruthy()
    expect(headers['referrer-policy']).toBeTruthy()
    
    // Check that sensitive headers are not exposed
    expect(headers['server']).toBeFalsy()
    expect(headers['x-powered-by']).toBeFalsy()
  })

  test('rate limiting checks', async ({ page }) => {
    // Test login rate limiting
    await page.goto('/login')
    
    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await page.getByLabel(/이메일/i).fill('test@example.com')
      await page.getByLabel(/비밀번호/i).fill('wrongpassword')
      await page.getByRole('button', { name: /로그인/i }).click()
      
      await page.waitForTimeout(500) // Small delay between attempts
    }
    
    // Should show rate limit message
    await expect(page.getByText(/너무 많은 시도|잠시 후 다시|rate limit/i)).toBeVisible()
  })

  test('secure cookie settings', async ({ page, context }) => {
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Check cookie security attributes
    const cookies = await context.cookies()
    const sessionCookie = cookies.find(cookie => 
      cookie.name.includes('session') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('token')
    )
    
    if (sessionCookie) {
      expect(sessionCookie.secure).toBeTruthy() // Should be secure in production
      expect(sessionCookie.httpOnly).toBeTruthy() // Should be HTTP-only
      expect(sessionCookie.sameSite).toBe('Strict') // Should have SameSite protection
    }
  })

  test('content security policy compliance', async ({ page }) => {
    // Check for CSP violations
    const cspViolations: any[] = []
    
    page.on('console', msg => {
      if (msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Navigate through key pages
    await page.goto('/login')
    await page.goto('/signup')
    await page.goto('/terms')
    await page.goto('/privacy')
    
    // Should have no CSP violations
    expect(cspViolations).toHaveLength(0)
  })

  test('data encryption verification', async ({ page }) => {
    // Verify sensitive data is not exposed in plain text
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Check that sensitive data in localStorage/sessionStorage is encrypted
    const storageData = await page.evaluate(() => {
      const localStorage = window.localStorage
      const sessionStorage = window.sessionStorage
      
      const data: any = {}
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          data[key] = localStorage.getItem(key)
        }
      }
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          data[key] = sessionStorage.getItem(key)
        }
      }
      
      return data
    })
    
    // Check that no plain text passwords or sensitive data are stored
    Object.values(storageData).forEach(value => {
      if (typeof value === 'string') {
        expect(value).not.toContain('DoctorPassword123!')
        expect(value).not.toContain('password')
        expect(value).not.toContain('secret')
      }
    })
  })
})