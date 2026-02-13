import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const buttonVariants = cva(
  'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, children, ...props }, ref) => (
    <button
      className={clsx(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? '⏳ Cargando...' : children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
