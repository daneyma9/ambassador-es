import React from 'react'
import clsx from 'clsx'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => (
    <form ref={ref} className={clsx('space-y-4', className)} {...props}>
      {children}
    </form>
  )
)
Form.displayName = 'Form'

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('space-y-2', className)} {...props}>
      {children}
    </div>
  )
)
FormGroup.displayName = 'FormGroup'

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  required?: boolean
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={clsx('block text-sm font-medium text-gray-700', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
)
FormLabel.displayName = 'FormLabel'

export { Form, FormGroup, FormLabel }
