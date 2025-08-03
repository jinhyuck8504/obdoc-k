import { validateHTMLStructure, validateComponentHTML } from '../htmlValidator'

describe('HTML Validator', () => {
  describe('validateHTMLStructure', () => {
    it('passes valid HTML structure', () => {
      const validHTML = `
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Click me</button>
        </div>
      `
      
      const result = validateHTMLStructure(validHTML)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('detects nested buttons', () => {
      const invalidHTML = `
        <button>
          Outer button
          <button>Inner button</button>
        </button>
      `
      
      const result = validateHTMLStructure(invalidHTML)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          rule: 'no-nested-buttons',
          severity: 'error'
        })
      )
    })

    it('detects nested links', () => {
      const invalidHTML = `
        <a href="/outer">
          Outer link
          <a href="/inner">Inner link</a>
        </a>
      `
      
      const result = validateHTMLStructure(invalidHTML)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          rule: 'no-nested-links',
          severity: 'error'
        })
      )
    })

    it('detects div inside p tag', () => {
      const invalidHTML = `
        <p>
          This is a paragraph
          <div>This div should not be here</div>
        </p>
      `
      
      const result = validateHTMLStructure(invalidHTML)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          rule: 'no-div-in-p',
          severity: 'error'
        })
      )
    })

    it('detects block elements in inline elements', () => {
      const invalidHTML = `
        <span>
          This is inline
          <div>This block should not be here</div>
        </span>
      `
      
      const result = validateHTMLStructure(invalidHTML)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          rule: 'no-block-in-inline',
          severity: 'error'
        })
      )
    })

    it('detects improper heading hierarchy', () => {
      const invalidHTML = `
        <div>
          <h1>Main Title</h1>
          <h3>Skipped h2</h3>
        </div>
      `
      
      const result = validateHTMLStructure(invalidHTML)
      
      expect(result.isValid).toBe(true) // This is a warning, not an error
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          rule: 'proper-heading-hierarchy',
          severity: 'warning'
        })
      )
    })

    it('detects empty elements', () => {
      const invalidHTML = `
        <div>
          <p></p>
          <span>   </span>
        </div>
      `
      
      const result = validateHTMLStructure(invalidHTML)
      
      expect(result.isValid).toBe(true) // This is a warning, not an error
      expect(result.errors.some(e => e.rule === 'no-empty-elements')).toBe(true)
    })

    it('validates proper table structure', () => {
      const validTableHTML = `
        <table>
          <thead>
            <tr><th>Header</th></tr>
          </thead>
          <tbody>
            <tr><td>Data</td></tr>
          </tbody>
        </table>
      `
      
      const result = validateHTMLStructure(validTableHTML)
      
      expect(result.isValid).toBe(true)
    })

    it('detects improper table structure', () => {
      const invalidTableHTML = `
        <table>
          <tr><td>Direct tr in table</td></tr>
        </table>
      `
      
      const result = validateHTMLStructure(invalidTableHTML)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          rule: 'proper-table-structure',
          severity: 'error'
        })
      )
    })

    it('handles multiple validation errors', () => {
      const invalidHTML = `
        <button>
          <button>Nested button</button>
          <a href="#">
            <a href="#">Nested link</a>
          </a>
        </button>
      `
      
      const result = validateHTMLStructure(invalidHTML)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.errors.some(e => e.rule === 'no-nested-buttons')).toBe(true)
      expect(result.errors.some(e => e.rule === 'no-nested-links')).toBe(true)
    })
  })

  describe('validateComponentHTML', () => {
    it('logs errors to console in development', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation()

      const invalidHTML = '<button><button>Nested</button></button>'
      
      validateComponentHTML(invalidHTML, 'TestComponent')
      
      expect(consoleSpy).toHaveBeenCalledWith('🚨 HTML Validation Errors in TestComponent')
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleGroupEndSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
    })

    it('does not log for valid HTML', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation()
      
      const validHTML = '<div><p>Valid content</p></div>'
      
      validateComponentHTML(validHTML, 'TestComponent')
      
      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})