/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/leads - Fetch all leads with filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'date';

    console.log('📥 GET /api/leads', { search, status, sortBy });

    // Build where clause for filtering
    const whereClause: any = {};

    // Search filter
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { headline: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status !== 'all') {
      if (status === 'new') {
        whereClause.contacted = false;
        whereClause.converted = false;
      } else if (status === 'contacted') {
        whereClause.contacted = true;
        whereClause.converted = false;
      } else if (status === 'converted') {
        whereClause.converted = true;
      }
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'score') {
      orderBy = { overallScore: 'desc' };
    } else if (sortBy === 'name') {
      orderBy = { email: 'asc' };
    }

    // ✅ FIXED: Query the correct table (Lead, not ConsultationOrder)
    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy,
      include: {
        experiences: true,
        linkEducation: true,
        sales: true,
      },
    });

    console.log(`✅ Found ${leads.length} leads`);

    // Calculate stats
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => !lead.contacted && !lead.converted).length;
    const contactedLeads = leads.filter(lead => lead.contacted).length;
    const avgScore = totalLeads > 0 
      ? Math.round(leads.reduce((sum, lead) => sum + lead.overallScore, 0) / totalLeads)
      : 0;
    const leadsWithPhone = leads.filter(lead => lead.phone).length;
    const marketingConsentCount = leads.filter(lead => lead.marketingConsent).length;

    // Map leads to include status
    const leadsWithStatus = leads.map(lead => {
      let leadStatus = 'new';
      if (lead.converted) {
        leadStatus = 'converted';
      } else if (lead.contacted) {
        leadStatus = 'contacted';
      }

      return {
        id: lead.id,
        email: lead.email,
        phone: lead.phone,
        name: lead.email.split('@')[0], // Use email prefix as name if no name field
        headline: lead.headline,
        location: lead.location,
        industry: lead.industry,
        profileUrl: lead.profileUrl,
        overallScore: lead.overallScore,
        headlineScore: lead.headlineScore,
        summaryScore: lead.summaryScore,
        experienceScore: lead.experienceScore,
        skillsScore: lead.skillsScore,
        skills: lead.skills,
        marketingConsent: lead.marketingConsent,
        contacted: lead.contacted,
        createdAt: lead.createdAt.toISOString(),
        status: leadStatus,
  
  
      };
    });

    return NextResponse.json({
      leads: leadsWithStatus,
      stats: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        avgScore,
        withPhone: leadsWithPhone,
        marketingConsent: marketingConsentCount,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    
    // Better error details for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : '';
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch leads',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/leads - Update a lead
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, updates } = body;

    console.log('📝 PATCH /api/leads', { leadId, updates });

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Update the lead
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Lead updated:', updatedLead.id);

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });

  } catch (error) {
    console.error('❌ Error updating lead:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to update lead',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('➕ POST /api/leads', { email: body.email });
    
    const newLead = await prisma.lead.create({
      data: {
        email: body.email,
        phone: body.phone,
        headline: body.headline,
        profileUrl: body.profileUrl,
        location: body.location,
        industry: body.industry,
        summary: body.summary,
        skills: body.skills || [],
        overallScore: body.overallScore || 0,
        headlineScore: body.headlineScore || 0,
        summaryScore: body.summaryScore || 0,
        experienceScore: body.experienceScore || 0,
        skillsScore: body.skillsScore || 0,
        marketingConsent: body.marketingConsent || false,
        contacted: false,
        converted: false,
      },
    });

    console.log('✅ Lead created:', newLead.id);

    return NextResponse.json({
      success: true,
      lead: newLead,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating lead:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for unique constraint violation
    if (errorMessage.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A lead with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create lead',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}