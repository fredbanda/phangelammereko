'use server';

import  prisma  from '@/utils/prisma';
import { Consultant } from '@prisma/client';

interface AddConsultantResponse {
  success: boolean;
  error?: string;
  consultant?: Consultant;
}

export async function addConsultant(formData: {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  specializations?: string[];
  skills?: string[];
  experience?: number;
  hourlyRate?: number;
  maxOrders?: number;
  isActive?: boolean;
}): Promise<AddConsultantResponse> {
  try {
    // Validate required fields
    if (!formData.name || !formData.email) {
      return { success: false, error: 'Name and email are required' };
    }

    // Check if email is already in use
    const existingConsultant = await prisma.consultant.findUnique({
      where: { email: formData.email },
    });

    if (existingConsultant) {
      return { success: false, error: 'Email is already in use' };
    }

    const consultant = await prisma.consultant.create({
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        title: formData.title,
        bio: formData.bio,
        specializations: formData.specializations ? { set: formData.specializations } : undefined,
        skills: formData.skills ? { set: formData.skills } : undefined,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate,
        maxOrders: formData.maxOrders || 5,
        isActive: formData.isActive ?? true,
      },
    });

    return { success: true, consultant };
  } catch (error) {
    console.error('Error adding consultant:', error);
    return { success: false, error: 'Failed to add consultant' };
  }
}

export async function getConsultants(): Promise<{
  success: boolean;
  consultants?: Consultant[];
  error?: string;
}> {
  try {
    const consultants = await prisma.consultant.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, consultants };
  } catch (error) {
    console.error('Error fetching consultants:', error);
    return { success: false, error: 'Failed to fetch consultants' };
  }
}