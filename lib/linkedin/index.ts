// LinkedIn module exports
export { getApifyClient, LinkedInApifyClient } from './apify-client';
export type { ApifySearchInput, ApifyProfileResult } from './apify-client';

export { 
  mapApifyResultToProfile,
  mapApifyResultsToProfiles,
  extractPagination,
  getTopCompanies,
  getUniqueLocations,
  formatProfilesForLLM,
} from './result-mapper';

export { generateCSV, generateCSVFilename } from './csv-exporter';

export { LinkedInSearchService } from './search-service';
export type { SearchParams, SearchResult } from './search-service';
