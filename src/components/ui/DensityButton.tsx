import React from 'react'
import { cn } from '@/lib/utils'
import { useDensity } from '@/contexts/DensityContext'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  density?: 'compact' | 'comfortable' | 'spacious'
}

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case 'destructive':
      return 'bg-red-600 text-white hover:bg-red-700'
    case 'outline':
      return 'border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900'
    case 'secondary':
      return 'bg-gray-100 text-gray-900 hover:bg-gray-200'
    case 'ghost':
      return 'hover:bg-gray-100 hover:text-gray-900'
    case 'link':
      return 'text-blue-600 underline-offset-4 hover:underline'
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700'
  }
}

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'sm':
      return 'h-9 rounded-md px-3'
    case 'lg':
      return 'h-11 rounded-md px-8'
    case 'icon':
      return 'h-10 w-10'
    default:
      return 'h-10 px-4 py-2'
  }
}

const DensityButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', density, asChild = false, ...props }, ref) => {
    const { density: contextDensity, getDensityClass } = useDensity()
    const activeDensity = density || contextDensity

    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    return (
      <button
        className={cn(
          baseClasses,
          getVariantClasses(variant),
          getSizeClasses(size),
          getDensityClass('button'),
          `button-${activeDensity}`,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
DensityButton.displayName = 'DensityButton'

export { DensityButton }
