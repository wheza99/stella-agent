// Transform Apify results to app model
import { ApifyProfileResult } from './apify-client';
import { LinkedInProfile, CurrentPosition } from '@/type/interface/linkedin';

/**
 * Map a single Apify profile result to our LinkedInProfile model
 */
export function mapApifyResultToProfile(
  result: ApifyProfileResult,
  searchId: string
): Omit<LinkedInProfile, 'id'> {
  // Map current positions
  const positions: CurrentPosition[] = result.currentPositions?.map((pos) => ({
    title: pos.title || '',
    company_name: pos.companyName || '',
    tenure_months: pos.tenureAtPosition?.numMonths ?? 
      (pos.tenureAtPosition?.numYears ? pos.tenureAtPosition.numYears * 12 : null),
    started_on: pos.startedOn ?? null,
    company_id: pos.companyId ?? null,
    company_linkedin_url: pos.companyLinkedinUrl ?? null,
  })) ?? [];

  return {
    search_id: searchId,
    linkedin_id: result.id,
    linkedin_url: result.linkedinUrl,
    first_name: result.firstName || '',
    last_name: result.lastName || '',
    summary: result.summary ?? null,
    picture_url: result.pictureUrl ?? null,
    location: result.location?.linkedinText ?? null,
    current_positions: positions,
    open_profile: result.openProfile ?? false,
    premium: result.premium ?? false,
    raw_data: result as unknown as Record<string, unknown>,
    created_at: new Date().toISOString(),
  };
}

/**
 * Map multiple Apify results to profiles
 */
export function mapApifyResultsToProfiles(
  results: ApifyProfileResult[],
  searchId: string
): Omit<LinkedInProfile, 'id'>[] {
  return results.map((result) => mapApifyResultToProfile(result, searchId));
}

/**
 * Extract pagination info from Apify results
 */
export function extractPagination(results: ApifyProfileResult[]): {
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
} | null {
  if (results.length === 0) {
    return {
      totalElements: 0,
      totalPages: 0,
      pageNumber: 1,
      pageSize: 25,
    };
  }

  const meta = results[0]?._meta?.pagination;
  
  if (!meta) {
    // If no pagination meta, return based on actual results
    return {
      totalElements: results.length,
      totalPages: 1,
      pageNumber: 1,
      pageSize: results.length,
    };
  }

  return meta;
}

/**
 * Get top companies from profiles
 */
export function getTopCompanies(profiles: LinkedInProfile[], limit = 5): string[] {
  const companies = profiles
    .flatMap((p) => p.current_positions?.map((pos) => pos.company_name))
    .filter(Boolean) as string[];

  const counts = companies.reduce<Record<string, number>>((acc, company) => {
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([company]) => company);
}

/**
 * Get unique locations from profiles
 */
export function getUniqueLocations(profiles: LinkedInProfile[], limit = 5): string[] {
  const locations = profiles
    .map((p) => p.location)
    .filter(Boolean) as string[];

  return [...new Set(locations)].slice(0, limit);
}

/**
 * Format profile for LLM consumption (simplified view)
 */
export function formatProfilesForLLM(profiles: LinkedInProfile[], maxProfiles = 10) {
  return profiles.slice(0, maxProfiles).map((p) => ({
    name: `${p.first_name} ${p.last_name}`,
    title: p.current_positions?.[0]?.title || null,
    company: p.current_positions?.[0]?.company_name || null,
    location: p.location,
    summary: p.summary?.slice(0, 200),
    linkedin_url: p.linkedin_url,
    premium: p.premium,
    open_profile: p.open_profile,
  }));
}
