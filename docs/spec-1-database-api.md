# Engineering Specification: Database & API

## Informasi Dokumen

| Field         | Value                                              |
| ------------- | -------------------------------------------------- |
| Nama Feature  | LinkedIn Profile Search - Database & API           |
| Versi Spec    | 1.0                                                |
| Status        | Draft                                              |
| Author        | Pi                                                 |
| Reviewer      | -                                                  |
| Tanggal       | 16 Februari 2026                                   |
| PRD Reference | [prd-linkedin-search.md](./prd-linkedin-search.md) |

---

## 1. Overview

### 1.1 Summary

Spec ini mencakup implementasi database schema untuk menyimpan hasil pencarian LinkedIn dan API endpoints untuk menjalankan pencarian via Apify serta export hasil ke CSV.

### 1.2 Goals

- Membuat database schema untuk `linkedin_searches` dan `linkedin_profiles`
- Membuat API endpoint untuk menjalankan pencarian LinkedIn via Apify
- Membuat API endpoint untuk mengambil hasil pencarian
- Membuat API endpoint untuk export hasil ke CSV
- Mengintegrasikan dengan Apify API untuk scraping LinkedIn

### 1.3 Non-Goals

- Tool calling logic (covered in Spec 2)
- Frontend UI components (covered in Spec 3)
- Real-time WebSocket updates
- Background job queue (sync approach for MVP)

---

## 2. System Architecture

### 2.1 High-Level Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Stella Next.js App                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API Route Handlers                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │   │
│  │  │ /api/linkedin/  │  │ /api/linkedin/  │  │/api/linkedin/ │ │   │
│  │  │     search      │  │     results     │  │    export     │ │   │
│  │  └────────┬────────┘  └────────┬────────┘  └───────┬───────┘ │   │
│  └───────────┼────────────────────┼───────────────────┼─────────┘   │
│              │                    │                   │              │
│  ┌───────────┼────────────────────┼───────────────────┼─────────┐   │
│  │           ▼                    ▼                   ▼         │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │                  lib/linkedin/                       │    │   │
│  │  │  - apify-client.ts    - search-service.ts           │    │   │
│  │  │  - result-mapper.ts   - csv-exporter.ts             │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
         │                              │                    │
         ▼                              ▼                    ▼
┌─────────────────┐          ┌─────────────────┐    ┌───────────────┐
│   Supabase      │          │   Apify API     │    │   Client      │
│   (PostgreSQL)  │          │                 │    │   (Download)  │
│                 │          │  LinkedIn       │    │               │
│  - searches     │          │  Profile Search │    │  CSV file     │
│  - profiles     │          │  Actor          │    │               │
└─────────────────┘          └─────────────────┘    └───────────────┘
```

### 2.2 Components

| Component      | Location                         | Responsibility                         |
| -------------- | -------------------------------- | -------------------------------------- |
| API Routes     | `app/api/linkedin/`              | Handle HTTP requests, validation, auth |
| Apify Client   | `lib/linkedin/apify-client.ts`   | Communicate with Apify API             |
| Search Service | `lib/linkedin/search-service.ts` | Orchestrate search flow                |
| Result Mapper  | `lib/linkedin/result-mapper.ts`  | Transform Apify response to app model  |
| CSV Exporter   | `lib/linkedin/csv-exporter.ts`   | Generate CSV from results              |

### 2.3 Data Flow

```
Search Flow:
1. POST /api/linkedin/search
2. Validate request & user auth
3. Create search record (status: pending)
4. Call Apify Actor
5. Poll for completion (status: running)
6. Fetch results from Apify dataset
7. Transform & store profiles (status: completed)
8. Return results to client

