import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'bg-gray-900 text-gray-50 hover:bg-gray-800',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900',
      ghost: 'hover:bg-gray-100 hover:text-gray-900',
      link: 'justify-start h-auto px-0 py-0 text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline focus-visible:ring-offset-0'
    }

    const sizes = {
      default: 'h-10 px-4 py-2 rounded-md justify-center',
      sm: 'h-9 px-3 rounded-md justify-center',
      lg: 'h-11 px-8 rounded-md justify-center'
    }

    const sizeClass = variant === 'link' ? '' : sizes[size]

    const combinedClasses = `${baseStyles} ${variants[variant]} ${sizeClass} ${className}`.trim()

    return (
      <button
        className={combinedClasses}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
