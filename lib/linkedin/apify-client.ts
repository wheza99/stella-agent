// Apify Client for LinkedIn Profile Search
import { ApifyClient } from 'apify-client';

// LinkedIn Profile Search Actor ID
// Using harvestapi/linkedin-profile-search actor
const APIFY_ACTOR_ID = 'harvestapi/linkedin-profile-search';

export interface ApifySearchInput {
  searchQuery: string;
  currentJobTitles?: string[];
  locations?: string[];
  maxItems?: number;
  profileScraperMode?: 'Short' | 'Full';
  autoQuerySegmentation?: boolean;
  recentlyChangedJobs?: boolean;
}

export interface ApifyProfileResult {
  id: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  summary?: string;
  openProfile?: boolean;
  premium?: boolean;
  currentPositions?: Array<{
    title: string;
    companyName: string;
    tenureAtPosition?: { numMonths?: number; numYears?: number };
    startedOn?: { month: number; year: number };
    companyId?: string;
    companyLinkedinUrl?: string;
    description?: string;
    current?: boolean;
  }>;
  location?: { linkedinText: string };
  pictureUrl?: string;
  _meta?: {
    pagination: {
      totalElements: number;
      totalPages: number;
      pageNumber: number;
      pageSize: number;
    };
  };
}

class LinkedInApifyClient {
  private client: ApifyClient;

  constructor(apiToken: string) {
    this.client = new ApifyClient({ token: apiToken });
  }

  /**
   * Run LinkedIn Profile Search Actor
   * This will wait for the actor to complete and return the dataset ID
   */
  async runSearch(input: ApifySearchInput): Promise<{ runId: string; datasetId: string }> {
    const runInput = {
      searchQuery: input.searchQuery,
      currentJobTitles: input.currentJobTitles || [],
      locations: input.locations || [],
      maxItems: input.maxItems || 25,
      profileScraperMode: input.profileScraperMode || 'Short',
      autoQuerySegmentation: input.autoQuerySegmentation ?? false,
      recentlyChangedJobs: input.recentlyChangedJobs ?? false,
    };

    console.log('[Apify] Running search with input:', JSON.stringify(runInput, null, 2));

    const run = await this.client.actor(APIFY_ACTOR_ID).call(runInput, {
      waitSecs: 120, // Wait up to 2 minutes for the actor to complete
    });

    console.log('[Apify] Run completed:', {
      runId: run.id,
      datasetId: run.defaultDatasetId,
      status: run.status,
    });

    return {
      runId: run.id,
      datasetId: run.defaultDatasetId,
    };
  }

  /**
   * Get results from Apify dataset
   */
  async getResults(datasetId: string): Promise<ApifyProfileResult[]> {
    console.log('[Apify] Fetching results from dataset:', datasetId);
    
    const { items } = await this.client.dataset(datasetId).listItems();
    
    console.log('[Apify] Fetched', items.length, 'profiles');
    
    return items as unknown as ApifyProfileResult[];
  }

  /**
   * Get run status
   */
  async getRunStatus(runId: string): Promise<{
    status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED-OUT' | 'ABORTED';
    isFinished: boolean;
  }> {
    const run = this.client.run(runId);
    const runDetails = await run.get();
    
    const status = runDetails?.status as any;
    const isFinished = ['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'].includes(status);
    
    return {
      status,
      isFinished,
    };
  }
}

// Singleton instance
let apifyClientInstance: LinkedInApifyClient | null = null;

export function getApifyClient(): LinkedInApifyClient {
  if (!apifyClientInstance) {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
      throw new Error('APIFY_API_TOKEN environment variable is not set');
    }
    apifyClientInstance = new LinkedInApifyClient(apiToken);
  }
  return apifyClientInstance;
}

export { LinkedInApifyClient };