Export Flow:
1. GET /api/linkedin/export?searchId=xxx
2. Validate searchId & user ownership
3. Fetch profiles from database
4. Generate CSV
5. Return as downloadable file
```

---

## 3. API Specification

### 3.1 Endpoints Overview

| Method | Endpoint               | Description           | Auth |
| ------ | ---------------------- | --------------------- | ---- |
| POST   | /api/linkedin/search   | Run LinkedIn search   | ✅   |
| GET    | /api/linkedin/results  | Get search results    | ✅   |
| GET    | /api/linkedin/export   | Export results as CSV | ✅   |
| GET    | /api/linkedin/searches | List user's searches  | ✅   |

### 3.2 Endpoint Details

#### POST /api/linkedin/search

**Description:** Menjalankan pencarian profil LinkedIn via Apify

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```typescript
interface LinkedInSearchRequest {
  searchQuery: string; // Main search keyword (required)
  currentJobTitles?: string[]; // Filter by job titles
  locations?: string[]; // Filter by locations
  maxItems?: number; // Max results (default: 25, max: 100)
  projectId: string; // Project to associate search with
}
```

**Request Example:**

```json
{
  "searchQuery": "AI engineer",
  "currentJobTitles": ["AI Engineer", "ML Engineer", "Data Scientist"],
  "locations": ["Dubai", "UAE"],
  "maxItems": 25,
  "projectId": "uuid-here"
}
```

**Response 200:**

```typescript
interface LinkedInSearchResponse {
  status: "success";
  data: {
    searchId: string;
    status: "completed" | "running" | "failed";
    results: LinkedInProfile[];
    meta: {
      totalElements: number;
      totalPages: number;
      pageNumber: number;
    };
  };
}

interface LinkedInProfile {
  id: string;
  linkedinId: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  fullName: string;
  summary: string | null;
  pictureUrl: string | null;
  location: string | null;
  currentPositions: CurrentPosition[];
  openProfile: boolean;
  premium: boolean;
}

interface CurrentPosition {
  title: string;
  companyName: string;
  tenureMonths: number | null;
  startedOn: { month: number; year: number } | null;
  companyId: string | null;
  companyLinkedinUrl: string | null;
}
```

**Response 202 (Still Running):**

```json
{
  "status": "pending",
  "data": {
    "searchId": "uuid",
    "status": "running",
    "message": "Search in progress. Poll /api/linkedin/results?searchId=uuid for updates."
  }
}
```

**Response 400:**

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "searchQuery is required"
  }
}
```

**Response 401:**

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  }
}
```

#### GET /api/linkedin/results

**Description:** Mengambil hasil pencarian yang sudah tersimpan

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| searchId | string | Yes | Search ID to get results for |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 25, max: 100) |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "searchId": "uuid",
    "searchQuery": "AI engineer",
    "status": "completed",
    "results": [...],
    "meta": {
      "totalElements": 18,
      "totalPages": 1,
      "pageNumber": 1,
      "pageSize": 25
    }
  }
}
```

#### GET /api/linkedin/export

**Description:** Export hasil pencarian ke CSV

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| searchId | string | Yes | Search ID to export |

**Response 200:**

```
Content-Type: text/csv
Content-Disposition: attachment; filename="linkedin-search-{searchId}.csv"

firstName,lastName,fullName,title,company,location,linkedinUrl,summary
John,Doe,John Doe,AI Engineer,Tech Corp,Dubai,https://linkedin.com/in/johndoe,"Summary here"
...
```

**Response 404:**

```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Search not found or has no results"
  }
}
```

#### GET /api/linkedin/searches

**Description:** List semua pencarian untuk project tertentu

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | string | Yes | Project ID |
| page | number | No | Page number |
| limit | number | No | Items per page |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "searches": [
      {
        "id": "uuid",
        "query": "AI engineer",
        "searchParams": {...},
        "status": "completed",
        "totalResults": 18,
        "createdAt": "2026-02-16T12:00:00Z"
      }
    ],
    "meta": {
      "total": 5,
      "page": 1,
      "limit": 10
    }
  }
}
```

### 3.3 Error Codes

| Code                | HTTP Status | Description                         |
| ------------------- | ----------- | ----------------------------------- |
| UNAUTHORIZED        | 401         | User not authenticated              |
| FORBIDDEN           | 403         | User doesn't have access to project |
| NOT_FOUND           | 404         | Search/Project not found            |
| VALIDATION_ERROR    | 400         | Invalid request parameters          |
| APIFY_ERROR         | 502         | Apify API error                     |
| RATE_LIMIT_EXCEEDED | 429         | Too many requests                   |

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│    projects     │       │  linkedin_searches  │       │linkedin_profiles│
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)         │◀──────│ project_id (FK)     │       │ id (PK)         │
│ title           │       │ id (PK)             │◀──────│ search_id (FK)  │
│ org_id          │       │ user_id (FK)        │       │ linkedin_id     │
│ created_at      │       │ query               │       │ linkedin_url    │
│ ...             │       │ search_params (JSON)│       │ first_name      │
└─────────────────┘       │ status              │       │ last_name       │
                          │ total_results       │       │ summary         │
                          │ apify_run_id        │       │ picture_url     │
                          │ created_at          │       │ location        │
                          │ completed_at        │       │ current_positions│
                          └─────────────────────┘       │ raw_data (JSON) │
                                                        │ ...             │
                                                        └─────────────────┘
```

