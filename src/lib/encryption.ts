import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key-must-be-32-chars!'

// Ensure key is 32 bytes
function getEncryptionKey(): Buffer {
  const key = ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)
  return Buffer.from(key)
}

export function encryptIBAN(iban: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv)

    let encrypted = cipher.update(iban, 'utf-8', 'hex')
    encrypted += cipher.final('hex')

    // Return IV:encrypted
    return `${iv.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt IBAN')
  }
}

export function decryptIBAN(encryptedIBAN: string): string {
  try {
    const [ivHex, encrypted] = encryptedIBAN.split(':')
    const iv = Buffer.from(ivHex, 'hex')

    const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt IBAN')
  }
}

export function maskIBAN(iban: string): string {
  if (iban.length < 4) return '****'
  return '*'.repeat(iban.length - 4) + iban.slice(-4)
}
