import React from 'react'
import { render, screen } from '@testing-library/react'
import UserAvatar from '../UserAvatar'

describe('UserAvatar', () => {
  it('should display initials for single name', () => {
    render(<UserAvatar name="홍길동" />)
    expect(screen.getByText('홍')).toBeInTheDocument()
  })

  it('should display initials for full name', () => {
    render(<UserAvatar name="홍 길동" />)
    expect(screen.getByText('홍동')).toBeInTheDocument()
  })

  it('should display initials for multiple names', () => {
    render(<UserAvatar name="홍 길 동" />)
    expect(screen.getByText('홍동')).toBeInTheDocument()
  })

  it('should display question mark for empty name', () => {
    render(<UserAvatar name="" />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('should display user icon for undefined name', () => {
    render(<UserAvatar />)
    expect(screen.getByTitle('사용자')).toBeInTheDocument()
  })

  it('should apply correct size classes', () => {
    const { rerender } = render(<UserAvatar name="테스트" size="sm" />)
    expect(screen.getByText('테')).toHaveClass('w-8', 'h-8', 'text-xs')

    rerender(<UserAvatar name="테스트" size="md" />)
    expect(screen.getByText('테')).toHaveClass('w-10', 'h-10', 'text-sm')

    rerender(<UserAvatar name="테스트" size="lg" />)
    expect(screen.getByText('테')).toHaveClass('w-12', 'h-12', 'text-base')
  })

  it('should apply custom className', () => {
    render(<UserAvatar name="테스트" className="custom-class" />)
    expect(screen.getByText('테')).toHaveClass('custom-class')
  })

  it('should have correct title attribute', () => {
    render(<UserAvatar name="홍길동" />)
    expect(screen.getByTitle('홍길동')).toBeInTheDocument()
  })

  it('should handle English names correctly', () => {
    render(<UserAvatar name="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should handle mixed language names', () => {
    render(<UserAvatar name="김 John" />)
    expect(screen.getByText('김J')).toBeInTheDocument()
  })

  it('should trim whitespace from names', () => {
    render(<UserAvatar name="  홍길동  " />)
    expect(screen.getByText('홍')).toBeInTheDocument()
  })

  it('should handle names with extra spaces', () => {
    render(<UserAvatar name="홍   길   동" />)
    expect(screen.getByText('홍동')).toBeInTheDocument()
  })
})