### 4.2 Schema Definition

#### Table: linkedin_searches

| Column        | Type        | Constraints                                         | Description                         |
| ------------- | ----------- | --------------------------------------------------- | ----------------------------------- |
| id            | UUID        | PRIMARY KEY, DEFAULT gen_random_uuid()              | Unique identifier                   |
| project_id    | UUID        | NOT NULL, REFERENCES projects(id) ON DELETE CASCADE | Associated project                  |
| user_id       | UUID        | NOT NULL, REFERENCES auth.users(id)                 | User who initiated search           |
| query         | TEXT        | NOT NULL                                            | Original natural language query     |
| search_params | JSONB       | NOT NULL, DEFAULT '{}'                              | Parsed search parameters            |
| status        | TEXT        | NOT NULL, DEFAULT 'pending'                         | pending, running, completed, failed |
| total_results | INTEGER     | DEFAULT 0                                           | Number of profiles found            |
| apify_run_id  | TEXT        | NULL                                                | Apify run identifier                |
| error_message | TEXT        | NULL                                                | Error message if failed             |
| created_at    | TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                             | Creation timestamp                  |
| completed_at  | TIMESTAMPTZ | NULL                                                | Completion timestamp                |

**Indexes:**

- `idx_linkedin_searches_project` ON (project_id)
- `idx_linkedin_searches_user` ON (user_id)
- `idx_linkedin_searches_status` ON (status)
- `idx_linkedin_searches_created` ON (created_at DESC)

#### Table: linkedin_profiles

| Column            | Type        | Constraints                                                  | Description                       |
| ----------------- | ----------- | ------------------------------------------------------------ | --------------------------------- |
| id                | UUID        | PRIMARY KEY, DEFAULT gen_random_uuid()                       | Unique identifier                 |
| search_id         | UUID        | NOT NULL, REFERENCES linkedin_searches(id) ON DELETE CASCADE | Parent search                     |
| linkedin_id       | TEXT        | NOT NULL                                                     | LinkedIn profile ID               |
| linkedin_url      | TEXT        | NOT NULL                                                     | Full LinkedIn URL                 |
| first_name        | TEXT        | NULL                                                         | First name                        |
| last_name         | TEXT        | NULL                                                         | Last name                         |
| summary           | TEXT        | NULL                                                         | Profile summary/headline          |
| picture_url       | TEXT        | NULL                                                         | Profile picture URL               |
| location          | TEXT        | NULL                                                         | Location text                     |
| current_positions | JSONB       | DEFAULT '[]'                                                 | Array of current positions        |
| open_profile      | BOOLEAN     | DEFAULT FALSE                                                | Is profile open                   |
| premium           | BOOLEAN     | DEFAULT FALSE                                                | Is premium member                 |
| raw_data          | JSONB       | NULL                                                         | Full original response from Apify |
| created_at        | TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                                      | Creation timestamp                |

**Constraints:**

- `UNIQUE(search_id, linkedin_id)` - Prevent duplicate profiles in same search

**Indexes:**

- `idx_linkedin_profiles_search` ON (search_id)
- `idx_linkedin_profiles_linkedin_id` ON (linkedin_id)

### 4.3 Migrations

#### Migration: 001_create_linkedin_searches.sql

```sql
-- Create linkedin_searches table
CREATE TABLE IF NOT EXISTS linkedin_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_params JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    total_results INTEGER DEFAULT 0,
    apify_run_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_linkedin_searches_project ON linkedin_searches(project_id);
CREATE INDEX idx_linkedin_searches_user ON linkedin_searches(user_id);
CREATE INDEX idx_linkedin_searches_status ON linkedin_searches(status);
CREATE INDEX idx_linkedin_searches_created ON linkedin_searches(created_at DESC);

-- Add comment
COMMENT ON TABLE linkedin_searches IS 'Stores LinkedIn profile search metadata and status';
```

#### Migration: 002_create_linkedin_profiles.sql

