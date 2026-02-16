// LinkedIn Profile Search Types

export interface LinkedInSearch {
  id: string;
  project_id: string;
  user_id: string;
  query: string;
  search_params: SearchParams;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_results: number;
  apify_run_id: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface SearchParams {
  searchQuery: string;
  currentJobTitles?: string[];
  locations?: string[];
  maxItems?: number;
}

export interface LinkedInProfile {
  id: string;
  search_id: string;
  linkedin_id: string;
  linkedin_url: string;
  first_name: string;
  last_name: string;
  summary: string | null;
  picture_url: string | null;
  location: string | null;
  current_positions: CurrentPosition[];
  open_profile: boolean;
  premium: boolean;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface CurrentPosition {
  title: string;
  company_name: string;
  tenure_months: number | null;
  started_on: { month: number; year: number } | null;
  company_id: string | null;
  company_linkedin_url: string | null;
}

// API Request/Response Types
export interface LinkedInSearchRequest {
  searchQuery: string;
  currentJobTitles?: string[];
  locations?: string[];
  maxItems?: number;
  projectId: string;
}

export interface LinkedInSearchResponse {
  status: 'success' | 'error';
  data?: {
    searchId: string;
    status: 'completed' | 'running' | 'failed';
    results: LinkedInProfile[];
    meta?: {
      totalElements: number;
      totalPages: number;
      pageNumber: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface LinkedInResultsResponse {
  status: 'success' | 'error';
  data?: {
    searchId: string;
    query: string;
    status: string;
    results: LinkedInProfile[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface LinkedInSearchesResponse {
  status: 'success' | 'error';
  data?: {
    searches: LinkedInSearch[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

// Tool Call Types
export interface ToolCallResponse {
  name: string;
  success: boolean;
  data?: LinkedInSearchResult;
  error?: string;
}

export interface LinkedInSearchResult {
  searchId: string;
  totalFound: number;
  profiles: Array<{
    name: string;
    title: string;
    company: string;
    location: string;
    linkedinUrl: string;
  }>;
  topCompanies: string[];
  locations: string[];
}
