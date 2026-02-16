// LinkedIn Export CSV API Endpoint
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateCSV, generateCSVFilename } from '@/lib/linkedin/csv-exporter';
import { z } from 'zod';

// Query parameters schema
const exportQuerySchema = z.object({
  searchId: z.string().uuid('Invalid search ID'),
});

export async function GET(request: Request) {
  console.log('[API] GET /api/linkedin/export');

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
    const validated = exportQuerySchema.safeParse({
      searchId: searchParams.get('searchId'),
    });

    if (!validated.success) {
      return NextResponse.json(
        { 
          status: 'error', 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'searchId is required' 
          } 
        },
        { status: 400 }
      );
    }

    // 3. Verify ownership and get search
    const { data: search, error: searchError } = await supabase
      .from('linkedin_searches')
      .select('id, user_id, query')
      .eq('id', validated.data.searchId)
      .eq('user_id', user.id)
      .single();

    if (searchError || !search) {
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'NOT_FOUND', message: 'Search not found' } 
        },
        { status: 404 }
      );
    }

    // 4. Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('search_id', validated.data.searchId)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('[API] Error fetching profiles:', profilesError);
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'DB_ERROR', message: 'Failed to fetch profiles' } 
        },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { 
          status: 'error', 
          error: { code: 'NO_DATA', message: 'No profiles found for this search' } 
        },
        { status: 404 }
      );
    }

    // 5. Generate CSV
    const csv = generateCSV(profiles as any);
    const filename = generateCSVFilename(validated.data.searchId);

    console.log('[API] Exporting', profiles.length, 'profiles to CSV');

    // 6. Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(csv).toString(),
      },
    });

  } catch (error) {
    console.error('[API] Export error:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : 'Export failed' 
        } 
      },
      { status: 500 }
    );
  }
}