```sql
-- Create linkedin_profiles table
CREATE TABLE IF NOT EXISTS linkedin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID NOT NULL REFERENCES linkedin_searches(id) ON DELETE CASCADE,
    linkedin_id TEXT NOT NULL,
    linkedin_url TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    summary TEXT,
    picture_url TEXT,
    location TEXT,
    current_positions JSONB DEFAULT '[]',
    open_profile BOOLEAN DEFAULT FALSE,
    premium BOOLEAN DEFAULT FALSE,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_profile_per_search UNIQUE (search_id, linkedin_id)
);

-- Create indexes
CREATE INDEX idx_linkedin_profiles_search ON linkedin_profiles(search_id);
CREATE INDEX idx_linkedin_profiles_linkedin_id ON linkedin_profiles(linkedin_id);

-- Add comment
COMMENT ON TABLE linkedin_profiles IS 'Stores scraped LinkedIn profile data';
```

---

## 5. Implementation Details

### 5.1 Project Structure

```
stella/
├── app/
│   └── api/
│       └── linkedin/
│           ├── search/
│           │   └── route.ts        # POST - Run search
│           ├── results/
│           │   └── route.ts        # GET - Get results
│           ├── export/
│           │   └── route.ts        # GET - Export CSV
│           └── searches/
│               └── route.ts        # GET - List searches
├── lib/
│   └── linkedin/
│       ├── apify-client.ts         # Apify API wrapper
│       ├── search-service.ts       # Search orchestration
│       ├── result-mapper.ts        # Transform Apify response
│       └── csv-exporter.ts         # CSV generation
└── type/
    └── interface/
        └── linkedin.ts             # TypeScript interfaces
```

### 5.2 Apify Client

```typescript
// lib/linkedin/apify-client.ts

import { ApifyClient } from "apify-client";

const APIFY_ACTOR_ID = "apify/linkedin-profile-search"; // Or custom actor ID

interface ApifySearchInput {
  searchQuery: string;
  currentJobTitles?: string[];
  locations?: string[];
  maxItems?: number;
  profileScraperMode?: "Short" | "Full";
  autoQuerySegmentation?: boolean;
  recentlyChangedJobs?: boolean;
}

interface ApifyProfileResult {
  id: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  summary: string;
  openProfile: boolean;
  premium: boolean;
  currentPositions: Array<{
    title: string;
    companyName: string;
    tenureAtPosition?: { numMonths?: number; numYears?: number };
    startedOn?: { month: number; year: number };
    companyId?: string;
    companyLinkedinUrl?: string;
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

export class LinkedInApifyClient {
  private client: ApifyClient;

  constructor(apiToken: string) {
    this.client = new ApifyClient({ token: apiToken });
  }

  async runSearch(
    input: ApifySearchInput
  ): Promise<{ runId: string; datasetId: string }> {
    const run = await this.client.actor(APIFY_ACTOR_ID).call({
      ...input,
      maxItems: input.maxItems || 25,
      profileScraperMode: input.profileScraperMode || "Short",
      autoQuerySegmentation: input.autoQuerySegmentation ?? false,
      recentlyChangedJobs: input.recentlyChangedJobs ?? false,
    });

    return {
      runId: run.id,
      datasetId: run.defaultDatasetId,
    };
  }

  async getResults(datasetId: string): Promise<ApifyProfileResult[]> {
    const { items } = await this.client.dataset(datasetId).listItems();
    return items as ApifyProfileResult[];
  }

  async getRunStatus(runId: string): Promise<{
    status: "READY" | "RUNNING" | "SUCCEEDED" | "FAILED" | "TIMED-OUT";
    isFinished: boolean;
  }> {
    const run = this.client.run(runId);
    const status = await run.get();

    return {
      status: status?.status as any,
      isFinished:
        status?.status === "SUCCEEDED" ||
        status?.status === "FAILED" ||
        status?.status === "TIMED-OUT",
    };
  }
}

// Singleton instance
export const apifyClient = new LinkedInApifyClient(
  process.env.APIFY_API_TOKEN!
);
```

### 5.3 Result Mapper

