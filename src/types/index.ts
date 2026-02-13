export type Role = 'AMBASSADOR' | 'ADMIN' | 'SUPER_ADMIN'

export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'

export type OpportunityStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'

export type SubmissionStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAID'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'

export type NotificationType =
  | 'SUBMISSION_APPROVED'
  | 'SUBMISSION_REJECTED'
  | 'PAYMENT_PROCESSED'
  | 'NEW_OPPORTUNITY'
  | 'PAYMENT_FAILED'
  | 'ACCOUNT_SUSPENDED'

export interface AppUser {
  id: string
  email: string
  name: string
  role: Role
  status: UserStatus
  profilePicture?: string
  totalEarnings: number
  approvedSubmissions: number
}

export interface Opportunity {
  id: string
  title: string
  description: string
  category: string
  reward: number
  status: OpportunityStatus
}

export interface Submission {
  id: string
  ambassadorId: string
  opportunityId: string
  redditUrl: string
  screenshotUrl?: string
  status: SubmissionStatus
  amount: number
  submittedAt: Date
  reviewedAt?: Date
  rejectionReason?: string
}

export interface PaymentRecord {
  id: string
  ambassadorId: string
  amount: float
  status: PaymentStatus
  createdAt: Date
  paidAt?: Date
}
