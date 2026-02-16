# Engineering Specification: Tool Calling & AI

## Informasi Dokumen

| Field         | Value                                              |
| ------------- | -------------------------------------------------- |
| Nama Feature  | LinkedIn Profile Search - Tool Calling & AI        |
| Versi Spec    | 1.0                                                |
| Status        | Draft                                              |
| Author        | Pi                                                 |
| Reviewer      | -                                                  |
| Tanggal       | 16 Februari 2026                                   |
| PRD Reference | [prd-linkedin-search.md](./prd-linkedin-search.md) |
| Related Specs | [spec-1-database-api.md](./spec-1-database-api.md) |

---

## 1. Overview

### 1.1 Summary

Spec ini mencakup implementasi Groq Tool Calling untuk mengenali intent pencarian LinkedIn dari natural language query dan mengekstrak parameter pencarian secara otomatis. Juga termasuk AI summary untuk hasil pencarian.

### 1.2 Goals

- Mendefinisikan tool schema untuk `search_linkedin_profiles`
- Mengimplementasikan natural language parsing ke parameter pencarian
- Mengintegrasikan tool calling dengan existing chat flow
- Generate AI summary dari hasil pencarian

### 1.3 Non-Goals

- API endpoints (covered in Spec 1)
- Frontend components (covered in Spec 3)
- Custom LLM fine-tuning
- Multi-turn conversation for refinement (future)

---

## 2. System Architecture

### 2.1 High-Level Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Chat Flow                                      │
│                                                                          │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────────────┐  │
│  │   User      │    │    Groq API      │    │   Tool Executor         │  │
│  │   Input     │───▶│   (with tools)   │───▶│                         │  │
│  │             │    │                  │    │  ┌───────────────────┐  │  │
│  │ "Cari AI    │    │  Returns:        │    │  │ search_linkedin_  │  │  │
│  │  engineer   │    │  - Text response │    │  │ profiles()        │  │  │
│  │  di Dubai"  │    │  - Tool calls    │    │  └───────────────────┘  │  │
│  └─────────────┘    └─────────────────┘    │           │             │  │
│                                              │           ▼             │  │
│                                              │  ┌───────────────────┐  │  │
│                                              │  │ Call Apify API    │  │  │
│                                              │  │ Store Results     │  │  │
│                                              │  └───────────────────┘  │  │
│                                              │           │             │  │
│                                              │           ▼             │  │
│                                              │  ┌───────────────────┐  │  │
│                                              │  │ Groq API (Round 2)│  │  │
│                                              │  │ Generate Summary  │  │  │
│                                              │  └───────────────────┘  │  │
│                                              └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Components

| Component         | Location                                | Responsibility              |
| ----------------- | --------------------------------------- | --------------------------- |
| Tool Definitions  | `lib/groq/tools/linkedin-search.ts`     | Define tool schema for Groq |
| Tool Executor     | `lib/groq/executors/linkedin-search.ts` | Execute tool calls          |
| Chat Handler      | `app/api/chat/groq/route.ts` (modified) | Handle tool calling flow    |
| Summary Generator | `lib/groq/summarizer.ts`                | Generate AI summaries       |

### 2.3 Tool Calling Flow

```
1. User sends message: "Cari AI engineer di Dubai dengan pengalaman 5 tahun"
2. Groq API called with tools defined
3. Groq returns tool_call: search_linkedin_profiles({ searchQuery: "AI engineer", locations: ["Dubai"] })
4. Execute tool: Call Apify, store results
5. Send tool result back to Groq
6. Groq generates summary response
7. Return final response to user
```

---

## 3. Tool Definition

### 3.1 Tool Schema

```typescript
// lib/groq/tools/linkedin-search.ts

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
          description:
            "Maximum number of profiles to return. Default is 25. Maximum is 100.",
          default: 25,
          minimum: 1,
          maximum: 100,
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
```

### 3.2 System Prompt

```typescript
// lib/groq/prompts/system.ts

export const CHAT_SYSTEM_PROMPT = `You are Stella, an AI assistant specialized in helping users with lead generation and recruitment through LinkedIn profile search.

