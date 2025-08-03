import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    // Test home page load time
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const homeLoadTime = Date.now() - startTime
    
    expect(homeLoadTime).toBeLessThan(3000) // Should load within 3 seconds
    
    // Test login page load time
    const loginStartTime = Date.now()
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const loginLoadTime = Date.now() - loginStartTime
    
    expect(loginLoadTime).toBeLessThan(2000) // Should load within 2 seconds
    
    // Test dashboard load time after login
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    
    const dashboardStartTime = Date.now()
    await page.getByRole('button', { name: /로그인/i }).click()
    await page.waitForURL(/\/dashboard\/doctor/)
    await page.waitForLoadState('networkidle')
    const dashboardLoadTime = Date.now() - dashboardStartTime
    
    expect(dashboardLoadTime).toBeLessThan(4000) // Should load within 4 seconds
  })

  test('API response times', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Test health check API
    const healthStartTime = Date.now()
    const healthResponse = await page.request.get('/api/health')
    const healthResponseTime = Date.now() - healthStartTime
    
    expect(healthResponse.status()).toBe(200)
    expect(healthResponseTime).toBeLessThan(1000) // Should respond within 1 second
    
    // Test customers API
    const customersStartTime = Date.now()
    const customersResponse = await page.request.get('/api/customers')
    const customersResponseTime = Date.now() - customersStartTime
    
    expect(patientsResponseTime).toBeLessThan(2000) // Should respond within 2 seconds
  })

  test('memory usage monitoring', async ({ page }) => {
    await page.goto('/')
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null
    })
    
    // Navigate through multiple pages
    const pages = ['/login', '/signup', '/terms', '/privacy', '/contact']
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
    }
    
    // Check memory usage after navigation
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null
    })
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
      const memoryIncreasePercent = (memoryIncrease / initialMemory.usedJSHeapSize) * 100
      
      // Memory increase should be reasonable (less than 100% increase)
      expect(memoryIncreasePercent).toBeLessThan(100)
    }
  })

  test('concurrent user simulation', async ({ browser }) => {
    const contexts = []
    const pages = []
    
    // Create 5 concurrent browser contexts
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      contexts.push(context)
      pages.push(page)
    }
    
    // Simulate concurrent logins
    const loginPromises = pages.map(async (page, index) => {
      await page.goto('/login')
      await page.getByLabel(/이메일/i).fill(`user${index}@test.com`)
      await page.getByLabel(/비밀번호/i).fill('TestPassword123!')
      
      const startTime = Date.now()
      await page.getByRole('button', { name: /로그인/i }).click()
      
      // Wait for either success or failure
      try {
        await page.waitForURL(/\/dashboard/, { timeout: 10000 })
        return Date.now() - startTime
      } catch {
        // Login might fail for non-existent users, that's okay
        return Date.now() - startTime
      }
    })
    
    const loginTimes = await Promise.all(loginPromises)
    
    // All logins should complete within reasonable time
    loginTimes.forEach(time => {
      expect(time).toBeLessThan(10000) // 10 seconds max
    })
    
    // Average response time should be reasonable
    const averageTime = loginTimes.reduce((a, b) => a + b, 0) / loginTimes.length
    expect(averageTime).toBeLessThan(5000) // 5 seconds average
    
    // Cleanup
    for (const context of contexts) {
      await context.close()
    }
  })

  test('large data set handling', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Navigate to patient list
    const patientListLink = page.getByRole('link', { name: /환자 관리|환자 목록/i })
    if (await patientListLink.isVisible()) {
      const startTime = Date.now()
      await patientListLink.click()
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      // Should load even with large patient list within reasonable time
      expect(loadTime).toBeLessThan(5000)
      
      // Test pagination if available
      const nextPageButton = page.getByRole('button', { name: /다음|Next/i })
      if (await nextPageButton.isVisible()) {
        const paginationStartTime = Date.now()
        await nextPageButton.click()
        await page.waitForLoadState('networkidle')
        const paginationTime = Date.now() - paginationStartTime
        
        expect(paginationTime).toBeLessThan(3000)
      }
    }
  })

  test('image and asset loading performance', async ({ page }) => {
    // Monitor network requests
    const requests: any[] = []
    page.on('request', request => {
      requests.push({
        url: request.url(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      })
    })
    
    const responses: any[] = []
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        timestamp: Date.now()
      })
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check image loading times
    const imageRequests = requests.filter(req => req.resourceType === 'image')
    const imageResponses = responses.filter(res => 
      imageRequests.some(req => req.url === res.url)
    )
    
    imageResponses.forEach(response => {
      expect(response.status).toBe(200)
    })
    
    // Check CSS and JS loading
    const cssRequests = requests.filter(req => req.resourceType === 'stylesheet')
    const jsRequests = requests.filter(req => req.resourceType === 'script')
    
    // Should have reasonable number of requests
    expect(cssRequests.length).toBeLessThan(10)
    expect(jsRequests.length).toBeLessThan(20)
  })

  test('mobile performance', async ({ browser }) => {
    // Test on mobile viewport
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    })
    
    const page = await context.newPage()
    
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const mobileLoadTime = Date.now() - startTime
    
    // Mobile should load within reasonable time
    expect(mobileLoadTime).toBeLessThan(4000)
    
    // Test mobile navigation
    const mobileMenuButton = page.getByRole('button', { name: /메뉴|Menu/i })
    if (await mobileMenuButton.isVisible()) {
      const menuStartTime = Date.now()
      await mobileMenuButton.click()
      await page.waitForSelector('[role="navigation"]', { state: 'visible' })
      const menuTime = Date.now() - menuStartTime
      
      expect(menuTime).toBeLessThan(1000)
    }
    
    await context.close()
  })

  test('database query performance', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/이메일/i).fill('doctor@test.com')
    await page.getByLabel(/비밀번호/i).fill('DoctorPassword123!')
    await page.getByRole('button', { name: /로그인/i }).click()
    
    await page.waitForURL(/\/dashboard\/doctor/)
    
    // Test search functionality performance
    const searchInput = page.getByPlaceholder(/검색|Search/i).first()
    if (await searchInput.isVisible()) {
      const searchStartTime = Date.now()
      await searchInput.fill('테스트')
      await searchInput.press('Enter')
      await page.waitForLoadState('networkidle')
      const searchTime = Date.now() - searchStartTime
      
      expect(searchTime).toBeLessThan(3000)
    }
    
    // Test data filtering performance
    const filterButton = page.getByRole('button', { name: /필터|Filter/i }).first()
    if (await filterButton.isVisible()) {
      const filterStartTime = Date.now()
      await filterButton.click()
      
      const filterOption = page.getByText(/활성|Active/i).first()
      if (await filterOption.isVisible()) {
        await filterOption.click()
        await page.waitForLoadState('networkidle')
        const filterTime = Date.now() - filterStartTime
        
        expect(filterTime).toBeLessThan(2000)
      }
    }
  })

  test('cache effectiveness', async ({ page }) => {
    // First visit
    const firstVisitStart = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const firstVisitTime = Date.now() - firstVisitStart
    
    // Second visit (should be faster due to caching)
    const secondVisitStart = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')
    const secondVisitTime = Date.now() - secondVisitStart
    
    // Second visit should be significantly faster
    expect(secondVisitTime).toBeLessThan(firstVisitTime * 0.8)
    
    // Test static asset caching
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    const thirdVisitStart = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const thirdVisitTime = Date.now() - thirdVisitStart
    
    // Should be fast due to cached assets
    expect(thirdVisitTime).toBeLessThan(2000)
  })
})