```typescript
// lib/linkedin/result-mapper.ts

import { ApifyProfileResult } from "./apify-client";
import { LinkedInProfile, CurrentPosition } from "@/type/interface/linkedin";

export function mapApifyResultToProfile(
  result: ApifyProfileResult,
  searchId: string
): Omit<LinkedInProfile, "id"> {
  const positions: CurrentPosition[] =
    result.currentPositions?.map((pos) => ({
      title: pos.title,
      companyName: pos.companyName,
      tenureMonths:
        pos.tenureAtPosition?.numMonths ??
        (pos.tenureAtPosition?.numYears
          ? pos.tenureAtPosition.numYears * 12
          : null),
      startedOn: pos.startedOn ?? null,
      companyId: pos.companyId ?? null,
      companyLinkedinUrl: pos.companyLinkedinUrl ?? null,
    })) ?? [];

  return {
    searchId,
    linkedinId: result.id,
    linkedinUrl: result.linkedinUrl,
    firstName: result.firstName,
    lastName: result.lastName,
    summary: result.summary ?? null,
    pictureUrl: result.pictureUrl ?? null,
    location: result.location?.linkedinText ?? null,
    currentPositions: positions,
    openProfile: result.openProfile ?? false,
    premium: result.premium ?? false,
    rawData: result,
  };
}

export function extractPagination(results: ApifyProfileResult[]): {
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
} | null {
  if (results.length === 0) return null;

  const meta = results[0]?._meta?.pagination;
  if (!meta) {
    return {
      totalElements: results.length,
      totalPages: 1,
      pageNumber: 1,
      pageSize: results.length,
    };
  }

  return meta;
}
```

### 5.4 Search Service

```typescript
// lib/linkedin/search-service.ts

import { createClient } from "@/lib/supabase/server";
import { apifyClient, LinkedInApifyClient } from "./apify-client";
import { mapApifyResultToProfile, extractPagination } from "./result-mapper";

export interface SearchParams {
  searchQuery: string;
  currentJobTitles?: string[];
  locations?: string[];
  maxItems?: number;
  projectId: string;
  userId: string;
}

export class LinkedInSearchService {
  private supabase: Awaited<ReturnType<typeof createClient>>;
  private apify: LinkedInApifyClient;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
    this.apify = apifyClient;
  }

  async executeSearch(params: SearchParams) {
    // 1. Create search record
    const { data: search, error: searchError } = await this.supabase
      .from("linkedin_searches")
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
        status: "pending",
      })
      .select()
      .single();

    if (searchError || !search) {
      throw new Error(`Failed to create search: ${searchError?.message}`);
    }

    try {
      // 2. Update status to running
      await this.supabase
        .from("linkedin_searches")
        .update({ status: "running" })
        .eq("id", search.id);

      // 3. Run Apify search
      const { runId, datasetId } = await this.apify.runSearch({
        searchQuery: params.searchQuery,
        currentJobTitles: params.currentJobTitles,
        locations: params.locations,
        maxItems: params.maxItems || 25,
      });

      // 4. Update with Apify run ID
      await this.supabase
        .from("linkedin_searches")
        .update({ apify_run_id: runId })
        .eq("id", search.id);

      // 5. Get results from Apify
      const results = await this.apify.getResults(datasetId);

      // 6. Transform and store profiles
      const profiles = results.map((r) =>
        mapApifyResultToProfile(r, search.id)
      );

      if (profiles.length > 0) {
        const { error: insertError } = await this.supabase
          .from("linkedin_profiles")
          .insert(profiles);

        if (insertError) {
          console.error("Failed to insert profiles:", insertError);
        }
      }

      // 7. Update search as completed
      const pagination = extractPagination(results);
      await this.supabase
        .from("linkedin_searches")
        .update({
          status: "completed",
          total_results: pagination?.totalElements ?? results.length,
          completed_at: new Date().toISOString(),
        })
        .eq("id", search.id);

      // 8. Fetch and return stored profiles
      const { data: storedProfiles } = await this.supabase
        .from("linkedin_profiles")
        .select("*")
        .eq("search_id", search.id);

      return {
        searchId: search.id,
        status: "completed",
        results: storedProfiles || [],
        meta: pagination,
      };
    } catch (error) {
      // Update search as failed
      await this.supabase
        .from("linkedin_searches")
        .update({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", search.id);

      throw error;
    }
  }

  async getResults(searchId: string, userId: string) {
    // Verify ownership
    const { data: search, error } = await this.supabase
      .from("linkedin_searches")
      .select("*")
      .eq("id", searchId)
      .eq("user_id", userId)
      .single();

    if (error || !search) {
      throw new Error("Search not found");
    }

    // Get profiles
    const { data: profiles } = await this.supabase
      .from("linkedin_profiles")
      .select("*")
      .eq("search_id", searchId);

    return {
      searchId: search.id,
      query: search.query,
      status: search.status,
      results: profiles || [],
    };
  }
}
```

