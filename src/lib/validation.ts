import { z } from 'zod'

// Email validation
export const emailSchema = z
  .string()
  .email('Email inválido')
  .refine(
    (email) => email.endsWith('@taxdown.es'),
    'Solo se permiten emails de @taxdown.es'
  )

// Reddit URL validation
export const redditUrlSchema = z
  .string()
  .url('URL inválida')
  .refine(
    (url) => url.includes('reddit.com'),
    'La URL debe ser de reddit.com'
  )
  .refine(
    (url) => url.includes('/r/Spain'),
    'Solo se permiten comentarios de r/Spain'
  )

// IBAN validation (basic)
export const ibanSchema = z
  .string()
  .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, 'IBAN inválido')

// Registration schema
export const registerSchema = z.object({
  email: emailSchema,
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es muy largo'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
})

// Submission schema
export const submissionSchema = z.object({
  redditUrl: redditUrlSchema,
  opportunityId: z.string().min(1, 'Selecciona una oportunidad'),
  description: z.string().optional(),
})

// IBAN update schema
export const updateIbanSchema = z.object({
  bankAccount: ibanSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type SubmissionInput = z.infer<typeof submissionSchema>
export type UpdateIbanInput = z.infer<typeof updateIbanSchema>
