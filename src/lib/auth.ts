import  prisma  from '@/utils/prisma';

// Admin emails - you can also store this in environment variables
const ADMIN_EMAILS = [
  'admin@careerforty.com',
  'phangela@careerforty.com',
  // Add more admin emails here
];

export async function checkAdminStatus(email: string): Promise<boolean> {
  if (!email) return false;

  try {
    // Check if email is in admin list
    const isAdminByEmail = ADMIN_EMAILS.includes(email.toLowerCase());
    
    // Also check database for admin status
    let dbAdminStatus = false;
    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
        select: { isAdmin: true, role: true }
      });
      
      dbAdminStatus = user?.isAdmin || user?.role === 'ADMIN';
    } catch (dbError) {
      console.error('Database admin check failed:', dbError);
    }

    return isAdminByEmail || dbAdminStatus;
  } catch (error) {
    console.error('Admin status check error:', error);
    return false;
  }
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}