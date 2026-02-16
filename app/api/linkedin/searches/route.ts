// LinkedIn Searches List API Endpoint
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { LinkedInSearchService } from '@/lib/linkedin/search-service';
import { z } from 'zod';

// Query parameters schema
const searchesQuerySchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: Request) {
  console.log('[API] GET /api/linkedin/searches');

  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } 
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validated = searchesQuerySchema.safeParse({
      projectId: searchParams.get('projectId'),
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
    });

    if (!validated.success) {
      return NextResponse.json(
        { 
          status: 'error', 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: validated.error.issues[0]?.message || 'Invalid parameters' 
          } 
        },
        { status: 400 }
      );
    }

    // 3. Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', validated.data.projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'NOT_FOUND', message: 'Project not found' } 
        },
        { status: 404 }
      );
    }

    // 4. Get searches
    const searchService = new LinkedInSearchService();
    const { searches, meta } = await searchService.getSearches(
      validated.data.projectId,
      user.id,
      validated.data.page,
      validated.data.limit
    );

    // 5. Return response
    return NextResponse.json({
      status: 'success',
      data: {
        searches,
        meta,
      },
    });

  } catch (error) {
    console.error('[API] Searches error:', error);
    
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
