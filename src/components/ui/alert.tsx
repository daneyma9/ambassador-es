import React from 'react'
import clsx from 'clsx'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType
  title?: string
  children: React.ReactNode
}

const alertStyles: Record<AlertType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, type = 'info', title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'px-4 py-3 rounded-lg border',
        alertStyles[type],
        className
      )}
      {...props}
    >
      {title && <p className="font-medium mb-1">{title}</p>}
      <p className="text-sm">{children}</p>
    </div>
  )
)
Alert.displayName = 'Alert'

export { Alert }