## Your Capabilities
- Search for LinkedIn profiles based on job titles, locations, and keywords
- Provide summaries and insights about search results
- Help users find the right professionals for their needs

## When to Use Tools
Use the \`search_linkedin_profiles\` tool when the user wants to:
- Find professionals with specific job titles
- Search for people in specific locations
- Discover potential leads, candidates, or contacts

## Tool Usage Guidelines
1. Extract search parameters from natural language
2. Infer job title variations (e.g., "AI engineer" might include "ML Engineer", "Data Scientist")
3. Handle both English and Indonesian queries
4. Be helpful in refining searches if the user's request is vague

## Response Style
- Be concise but informative
- When presenting search results, provide a brief summary first
- Highlight key insights (top companies, common skills, experience levels)
- Offer to help refine searches or export results

## Important Notes
- Always acknowledge when a search is in progress
- If results are limited, suggest broadening the search criteria
- Be transparent about what the search found vs. what was requested

Current date: ${new Date().toISOString().split("T")[0]}
`;
```

---

## 4. Tool Executor

### 4.1 Executor Interface

```typescript
// lib/groq/executors/types.ts

import { ToolName } from "@/lib/groq/tools/linkedin-search";

export interface ToolExecutor<T = unknown> {
  name: ToolName;
  execute(args: T, context: ExecutionContext): Promise<ToolResult>;
}

