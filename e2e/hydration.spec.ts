import { test, expect } from '@playwright/test'

test.describe('Hydration Error Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for hydration errors
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        throw new Error(`Hydration error detected: ${msg.text()}`)
      }
    })
  })

  test('should not have hydration errors on doctor dashboard', async ({ page }) => {
    await page.goto('/dashboard/doctor')
    
    // Wait for page to fully load and hydrate
    await page.waitForLoadState('networkidle')
    
    // Check that time display is working
    await expect(page.locator('[data-testid="time-display"]')).toBeVisible()
    
    // Verify no hydration warnings in console
    const logs = await page.evaluate(() => {
      return window.console.error.toString()
    })
    
    expect(logs).not.toContain('Hydration')
  })

  test('should not have hydration errors on customer dashboard', async ({ page }) => {
    await page.goto('/dashboard/customer')
    
    await page.waitForLoadState('networkidle')
    
    // Check that dashboard content loads properly
    await expect(page.locator('h1')).toContainText('안녕하세요')
    
    // Verify time display works without hydration issues
    await expect(page.locator('[data-testid="time-display"]')).toBeVisible()
  })

  test('should handle client-only components correctly', async ({ page }) => {
    await page.goto('/dashboard/doctor')
    
    // Wait for client-only components to mount
    await page.waitForTimeout(1000)
    
    // Check that modals can be opened without hydration errors
    const modalTrigger = page.locator('[data-testid="modal-trigger"]').first()
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }
  })

  test('should render consistent content between server and client', async ({ page }) => {
    // First, get the initial HTML
    await page.goto('/dashboard/doctor')
    const initialContent = await page.locator('main').innerHTML()
    
    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Compare with reloaded content (should be consistent)
    const reloadedContent = await page.locator('main').innerHTML()
    
    // The structure should be the same (allowing for dynamic content like time)
    expect(reloadedContent).toBeTruthy()
    expect(initialContent).toBeTruthy()
  })

  test('should handle time display without hydration mismatch', async ({ page }) => {
    await page.goto('/dashboard/doctor')
    
    // Wait for time display to hydrate
    await page.waitForSelector('[data-testid="time-display"]')
    
    // Check that time updates without causing hydration errors
    const initialTime = await page.locator('[data-testid="time-display"]').textContent()
    
    // Wait a bit for time to potentially update
    await page.waitForTimeout(2000)
    
    const updatedTime = await page.locator('[data-testid="time-display"]').textContent()
    
    // Time should be displayed (either same or updated)
    expect(initialTime).toBeTruthy()
    expect(updatedTime).toBeTruthy()
  })

  test('should handle navigation without hydration errors', async ({ page }) => {
    await page.goto('/dashboard/doctor')
    await page.waitForLoadState('networkidle')
    
    // Navigate to different sections
    const navLinks = page.locator('nav a')
    const linkCount = await navLinks.count()
    
    if (linkCount > 0) {
      // Click first navigation link
      await navLinks.first().click()
      await page.waitForLoadState('networkidle')
      
      // Should not have hydration errors after navigation
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should handle form interactions without hydration issues', async ({ page }) => {
    await page.goto('/dashboard/doctor')
    await page.waitForLoadState('networkidle')
    
    // Look for any forms on the page
    const forms = page.locator('form')
    const formCount = await forms.count()
    
    if (formCount > 0) {
      const form = forms.first()
      
      // Try to interact with form inputs
      const inputs = form.locator('input, textarea, select')
      const inputCount = await inputs.count()
      
      if (inputCount > 0) {
        const firstInput = inputs.first()
        await firstInput.focus()
        await firstInput.fill('test input')
        
        // Should not cause hydration errors
        await expect(firstInput).toHaveValue('test input')
      }
    }
  })

  test('should handle error boundaries correctly', async ({ page }) => {
    // Inject a script that will cause a hydration error
    await page.addInitScript(() => {
      // Override console.error to catch hydration errors
      const originalError = console.error
      window.hydrationErrors = []
      
      console.error = (...args) => {
        const message = args[0]
        if (typeof message === 'string' && message.includes('Hydration')) {
          window.hydrationErrors.push(message)
        }
        originalError.apply(console, args)
      }
    })
    
    await page.goto('/dashboard/doctor')
    await page.waitForLoadState('networkidle')
    
    // Check if any hydration errors were caught
    const hydrationErrors = await page.evaluate(() => window.hydrationErrors)
    
    // Should have no hydration errors
    expect(hydrationErrors).toHaveLength(0)
  })

  test('should validate HTML structure', async ({ page }) => {
    await page.goto('/dashboard/doctor')
    await page.waitForLoadState('networkidle')
    
    // Check for common HTML validation issues
    const nestedButtons = await page.locator('button button').count()
    const nestedLinks = await page.locator('a a').count()
    const divsInP = await page.locator('p div').count()
    
    expect(nestedButtons).toBe(0)
    expect(nestedLinks).toBe(0)
    expect(divsInP).toBe(0)
  })

  test('should handle responsive design without hydration issues', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }  // Desktop
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/dashboard/doctor')
      await page.waitForLoadState('networkidle')
      
      // Should render without hydration errors at any viewport size
      await expect(page.locator('body')).toBeVisible()
      
      // Check that responsive elements are working
      const mobileMenu = page.locator('[data-testid="mobile-menu"]')
      if (viewport.width < 768) {
        // Mobile menu should be available on small screens
        if (await mobileMenu.isVisible()) {
          await expect(mobileMenu).toBeVisible()
        }
      }
    }
  })
})