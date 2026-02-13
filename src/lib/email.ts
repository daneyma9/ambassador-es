import { Resend } from 'resend'

// Resend configuration
const resend = new Resend(process.env.RESEND_API_KEY)

const emailConfig = {
  from: process.env.RESEND_FROM_EMAIL || 'noreply@taxdown.es',
}

export interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailParams): Promise<boolean> {
  try {
    if (!emailConfig.from || !process.env.RESEND_API_KEY) {
      console.warn('Email not configured, skipping send')
      return false
    }

    const result = await resend.emails.send({
      from: emailConfig.from,
      to,
      subject,
      html,
    })

    if (result.error) {
      console.error('Email send error:', result.error)
      return false
    }

    console.log('Email sent:', result.data?.id)
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// Email templates
export const emailTemplates = {
  submissionApproved: (data: {
    ambassadorName: string
    opportunityTitle: string
    amount: number
  }) => ({
    subject: '✓ Tu envío fue aprobado',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Tu envío fue aprobado! 🎉</h2>
        <p>Hola ${data.ambassadorName},</p>
        <p>Tu envío para <strong>"${data.opportunityTitle}"</strong> fue aprobado por nuestro equipo.</p>
        <p>Recibirás <strong style="color: #10B981;">€${data.amount.toFixed(2)}</strong> en el próximo pago semanal.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/submissions" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Ver mis entregas</a>
        <p style="margin-top: 24px; font-size: 12px; color: #666;">TaxDown Ambassador Portal</p>
      </div>
    `,
  }),

  submissionRejected: (data: {
    ambassadorName: string
    opportunityTitle: string
    reason: string
  }) => ({
    subject: '✗ Tu envío fue rechazado',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Tu envío fue rechazado</h2>
        <p>Hola ${data.ambassadorName},</p>
        <p>Lamentablemente, tu envío para <strong>"${data.opportunityTitle}"</strong> no fue aprobado.</p>
        <div style="background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 12px; margin: 16px 0;">
          <strong style="color: #7F1D1D;">Razón:</strong> ${data.reason}
        </div>
        <p>Puedes intentar nuevamente o seleccionar otra oportunidad.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/opportunities" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Ver oportunidades</a>
        <p style="margin-top: 24px; font-size: 12px; color: #666;">TaxDown Ambassador Portal</p>
      </div>
    `,
  }),

  paymentProcessed: (data: {
    ambassadorName: string
    amount: number
    count: number
  }) => ({
    subject: '💰 Tu pago fue procesado',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Tu pago fue procesado 💰</h2>
        <p>Hola ${data.ambassadorName},</p>
        <p>Tu pago semanal ha sido procesado exitosamente.</p>
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10B981;">€${data.amount.toFixed(2)}</p>
          <p style="margin: 4px 0 0 0; color: #666;">Por ${data.count} envío${data.count > 1 ? 's' : ''} aprobado${data.count > 1 ? 's' : ''}</p>
        </div>
        <p>El dinero llegará a tu cuenta bancaria en 1-3 días hábiles.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/payments" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Ver historial de pagos</a>
        <p style="margin-top: 24px; font-size: 12px; color: #666;">TaxDown Ambassador Portal</p>
      </div>
    `,
  }),

  welcomeAmbassador: (data: { ambassadorName: string }) => ({
    subject: 'Bienvenido al Portal de Embajadores TaxDown',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Bienvenido, ${data.ambassadorName}! 👋</h2>
        <p>Tu cuenta en el Portal de Embajadores de TaxDown ha sido aprobada.</p>
        <p>Ahora puedes:</p>
        <ul>
          <li>✓ Explorar oportunidades de colaboración</li>
          <li>✓ Rastrear posts relevantes en Reddit</li>
          <li>✓ Enviar tus comentarios para aprobación</li>
          <li>✓ Ganar dinero por cada comentario aprobado</li>
        </ul>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Ir al Dashboard</a>
        <p style="margin-top: 24px; font-size: 12px; color: #666;">TaxDown Ambassador Portal</p>
      </div>
    `,
  }),

  verifyEmail: (data: { ambassadorName: string; verificationCode: string }) => ({
    subject: 'Verifica tu email - Portal de Embajadores TaxDown',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Hola, ${data.ambassadorName}! 👋</h2>
        <p>Gracias por registrarte en el Portal de Embajadores de TaxDown.</p>
        <p>Para verificar tu email, usa este código:</p>
        <div style="background-color: #F3F4F6; border: 2px solid #E5E7EB; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; margin: 0;">${data.verificationCode}</p>
        </div>
        <p>Este código expira en 24 horas.</p>
        <p>Si no solicitaste esta verificación, ignora este email.</p>
        <p style="margin-top: 24px; font-size: 12px; color: #666;">TaxDown Ambassador Portal</p>
      </div>
    `,
  }),
}

// Send notification emails
export async function notifySubmissionApproved(data: {
  ambassadorEmail: string
  ambassadorName: string
  opportunityTitle: string
  amount: number
}): Promise<boolean> {
  const template = emailTemplates.submissionApproved({
    ambassadorName: data.ambassadorName,
    opportunityTitle: data.opportunityTitle,
    amount: data.amount,
  })

  return sendEmail({
    to: data.ambassadorEmail,
    subject: template.subject,
    html: template.html,
  })
}

export async function notifySubmissionRejected(data: {
  ambassadorEmail: string
  ambassadorName: string
  opportunityTitle: string
  reason: string
}): Promise<boolean> {
  const template = emailTemplates.submissionRejected({
    ambassadorName: data.ambassadorName,
    opportunityTitle: data.opportunityTitle,
    reason: data.reason,
  })

  return sendEmail({
    to: data.ambassadorEmail,
    subject: template.subject,
    html: template.html,
  })
}

export async function notifyPaymentProcessed(data: {
  ambassadorEmail: string
  ambassadorName: string
  amount: number
  count: number
}): Promise<boolean> {
  const template = emailTemplates.paymentProcessed({
    ambassadorName: data.ambassadorName,
    amount: data.amount,
    count: data.count,
  })

  return sendEmail({
    to: data.ambassadorEmail,
    subject: template.subject,
    html: template.html,
  })
}

export async function notifyWelcomeAmbassador(data: {
  ambassadorEmail: string
  ambassadorName: string
}): Promise<boolean> {
  const template = emailTemplates.welcomeAmbassador({
    ambassadorName: data.ambassadorName,
  })

  return sendEmail({
    to: data.ambassadorEmail,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendVerificationEmail(data: {
  ambassadorEmail: string
  ambassadorName: string
  verificationCode: string
}): Promise<boolean> {
  const template = emailTemplates.verifyEmail({
    ambassadorName: data.ambassadorName,
    verificationCode: data.verificationCode,
  })

  return sendEmail({
    to: data.ambassadorEmail,
    subject: template.subject,
    html: template.html,
  })
}
