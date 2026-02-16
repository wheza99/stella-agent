// LinkedIn Search Results API Endpoint
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { LinkedInSearchService } from '@/lib/linkedin/search-service';
import { z } from 'zod';

// Query parameters schema
const resultsQuerySchema = z.object({
  searchId: z.string().uuid('Invalid search ID'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export async function GET(request: Request) {
  console.log('[API] GET /api/linkedin/results');

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
    const validated = resultsQuerySchema.safeParse({
      searchId: searchParams.get('searchId'),
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 25,
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

    // 3. Get search results
    const searchService = new LinkedInSearchService();
    const { search, profiles } = await searchService.getResults(
      validated.data.searchId,
      user.id
    );

    // 4. Apply pagination
    const offset = (validated.data.page - 1) * validated.data.limit;
    const paginatedProfiles = profiles.slice(offset, offset + validated.data.limit);

    // 5. Return response
    return NextResponse.json({
      status: 'success',
      data: {
        searchId: validated.data.searchId,
        query: (search as any)?.query || '',
        status: (search as any)?.status || 'unknown',
        results: paginatedProfiles,
        meta: {
          totalElements: profiles.length,
          totalPages: Math.ceil(profiles.length / validated.data.limit),
          pageNumber: validated.data.page,
          pageSize: validated.data.limit,
        },
      },
    });

  } catch (error) {
    console.error('[API] Results error:', error);

    if (error instanceof Error && error.message === 'Search not found') {
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'NOT_FOUND', message: 'Search not found' } 
        },
        { status: 404 }
      );
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
