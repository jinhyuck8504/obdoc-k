import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on home page', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have accessibility issues on login page', async ({ page }) => {
    await page.goto('/login')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have accessibility issues on signup page', async ({ page }) => {
    await page.goto('/signup')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    const h1 = await page.locator('h1').count()
    expect(h1).toBeGreaterThan(0)
    
    // Check that there's only one h1
    expect(h1).toBeLessThanOrEqual(1)
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login')
    
    const emailInput = page.getByLabel(/이메일/i)
    const passwordInput = page.getByLabel(/비밀번호/i)
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    
    // Check that inputs have proper labels
    await expect(emailInput).toHaveAttribute('aria-label')
    await expect(passwordInput).toHaveAttribute('aria-label')
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/login')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    const firstFocusable = await page.evaluate(() => document.activeElement?.tagName)
    expect(['INPUT', 'BUTTON', 'A']).toContain(firstFocusable)
    
    await page.keyboard.press('Tab')
    const secondFocusable = await page.evaluate(() => document.activeElement?.tagName)
    expect(['INPUT', 'BUTTON', 'A']).toContain(secondFocusable)
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )
    
    expect(colorContrastViolations).toEqual([])
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/dashboard/doctor')
    
    if (page.url().includes('/login')) {
      test.skip('User not authenticated')
    }
    
    // Check for proper ARIA landmarks
    const main = page.locator('[role="main"], main')
    const navigation = page.locator('[role="navigation"], nav')
    
    await expect(main).toBeVisible()
    await expect(navigation).toBeVisible()
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login')
    
    // Test keyboard navigation through form
    await page.keyboard.press('Tab') // Focus first input
    await page.keyboard.type('test@example.com')
    
    await page.keyboard.press('Tab') // Focus password input
    await page.keyboard.type('password123')
    
    await page.keyboard.press('Tab') // Focus submit button
    await page.keyboard.press('Enter') // Submit form
    
    // Should show validation or attempt login
    const errorMessage = page.locator('[role="alert"], .error-message')
    const loadingState = page.locator('.loading, [aria-busy="true"]')
    
    // Either error message or loading state should appear
    await expect(errorMessage.or(loadingState)).toBeVisible()
  })

  test('should have proper skip links', async ({ page }) => {
    await page.goto('/')
    
    // Test skip to main content link
    await page.keyboard.press('Tab')
    const skipLink = page.locator('a[href="#main"], a[href="#content"]')
    
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible()
      await skipLink.click()
      
      const mainContent = page.locator('#main, #content, [role="main"]')
      await expect(mainContent).toBeFocused()
    }
  })

  test('should have proper image alt texts', async ({ page }) => {
    await page.goto('/')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      const role = await image.getAttribute('role')
      
      // Images should have alt text or be marked as decorative
      expect(alt !== null || role === 'presentation').toBeTruthy()
    }
  })

  test('should handle screen reader announcements', async ({ page }) => {
    await page.goto('/login')
    
    // Test form submission with screen reader announcements
    await page.getByRole('button', { name: /로그인/i }).click()
    
    // Check for ARIA live regions or alert messages
    const liveRegion = page.locator('[aria-live], [role="alert"], [role="status"]')
    
    if (await liveRegion.count() > 0) {
      await expect(liveRegion).toBeVisible()
    }
  })
})