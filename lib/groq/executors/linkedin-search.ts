// LinkedIn Search Tool Executor
import { ToolExecutor, ExecutionContext, ToolResult } from "./types";
import { LinkedInSearchToolArgs } from "@/lib/groq/tools/linkedin-search";
import { LinkedInSearchService } from "@/lib/linkedin/search-service";
import { LinkedInProfile } from "@/type/interface/linkedin";

export class LinkedInSearchExecutor implements ToolExecutor<LinkedInSearchToolArgs> {
  name = "search_linkedin_profiles";

  async execute(
    args: LinkedInSearchToolArgs,
    context: ExecutionContext
  ): Promise<ToolResult> {
    console.log("[LinkedInSearchExecutor] Executing with args:", args);
    console.log("[LinkedInSearchExecutor] Context:", context);

    try {
      const searchService = new LinkedInSearchService();

      // Execute the search
      const result = await searchService.executeSearch({
        searchQuery: args.searchQuery,
        currentJobTitles: args.currentJobTitles,
        locations: args.locations,
        maxItems: args.maxItems || 25,
        projectId: context.projectId,
        userId: context.userId,
      });

      // Format result for LLM consumption
      const summaryData = searchService.formatResultForLLM(
        result.searchId,
        result.results
      );

      console.log("[LinkedInSearchExecutor] Search completed:", {
        searchId: result.searchId,
        totalFound: result.results.length,
      });

      return {
        success: true,
        data: summaryData,
      };
    } catch (error) {
      console.error("[LinkedInSearchExecutor] Error:", error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      };
    }
  }
}

// Registry of all tool executors
export const toolExecutors: Record<string, ToolExecutor> = {
  search_linkedin_profiles: new LinkedInSearchExecutor(),
};