export interface ExecutionContext {
  userId: string;
  projectId: string;
  orgId?: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export type ToolCallResult = {
  toolCallId: string;
  name: string;
  result: ToolResult;
};
```

### 4.2 LinkedIn Search Executor

```typescript
// lib/groq/executors/linkedin-search.ts

import { ToolExecutor, ExecutionContext, ToolResult } from "./types";
import { LinkedInSearchToolArgs } from "@/lib/groq/tools/linkedin-search";
import { LinkedInSearchService } from "@/lib/linkedin/search-service";
import { createClient } from "@/lib/supabase/server";

export class LinkedInSearchExecutor
  implements ToolExecutor<LinkedInSearchToolArgs>
{
  name = "search_linkedin_profiles" as const;

  async execute(
    args: LinkedInSearchToolArgs,
    context: ExecutionContext
  ): Promise<ToolResult> {
    try {
      const supabase = await createClient();
      const searchService = new LinkedInSearchService(supabase);

      const result = await searchService.executeSearch({
        searchQuery: args.searchQuery,
        currentJobTitles: args.currentJobTitles,
        locations: args.locations,
        maxItems: args.maxItems || 25,
        projectId: context.projectId,
        userId: context.userId,
      });

      // Format result for LLM consumption
      const summaryData = {
        searchId: result.searchId,
        totalFound: result.results.length,
        profiles: result.results.slice(0, 5).map((p: any) => ({
          name: `${p.firstName} ${p.lastName}`,
          title: p.currentPositions?.[0]?.title,
          company: p.currentPositions?.[0]?.companyName,
          location: p.location,
          linkedinUrl: p.linkedinUrl,
        })),
        topCompanies: this.getTopCompanies(result.results),
        locations: this.getUniqueLocations(result.results),
      };

      return {
        success: true,
        data: summaryData,
      };
    } catch (error) {
      console.error("LinkedIn search executor error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      };
    }
  }

  private getTopCompanies(profiles: any[]): string[] {
    const companies = profiles
      .map((p) => p.currentPositions?.[0]?.companyName)
      .filter(Boolean);

    const counts = companies.reduce((acc, company) => {
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company]) => company);
  }

  private getUniqueLocations(profiles: any[]): string[] {
    const locations = profiles.map((p) => p.location).filter(Boolean);

    return [...new Set(locations)].slice(0, 5);
  }
}

// Registry of all executors
export const toolExecutors: Record<string, ToolExecutor> = {
  search_linkedin_profiles: new LinkedInSearchExecutor(),
};
```

---

## 5. Chat Handler Integration

### 5.1 Modified Chat Route

```typescript
// app/api/chat/groq/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { availableTools } from "@/lib/groq/tools/linkedin-search";
import { toolExecutors } from "@/lib/groq/executors/linkedin-search";
import { CHAT_SYSTEM_PROMPT } from "@/lib/groq/prompts/system";
import { ExecutionContext, ToolCallResult } from "@/lib/groq/executors/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const MODEL = "llama-3.3-70b-versatile";

export async function POST(request: Request) {
  const { messages, model, org_id, project_id } = await request.json();
  const supabase = await createClient();

  // 1. Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  // 2. Create project if needed
  let project = null;
  if (org_id) {
    const { data: newProject, error: insertError } = await supabase
      .from("projects")
      .insert({
        title: "New Project",
        org_id: org_id,
      })
      .select()
      .single();

    if (!insertError) {
      project = newProject;
    }
  }

  const effectiveProjectId = project?.id || project_id;

  // 3. Build messages with system prompt
  const messagesWithSystem = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      tool_calls: msg.tool_calls,
      tool_call_id: msg.tool_call_id,
    })),
  ];

  // 4. First call to Groq (may return tool calls)
  const firstResponse = await groq.chat.completions.create({
    messages: messagesWithSystem,
    model: model || MODEL,
    tools: availableTools,
    tool_choice: "auto",
    temperature: 0.6,
    max_completion_tokens: 4096,
  });

  const firstMessage = firstResponse.choices[0].message;

  // 5. Check if tool calls are needed
  if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
    const executionContext: ExecutionContext = {
      userId: user.id,
      projectId: effectiveProjectId,
      orgId: org_id,
    };

    // Execute all tool calls
    const toolResults: ToolCallResult[] = [];

    for (const toolCall of firstMessage.tool_calls) {
      const executor = toolExecutors[toolCall.function.name];

      if (executor) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executor.execute(args, executionContext);

        toolResults.push({
          toolCallId: toolCall.id,
          name: toolCall.function.name,
          result,
        });
      }
    }

    // 6. Second call to Groq with tool results
    const secondMessages = [
      ...messagesWithSystem,
      firstMessage,
      ...toolResults.map((tr) => ({
        role: "tool" as const,
        tool_call_id: tr.toolCallId,
        content: JSON.stringify(tr.result),
      })),
    ];

    const secondResponse = await groq.chat.completions.create({
      messages: secondMessages,
      model: model || MODEL,
      temperature: 0.6,
      max_completion_tokens: 4096,
    });

    const finalMessage = secondResponse.choices[0].message;

    // 7. Store messages in database
    await supabase.from("chats").insert([
      {
        role: "user",
        content: messages[messages.length - 1].content,
        project_id: effectiveProjectId,
        created_at: new Date().toISOString(),
      },
      {
        role: "assistant",
        content: finalMessage.content,
        project_id: effectiveProjectId,
        tool_calls: firstMessage.tool_calls?.map((tc) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: tc.function.arguments,
        })),
        created_at: new Date(Date.now() + 1000).toISOString(),
      },
    ]);

    // 8. Return response with tool info
    return NextResponse.json({
      status: "success",
      output: {
        role: finalMessage.role,
        content: finalMessage.content,
      },
      toolCalls: toolResults.map((tr) => ({
        name: tr.name,
        success: tr.result.success,
        data: tr.result.data,
      })),
      project,
    });
  }

  // 9. No tool calls - regular response
  await supabase.from("chats").insert([
    {
      role: "user",
      content: messages[messages.length - 1].content,
      project_id: effectiveProjectId,
      created_at: new Date().toISOString(),
    },
    {
      role: firstMessage.role,
      content: firstMessage.content,
      project_id: effectiveProjectId,
      created_at: new Date(Date.now() + 1000).toISOString(),
    },
  ]);

  return NextResponse.json({
    status: "success",
    output: {
      role: firstMessage.role,
      content: firstMessage.content,
    },
    project,
  });
}
```

### 5.2 Response Types

```typescript
// type/interface/chat-response.ts

export interface ChatResponse {
  status: "success" | "error";
  output: {
    role: "assistant";
    content: string;
  };
  toolCalls?: ToolCallResponse[];
  project?: {
    id: string;
    title: string;
  };
}

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
```

---

## 6. AI Summary Generator

### 6.1 Summary Service

```typescript
// lib/groq/summarizer.ts

