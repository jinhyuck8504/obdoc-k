import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'soft' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl focus:ring-purple-500',
    secondary: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200 hover:border-purple-300 focus:ring-purple-500',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
    warning: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl focus:ring-orange-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    outline: 'border-2 border-purple-300 bg-white text-purple-700 hover:bg-purple-50 hover:border-purple-400 focus:ring-purple-500',
    ghost: 'text-purple-700 hover:bg-purple-100 hover:text-purple-800 focus:ring-purple-500',
    soft: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 hover:border-purple-300 focus:ring-purple-500',
    gradient: 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl focus:ring-purple-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  )
}

// Kiro Light 테마 전용 Button 변형들
export function KiroButton({
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      variant="gradient"
      className={`shadow-purple-500/25 hover:shadow-purple-500/40 ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
}

export function KiroButtonSoft({
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      variant="soft"
      className={`backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
}

export function KiroButtonOutline({
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      variant="outline"
      className={`backdrop-blur-sm hover:backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
}

export function KiroButtonGhost({
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      variant="ghost"
      className={`hover:backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
}

// Hero 섹션용 특별한 버튼
export function KiroHeroButton({
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'variant' | 'size'>) {
  return (
    <Button
      variant="gradient"
      size="lg"
      className={`shadow-2xl hover:shadow-purple-500/50 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 transform hover:scale-105 active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
}

export function KiroHeroButtonOutline({
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'variant' | 'size'>) {
  return (
    <Button
      variant="outline"
      size="lg"
      className={`bg-white/90 backdrop-blur-sm border-purple-300 text-purple-700 hover:bg-white hover:border-purple-400 shadow-lg hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
}