### 5.5 CSV Exporter

```typescript
// lib/linkedin/csv-exporter.ts

import { LinkedInProfile } from "@/type/interface/linkedin";

const CSV_HEADERS = [
  "First Name",
  "Last Name",
  "Full Name",
  "Title",
  "Company",
  "Location",
  "LinkedIn URL",
  "Open Profile",
  "Premium",
  "Summary",
];

function escapeCSV(value: string | null | undefined): string {
  if (!value) return "";
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  const escaped = value.replace(/"/g, '""');
  if (
    escaped.includes(",") ||
    escaped.includes('"') ||
    escaped.includes("\n")
  ) {
    return `"${escaped}"`;
  }
  return escaped;
}

export function generateCSV(profiles: LinkedInProfile[]): string {
  const rows = profiles.map((profile) => {
    const position = profile.currentPositions?.[0];
    return [
      escapeCSV(profile.firstName),
      escapeCSV(profile.lastName),
      escapeCSV(`${profile.firstName} ${profile.lastName}`),
      escapeCSV(position?.title),
      escapeCSV(position?.companyName),
      escapeCSV(profile.location),
      escapeCSV(profile.linkedinUrl),
      profile.openProfile ? "Yes" : "No",
      profile.premium ? "Yes" : "No",
      escapeCSV(profile.summary),
    ].join(",");
  });

  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

export function generateCSVFilename(searchId: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `linkedin-search-${searchId.slice(0, 8)}-${timestamp}.csv`;
}
```

### 5.6 API Route: Search

```typescript
// app/api/linkedin/search/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { LinkedInSearchService } from "@/lib/linkedin/search-service";
import { z } from "zod";

const searchRequestSchema = z.object({
  searchQuery: z.string().min(1).max(500),
  currentJobTitles: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  maxItems: z.number().min(1).max(100).default(25),
  projectId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          status: "error",
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        },
        { status: 401 }
      );
    }

    // 2. Validate request
    const body = await request.json();
    const validated = searchRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: "error",
          error: { code: "VALIDATION_ERROR", message: validated.error.message },
        },
        { status: 400 }
      );
    }

    // 3. Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", validated.data.projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        {
          status: "error",
          error: { code: "NOT_FOUND", message: "Project not found" },
        },
        { status: 404 }
      );
    }

    // 4. Execute search
    const searchService = new LinkedInSearchService(supabase);
    const result = await searchService.executeSearch({
      ...validated.data,
      userId: user.id,
    });

    return NextResponse.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("LinkedIn search error:", error);

    return NextResponse.json(
      {
        status: "error",
        error: {
          code: "APIFY_ERROR",
          message: error instanceof Error ? error.message : "Search failed",
        },
      },
      { status: 502 }
    );
  }
}
```

### 5.7 API Route: Export

```typescript
// app/api/linkedin/export/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateCSV, generateCSVFilename } from "@/lib/linkedin/csv-exporter";

export async function GET(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          status: "error",
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        },
        { status: 401 }
      );
    }

    // 2. Get searchId from URL
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("searchId");

    if (!searchId) {
      return NextResponse.json(
        {
          status: "error",
          error: { code: "VALIDATION_ERROR", message: "searchId is required" },
        },
        { status: 400 }
      );
    }

    // 3. Verify ownership and get profiles
    const { data: search, error: searchError } = await supabase
      .from("linkedin_searches")
      .select("id, user_id")
      .eq("id", searchId)
      .eq("user_id", user.id)
      .single();

    if (searchError || !search) {
      return NextResponse.json(
        {
          status: "error",
          error: { code: "NOT_FOUND", message: "Search not found" },
        },
        { status: 404 }
      );
    }

    const { data: profiles } = await supabase
      .from("linkedin_profiles")
      .select("*")
      .eq("search_id", searchId);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          error: {
            code: "NOT_FOUND",
            message: "No profiles found for this search",
          },
        },
        { status: 404 }
      );
    }

    // 4. Generate CSV
    const csv = generateCSV(profiles);
    const filename = generateCSVFilename(searchId);

    // 5. Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);

    return NextResponse.json(
      {
        status: "error",
        error: {
          code: "INTERNAL_ERROR",
          message: "Export failed",
        },
      },
      { status: 500 }
    );
  }
}
```

