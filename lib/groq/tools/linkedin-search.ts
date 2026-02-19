// LinkedIn Search Tool Definition for Groq Tool Calling

export const linkedinSearchTool = {
  type: "function" as const,
  function: {
    name: "search_linkedin_profiles",
    description: `Search for LinkedIn profiles based on job titles, locations, and keywords. 
Use this tool when the user wants to find professionals, candidates, leads, or contacts on LinkedIn.
The tool will return a list of profiles with their current positions, locations, and basic information.

Examples of when to use this tool:
- "Find AI engineers in Dubai"
- "Cari software developer di Indonesia"
- "Search for marketing managers in Singapore"
- "I need to find potential hires for data scientist role"
- "Looking for sales directors in the US"

This tool is for LEAD GENERATION and RECRUITMENT purposes.`,
    parameters: {
      type: "object",
      properties: {
        searchQuery: {
          type: "string",
          description: `The main search query or keyword to find profiles. 
This is the primary search term that describes what kind of professionals to find.
Examples: "AI engineer", "software developer", "marketing manager", "data scientist"`,
        },
        currentJobTitles: {
          type: "array",
          items: { type: "string" },
          description: `Optional: Specific job titles to filter by. 
Include variations and related titles.
Examples: ["AI Engineer", "ML Engineer", "Machine Learning Engineer"] for AI roles
Examples: ["Software Engineer", "Software Developer", "Full Stack Developer"] for dev roles`,
        },
        locations: {
          type: "array",
          items: { type: "string" },
          description: `Optional: Locations to search in. Can be cities, regions, or countries.
Examples: ["Dubai"], ["Singapore"], ["Indonesia"], ["New York", "San Francisco"]`,
        },
        maxItems: {
          type: "integer",
          description: "Maximum number of profiles to return. Default is 25. Maximum is 100.",
          default: 10,
        },
      },
      required: ["searchQuery"],
    },
  },
};

export const availableTools = [linkedinSearchTool];

export type ToolName = "search_linkedin_profiles";

export interface LinkedInSearchToolArgs {
  searchQuery: string;
  currentJobTitles?: string[];
  locations?: string[];
  maxItems?: number;
}