import { Groq } from "groq-sdk";
import { LinkedInProfile } from "@/type/interface/linkedin";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const SUMMARY_SYSTEM_PROMPT = `You are an expert at analyzing LinkedIn profile data and providing concise, actionable summaries for sales and recruitment purposes.

When given a list of LinkedIn profiles, provide:
1. A brief overview of the search results
2. Key insights (common companies, skills, experience levels)
3. Notable profiles worth highlighting
4. Recommendations for next steps

Keep the summary concise and scannable. Use bullet points for clarity.`;

export async function generateSearchSummary(
  profiles: LinkedInProfile[],
  searchQuery: string
): Promise<string> {
  const profileSummaries = profiles.slice(0, 10).map((p) => ({
    name: `${p.firstName} ${p.lastName}`,
    title: p.currentPositions?.[0]?.title,
    company: p.currentPositions?.[0]?.companyName,
    location: p.location,
    summary: p.summary?.slice(0, 200),
    premium: p.premium,
    openProfile: p.openProfile,
  }));

  const prompt = `Summarize the following LinkedIn search results for: "${searchQuery}"

Profiles found: ${profiles.length}

Sample profiles:
${JSON.stringify(profileSummaries, null, 2)}

Provide a concise summary with key insights and recommendations.`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    max_completion_tokens: 1000,
  });

  return response.choices[0].message.content || "";
}

export async function suggestSearchRefinement(
  profiles: LinkedInProfile[],
  originalQuery: string
): Promise<string[]> {
  const prompt = `The user searched for "${originalQuery}" and found ${profiles.length} results.

Suggest 3 refinements they could make to:
1. Get more specific results
2. Broaden the search if results are too few
3. Focus on a specific subset

Return only the suggestions as a JSON array of strings.`;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a search expert. Return only valid JSON arrays of strings.",
      },
      { role: "user", content: prompt },
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    max_completion_tokens: 200,
    response_format: { type: "json_object" },
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return parsed.suggestions || [];
  } catch {
    return [];
  }
}
```

---

## 7. Usage Examples

### 7.1 Example Conversations

#### Example 1: Simple Search

```
User: "Cari AI engineer di Dubai"

AI parses:
{
  "searchQuery": "AI engineer",
  "locations": ["Dubai"]
}

AI Response:
🔍 Saya menemukan 18 profil AI engineer di Dubai!

📊 **Ringkasan:**
- Top companies: Trilogy, Google, Oracle
- Pengalaman rata-rata: 5-8 tahun
- Mayoritas fokus di LLM, RAG, dan Cloud

Hasil lengkap ditampilkan di panel sebelah kanan.
Mau saya filter lebih spesifik atau export hasilnya?
```

#### Example 2: Search with Job Titles

```
User: "Find senior software developers with React and Node.js experience in Singapore"

AI parses:
{
  "searchQuery": "senior software developer React Node.js",
  "currentJobTitles": ["Senior Software Engineer", "Senior Developer", "Full Stack Developer"],
  "locations": ["Singapore"]
}

AI Response:
🔍 Searching for senior software developers in Singapore with React and Node.js expertise...
```

#### Example 3: Vague Query

```
User: "I need to hire someone for my tech startup"

AI Response:
Tentu! Untuk membantu Anda menemukan kandidat yang tepat, saya butuh beberapa informasi:

1. **Posisi apa** yang Anda cari? (contoh: Software Engineer, Product Manager, Designer)
2. **Di mana** lokasi startup Anda atau preferensi lokasi kandidat?
3. **Level senioritas** yang dibutuhkan? (Junior, Mid, Senior)

Setelah Anda berikan detailnya, saya bisa langsung mencarikan di LinkedIn!
```

### 7.2 Tool Call Response Format

```json
{
  "status": "success",
  "output": {
    "role": "assistant",
    "content": "🔍 Saya menemukan 18 profil AI engineer di Dubai!..."
  },
  "toolCalls": [
    {
      "name": "search_linkedin_profiles",
      "success": true,
      "data": {
        "searchId": "uuid-1234",
        "totalFound": 18,
        "profiles": [...],
        "topCompanies": ["Trilogy", "Google", "Oracle"],
        "locations": ["Dubai, UAE"]
      }
    }
  ]
}
```

---

## 8. Error Handling

### 8.1 Tool Execution Errors

```typescript
// Error handling in executor

