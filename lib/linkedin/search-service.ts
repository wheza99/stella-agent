// LinkedIn Search Service
import { createClient } from '@/lib/supabase/server';
import { getApifyClient } from './apify-client';
import { mapApifyResultsToProfiles, extractPagination, getTopCompanies, getUniqueLocations, formatProfilesForLLM } from './result-mapper';
import { LinkedInProfile, LinkedInSearchResult } from '@/type/interface/linkedin';

export interface SearchParams {
  searchQuery: string;
  currentJobTitles?: string[];
  locations?: string[];
  maxItems?: number;
  projectId: string;
  userId: string;
}

export interface SearchResult {
  searchId: string;
  status: 'completed' | 'running' | 'failed';
  results: LinkedInProfile[];
  meta?: {
    totalElements: number;
    totalPages: number;
    pageNumber: number;
  };
}

export class LinkedInSearchService {
  async executeSearch(params: SearchParams): Promise<SearchResult> {
    const supabase = await createClient();
    const apifyClient = getApifyClient();

    // 1. Create search record
    const { data: search, error: searchError } = await supabase
      .from('linkedin_searches')
      .insert({
        project_id: params.projectId,
        user_id: params.userId,
        query: params.searchQuery,
        search_params: {
          searchQuery: params.searchQuery,
          currentJobTitles: params.currentJobTitles,
          locations: params.locations,
          maxItems: params.maxItems || 25,
        },
        status: 'pending',
      })
      .select()
      .single();

    if (searchError || !search) {
      console.error('[SearchService] Failed to create search:', searchError);
      throw new Error(`Failed to create search: ${searchError?.message}`);
    }

    console.log('[SearchService] Created search record:', search.id);

    try {
      // 2. Update status to running
      await supabase
        .from('linkedin_searches')
        .update({ status: 'running' })
        .eq('id', search.id);

      // 3. Run Apify search
      console.log('[SearchService] Starting Apify search...');
      const { runId, datasetId } = await apifyClient.runSearch({
        searchQuery: params.searchQuery,
        currentJobTitles: params.currentJobTitles,
        locations: params.locations,
        maxItems: params.maxItems || 25,
      });

      // 4. Update with Apify run ID
      await supabase
        .from('linkedin_searches')
        .update({ apify_run_id: runId })
        .eq('id', search.id);

      // 5. Get results from Apify
      const apifyResults = await apifyClient.getResults(datasetId);
      
      // 6. Transform and store profiles
      const profiles = mapApifyResultsToProfiles(apifyResults, search.id);
      
      if (profiles.length > 0) {
        const { error: insertError } = await supabase
          .from('linkedin_profiles')
          .insert(profiles);

        if (insertError) {
          console.error('[SearchService] Failed to insert profiles:', insertError);
          // Continue anyway, we can still return the results
        } else {
          console.log('[SearchService] Inserted', profiles.length, 'profiles');
        }
      }

      // 7. Update search as completed
      const pagination = extractPagination(apifyResults);
      await supabase
        .from('linkedin_searches')
        .update({
          status: 'completed',
          total_results: pagination?.totalElements ?? profiles.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', search.id);

      // 8. Fetch stored profiles
      const { data: storedProfiles } = await supabase
        .from('linkedin_profiles')
        .select('*')
        .eq('search_id', search.id)
        .order('created_at', { ascending: false });

      console.log('[SearchService] Search completed successfully');

      return {
        searchId: search.id,
        status: 'completed',
        results: (storedProfiles || []) as LinkedInProfile[],
        meta: pagination || undefined,
      };

    } catch (error) {
      // Update search as failed
      console.error('[SearchService] Search failed:', error);
      
      await supabase
        .from('linkedin_searches')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', search.id);

      throw error;
    }
  }

  async getResults(searchId: string, userId: string): Promise<{
    search: unknown;
    profiles: LinkedInProfile[];
  }> {
    const supabase = await createClient();

    // Verify ownership
    const { data: search, error } = await supabase
      .from('linkedin_searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', userId)
      .single();

    if (error || !search) {
      throw new Error('Search not found');
    }

    // Get profiles
    const { data: profiles } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('search_id', searchId)
      .order('created_at', { ascending: false });

    return {
      search,
      profiles: (profiles || []) as LinkedInProfile[],
    };
  }

  async getSearches(projectId: string, userId: string, page = 1, limit = 10): Promise<{
    searches: unknown[];
    meta: { total: number; page: number; limit: number };
  }> {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
      .from('linkedin_searches')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('user_id', userId);

    // Get searches
    const { data: searches } = await supabase
      .from('linkedin_searches')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return {
      searches: searches || [],
      meta: {
        total: count || 0,
        page,
        limit,
      },
    };
  }

  /**
   * Format search result for LLM tool response
   */
  formatResultForLLM(
    searchId: string,
    profiles: LinkedInProfile[]
  ): LinkedInSearchResult {
    const formattedProfiles = formatProfilesForLLM(profiles, 5).map(p => ({
      name: p.name,
      title: p.title || '',
      company: p.company || '',
      location: p.location || '',
      linkedinUrl: p.linkedin_url,
    }));
    
    return {
      searchId,
      totalFound: profiles.length,
      profiles: formattedProfiles,
      topCompanies: getTopCompanies(profiles),
      locations: getUniqueLocations(profiles),
    };
  }
}