### 5.8 TypeScript Interfaces

```typescript
// type/interface/linkedin.ts

export interface LinkedInSearch {
  id: string;
  projectId: string;
  userId: string;
  query: string;
  searchParams: SearchParams;
  status: "pending" | "running" | "completed" | "failed";
  totalResults: number;
  apifyRunId: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface SearchParams {
  searchQuery: string;
  currentJobTitles?: string[];
  locations?: string[];
  maxItems?: number;
}

export interface LinkedInProfile {
  id: string;
  searchId: string;
  linkedinId: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  summary: string | null;
  pictureUrl: string | null;
  location: string | null;
  currentPositions: CurrentPosition[];
  openProfile: boolean;
  premium: boolean;
  rawData: Record<string, unknown> | null;
  createdAt: string;
}

export interface CurrentPosition {
  title: string;
  companyName: string;
  tenureMonths: number | null;
  startedOn: { month: number; year: number } | null;
  companyId: string | null;
  companyLinkedinUrl: string | null;
}
```

---

## 6. Security

### 6.1 Authentication

- All endpoints require authenticated user via Supabase Auth
- User ID extracted from session token
- Project ownership verified before allowing access

### 6.2 Input Validation

- Zod schemas for all request bodies
- Max limits on all pagination parameters
- Max 100 profiles per search (configurable)

### 6.3 API Key Management

```typescript
// Environment variables required
APIFY_API_TOKEN = xxx; // Stored in .env, never committed to git
```

### 6.4 Rate Limiting Considerations

Apify has its own rate limits. For MVP, we rely on Apify's limits. Future enhancement:

- Add application-level rate limiting per user
- Queue system for concurrent searches

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// __tests__/lib/linkedin/result-mapper.test.ts

import { mapApifyResultToProfile } from "@/lib/linkedin/result-mapper";

describe("mapApifyResultToProfile", () => {
  it("should map Apify result to profile correctly", () => {
    const apifyResult = {
      id: "ABC123",
      linkedinUrl: "https://linkedin.com/in/test",
      firstName: "John",
      lastName: "Doe",
      summary: "Test summary",
      currentPositions: [
        {
          title: "Engineer",
          companyName: "Tech Corp",
        },
      ],
      location: { linkedinText: "Dubai, UAE" },
    };

    const profile = mapApifyResultToProfile(apifyResult, "search-123");

    expect(profile.linkedinId).toBe("ABC123");
    expect(profile.firstName).toBe("John");
    expect(profile.currentPositions[0].title).toBe("Engineer");
  });
});
```

### 7.2 Integration Tests

```typescript
// __tests__/api/linkedin/search.test.ts

describe("POST /api/linkedin/search", () => {
  it("should return 401 for unauthenticated user", async () => {
    const response = await fetch("/api/linkedin/search", {
      method: "POST",
      body: JSON.stringify({ searchQuery: "test", projectId: "uuid" }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 400 for missing searchQuery", async () => {
    // With authenticated session
    const response = await fetch("/api/linkedin/search", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
      body: JSON.stringify({ projectId: "uuid" }),
    });

    expect(response.status).toBe(400);
  });
});
```

---

## 8. Deployment

### 8.1 Environment Variables

Add to `.env` and Vercel environment:

```env
APIFY_API_TOKEN=your_apify_token_here
```

### 8.2 Database Migration

Run migrations via Supabase CLI:

```bash
supabase migration new create_linkedin_tables
# Copy migration SQL to generated file
supabase db push
```

### 8.3 Dependencies

```bash
npm install apify-client
```

---

## 9. Appendix

### 9.1 Apify API Reference

- [LinkedIn Profile Search Actor](https://apify.com/apify/linkedin-profile-search)
- [Apify Client JS Documentation](https://docs.apify.com/api/client/js)

### 9.2 Revision History

| Version | Date         | Author | Changes         |
| ------- | ------------ | ------ | --------------- |
| 1.0     | Feb 16, 2026 | Pi     | Initial version |