try {
  const result = await searchService.executeSearch(...);
  return { success: true, data: summaryData };
} catch (error) {
  if (error instanceof ApifyRateLimitError) {
    return {
      success: false,
      error: "Rate limit exceeded. Please try again in a few minutes.",
    };
  }
  if (error instanceof ApifyAuthError) {
    return {
      success: false,
      error: "Search service is temporarily unavailable. Please contact support.",
    };
  }
  return {
    success: false,
    error: "Search failed. Please try again.",
  };
}
```

### 8.2 Fallback Response

```typescript
// In chat route, when tool fails

if (toolResult.success === false) {
  // Send error back to Groq to generate user-friendly message
  const errorResponse = await groq.chat.completions.create({
    messages: [
      ...secondMessages,
      {
        role: "user",
        content: `The search tool returned an error: "${toolResult.error}". 
Please apologize to the user and suggest what they can do next.`,
      },
    ],
    model: MODEL,
  });

  return NextResponse.json({
    status: "success",
    output: {
      role: "assistant",
      content: errorResponse.choices[0].message.content,
    },
    toolCalls: [
      {
        name: "search_linkedin_profiles",
        success: false,
        error: toolResult.error,
      },
    ],
  });
}
```

---

## 9. Testing

### 9.1 Unit Tests

```typescript
// __tests__/lib/groq/tools/linkedin-search.test.ts

import { linkedinSearchTool } from "@/lib/groq/tools/linkedin-search";

describe("LinkedIn Search Tool Schema", () => {
  it("should have correct tool name", () => {
    expect(linkedinSearchTool.function.name).toBe("search_linkedin_profiles");
  });

  it("should have searchQuery as required parameter", () => {
    const required = linkedinSearchTool.function.parameters.required;
    expect(required).toContain("searchQuery");
  });

  it("should have maxItems constraint", () => {
    const maxItems = linkedinSearchTool.function.parameters.properties.maxItems;
    expect(maxItems.maximum).toBe(100);
    expect(maxItems.default).toBe(25);
  });
});
```

### 9.2 Integration Tests

```typescript
// __tests__/lib/groq/executors/linkedin-search.test.ts

import { LinkedInSearchExecutor } from "@/lib/groq/executors/linkedin-search";

describe("LinkedInSearchExecutor", () => {
  it("should execute search and return formatted result", async () => {
    const executor = new LinkedInSearchExecutor();

    const result = await executor.execute(
      {
        searchQuery: "AI engineer",
        locations: ["Dubai"],
      },
      {
        userId: "test-user",
        projectId: "test-project",
      }
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("searchId");
    expect(result.data).toHaveProperty("profiles");
    expect(result.data).toHaveProperty("topCompanies");
  });
});
```

---

## 10. Performance Considerations

### 10.1 Latency Optimization

| Stage          | Typical Time | Optimization                       |
| -------------- | ------------ | ---------------------------------- |
| Groq Tool Call | 100-300ms    | Use streaming for long responses   |
| Apify Search   | 30-90s       | Parallel processing, show progress |
| Groq Summary   | 500-1000ms   | Cache common patterns              |

### 10.2 Token Optimization

```typescript
// Truncate profile data before sending to Groq
const truncateForLLM = (
  profiles: any[],
  maxProfiles = 10,
  maxSummaryLength = 200
) => {
  return profiles.slice(0, maxProfiles).map((p) => ({
    ...p,
    summary: p.summary?.slice(0, maxSummaryLength),
  }));
};
```

---

## 11. Appendix

### 11.1 Groq API Reference

- [Groq Tool Calling Documentation](https://console.groq.com/docs/tool-use)
- [Groq API Reference](https://console.groq.com/docs/api-reference)

### 11.2 Revision History

| Version | Date         | Author | Changes         |
| ------- | ------------ | ------ | --------------- |
| 1.0     | Feb 16, 2026 | Pi     | Initial version |
