import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-900',
        primary: 'bg-indigo-100 text-indigo-900',
        success: 'bg-green-100 text-green-900',
        danger: 'bg-red-100 text-red-900',
        warning: 'bg-yellow-100 text-yellow-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(badgeVariants({ variant, className }))}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
