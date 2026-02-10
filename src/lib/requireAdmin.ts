import { auth } from '@clerk/nextjs/server'

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    throw new Error('Unauthenticated')
  }

  if ((sessionClaims?.publicMetadata as { role?: string })?.role !== 'admin') {
    throw new Error('Unauthorized')
  }
}
