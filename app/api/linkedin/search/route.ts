// LinkedIn Profile Search API Endpoint
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { LinkedInSearchService } from '@/lib/linkedin/search-service';
import { z } from 'zod';

// Request validation schema
const searchRequestSchema = z.object({
  searchQuery: z.string().min(1, 'Search query is required').max(500),
  currentJobTitles: z.array(z.string().max(200)).max(20).optional(),
  locations: z.array(z.string().max(200)).max(20).optional(),
  maxItems: z.number().int().min(1).max(100).default(25),
  projectId: z.string().uuid('Invalid project ID'),
});

export async function POST(request: Request) {
  console.log('[API] POST /api/linkedin/search');

  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('[API] Unauthorized:', authError);
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } 
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } 
        },
        { status: 400 }
      );
    }

    const validated = searchRequestSchema.safeParse(body);
    
    if (!validated.success) {
      console.log('[API] Validation error:', validated.error.flatten());
      return NextResponse.json(
        { 
          status: 'error', 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: validated.error.issues[0]?.message || 'Validation failed',
            details: validated.error.flatten().fieldErrors,
          } 
        },
        { status: 400 }
      );
    }

    // 3. Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, org_id')
      .eq('id', validated.data.projectId)
      .single();

    if (projectError || !project) {
      console.log('[API] Project not found:', projectError);
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'NOT_FOUND', message: 'Project not found' } 
        },
        { status: 404 }
      );
    }

    // 4. Execute search
    console.log('[API] Executing search for user:', user.id);
    const searchService = new LinkedInSearchService();
    
    const result = await searchService.executeSearch({
      searchQuery: validated.data.searchQuery,
      currentJobTitles: validated.data.currentJobTitles,
      locations: validated.data.locations,
      maxItems: validated.data.maxItems,
      projectId: validated.data.projectId,
      userId: user.id,
    });

    // 5. Return success response
    console.log('[API] Search completed:', result.searchId);
    
    return NextResponse.json({
      status: 'success',
      data: {
        searchId: result.searchId,
        status: result.status,
        results: result.results,
        meta: result.meta,
      },
    });

  } catch (error) {
    console.error('[API] Search error:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('APIFY_API_TOKEN')) {
        return NextResponse.json(
          { 
            status: 'error', 
            error: { code: 'CONFIG_ERROR', message: 'Apify API not configured' } 
          },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { 
            status: 'error', 
            error: { code: 'RATE_LIMIT', message: 'Rate limit exceeded. Please try again later.' } 
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { 
        status: 'error', 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : 'An unexpected error occurred' 
        } 
      },
      { status: 500 }
    );
  }
}
