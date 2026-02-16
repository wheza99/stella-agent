# Product Requirements Document (PRD)

## Informasi Dokumen

| Field        | Value                          |
| ------------ | ------------------------------ |
| Nama Produk  | Stella LinkedIn Profile Search |
| Versi PRD    | 1.0                            |
| Status       | Draft                          |
| Author       | Pi                             |
| Tanggal      | 16 Februari 2026               |
| Stakeholders | Product Team, Engineering Team |

---

## 1. Overview

### 1.1 Ringkasan Eksekutif

Fitur LinkedIn Profile Search memungkinkan pengguna Stella untuk mencari profil LinkedIn melalui chat interface menggunakan natural language. Dengan memanfaatkan Apify Actor untuk scraping dan Groq LLM dengan tool calling capability, pengguna dapat menemukan lead/prospect potensial secara intuitif tanpa perlu mengisi form kompleks. Hasil pencarian ditampilkan dalam bentuk tabel interaktif di halaman project detail.

### 1.2 Problem Statement

Tim sales dan lead generation menghadapi tantangan dalam mencari prospek yang qualified di LinkedIn:

**Pain Points:**

- Pencarian manual di LinkedIn memakan waktu dan tidak efisien
- Perlu mengunjungi profil satu per satu untuk mendapatkan informasi detail
- Tidak ada cara mudah untuk menyimpan dan mengorganisir hasil pencarian
- Proses copy-paste data manual rentan error dan tidak scalable
- Tidak ada integrasi antara proses pencarian dengan tools komunikasi

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

| Goal                | Deskripsi                                                                      |
| ------------------- | ------------------------------------------------------------------------------ |
| Efisiensi Pencarian | Mengurangi waktu pencarian lead dari 30+ menit menjadi < 2 menit per pencarian |
| User Adoption       | 80% pengguna aktif Stella menggunakan fitur ini dalam 30 hari setelah launch   |
| Lead Quality        | Meningkatkan kualitas lead dengan filtering yang lebih baik                    |
| Data Accuracy       | 95% akurasi data yang di-scrape                                                |

### 2.2 Success Metrics (KPIs)

| Metric                 | Target     | Cara Mengukur                                        |
| ---------------------- | ---------- | ---------------------------------------------------- |
| Search Completion Rate | > 90%      | Ratio successful searches / total searches           |
| Time to First Result   | < 30 detik | Waktu dari user mengirim message hingga hasil muncul |
| Export Rate            | > 40%      | Persentase hasil yang di-export ke CSV               |
| User Satisfaction      | > 4.5/5    | Rating dari user feedback                            |
| Daily Active Searches  | > 50/hari  | Jumlah pencarian unik per hari                       |

---

## 3. Target Users

### 3.1 User Personas

#### Persona 1: Sales Representative

| Attribute    | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Demographics | Usia 25-40, bekerja di B2B company, lokasi urban            |
| Goals        | Menemukan qualified leads dengan cepat untuk mencapai quota |
| Pain Points  | Manual searching di LinkedIn memakan waktu berjam-jam       |
| Behaviors    | Menggunakan LinkedIn Sales Navigator, CRM tools             |

#### Persona 2: Business Owner / Founder

| Attribute    | Value                                                   |
| ------------ | ------------------------------------------------------- |
| Demographics | Usia 30-50, founder startup atau SME                    |
| Goals        | Menemukan potential partners, investors, atau hires     |
| Pain Points  | Tidak ada dedicated sales team, harus melakukan sendiri |
| Behaviors    | Networking di LinkedIn, events, cold outreach           |

#### Persona 3: Recruiter / Talent Acquisition

| Attribute    | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| Demographics | Usia 25-45, HR professional atau recruiter                   |
| Goals        | Menemukan kandidat yang cocok untuk posisi terbuka           |
| Pain Points  | Sourcing manual tidak efisien, banyak unqualified candidates |
| Behaviors    | LinkedIn Recruiter, ATS tools                                |

### 3.2 User Journey

```
1. User membuka project di Stella
2. User mengetik query dalam bahasa natural di chat: "Cari AI engineer di Dubai"
3. AI mengenali intent dan memanggil tool LinkedIn Search
4. Apify Actor menjalankan scraping di background
5. Hasil ditampilkan di panel tabel di sebelah chat
6. User dapat melihat detail, filter, atau export hasil
```

---

## 4. User Stories & Requirements

### 4.1 User Stories

**Prioritas:**

- 🔴 Must Have (P0)
- 🟡 Should Have (P1)
- 🟢 Could Have (P2)
- ⚪ Won't Have (P3)

| ID     | User Story                                                                                                                                                     | Prioritas |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-001 | Sebagai sales rep, saya ingin mencari profil LinkedIn dengan natural language, sehingga saya tidak perlu mengisi form kompleks                                 | 🔴        |
| US-002 | Sebagai sales rep, saya ingin melihat hasil pencarian dalam bentuk tabel, sehingga mudah untuk dibaca dan dibandingkan                                         | 🔴        |
| US-003 | Sebagai sales rep, saya ingin melihat foto profil dan informasi dasar (nama, title, company, lokasi), sehingga saya bisa mengidentifikasi prospek dengan cepat | 🔴        |
| US-004 | Sebagai sales rep, saya ingin export hasil ke CSV, sehingga saya bisa mengimpor ke CRM atau tools lain                                                         | 🔴        |
| US-005 | Sebagai sales rep, saya ingin AI memberikan saran untuk filtering, sehingga hasil lebih relevan                                                                | 🟡        |
| US-006 | Sebagai sales rep, saya ingin menyimpan hasil pencarian ke database project, sehingga data tidak hilang dan bisa diakses kembali                               | 🔴        |
| US-007 | Sebagai sales rep, saya ingin filter berdasarkan job title, lokasi, dan keyword, sehingga hasil lebih spesifik                                                 | 🟡        |
| US-008 | Sebagai sales rep, saya ingin melihat status scraping (loading, progress), sehingga saya tahu proses sedang berjalan                                           | 🔴        |
| US-009 | Sebagai sales rep, saya ingin klik profil untuk melihat detail lengkap, sehingga saya bisa evaluasi lebih dalam                                                | 🟢        |
| US-010 | Sebagai sales rep, saya ingin AI summarize hasil pencarian, sehingga saya tidak perlu membaca semua satu per satu                                              | 🟡        |

### 4.2 Functional Requirements

| ID     | Requirement                                                                                               | Priority | Notes                          |
| ------ | --------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ |
| FR-001 | Sistem harus mengenali intent pencarian LinkedIn dari natural language query                              | 🔴       | Menggunakan Groq tool calling  |
| FR-002 | Sistem harus memanggil Apify Actor dengan parameter yang sesuai                                           | 🔴       | Actor: LinkedIn Profile Search |
| FR-003 | Sistem harus menampilkan hasil dalam tabel dengan kolom: Foto, Nama, Title, Company, Lokasi, LinkedIn URL | 🔴       |                                |
| FR-004 | Sistem harus menyimpan hasil ke database Supabase                                                         | 🔴       | Tabel baru: linkedin_profiles  |
| FR-005 | Sistem harus menyimpan metadata pencarian ke database                                                     | 🔴       | Tabel baru: linkedin_searches  |
| FR-006 | Sistem harus menampilkan loading state saat scraping berjalan                                             | 🔴       |                                |
| FR-007 | Sistem harus handle error dari Apify dengan graceful degradation                                          | 🔴       |                                |
| FR-008 | Sistem harus export hasil ke format CSV                                                                   | 🔴       |                                |
| FR-009 | Sistem harus parse parameter dari natural language (job title, lokasi, keyword)                           | 🟡       |                                |
| FR-010 | Sistem harus generate AI summary dari hasil pencarian                                                     | 🟡       | Menggunakan Groq               |

### 4.3 Non-Functional Requirements

| ID      | Requirement  | Category                          | Target                           |
| ------- | ------------ | --------------------------------- | -------------------------------- |
| NFR-001 | Performance  | Time to First Result              | < 30 detik                       |
| NFR-002 | Performance  | Scraping Completion (25 profiles) | < 2 menit                        |
| NFR-003 | Availability | Uptime                            | 99%                              |
| NFR-004 | Security     | API Key Storage                   | Environment variables, encrypted |
| NFR-005 | Scalability  | Concurrent Searches               | 10 per minute                    |
| NFR-006 | Usability    | Learning Curve                    | < 5 menit untuk user baru        |

---

## 5. Features & Scope

### 5.1 MVP Features (Must Have)

| Feature                 | Deskripsi                                                                  | User Stories           |
| ----------------------- | -------------------------------------------------------------------------- | ---------------------- |
| Natural Language Search | Parse query user menjadi parameter pencarian menggunakan Groq tool calling | US-001, FR-001, FR-009 |
| Apify Integration       | Integrasi dengan LinkedIn Profile Search Actor                             | US-001, FR-002         |
| Results Table           | Tabel interaktif untuk menampilkan hasil                                   | US-002, US-003, FR-003 |
| Database Storage        | Simpan hasil ke Supabase                                                   | US-006, FR-004, FR-005 |
| Loading States          | Progress indicator saat scraping                                           | US-008, FR-006         |
| Error Handling          | Handle error dengan pesan yang jelas                                       | FR-007                 |
| CSV Export              | Export hasil ke file CSV                                                   | US-004, FR-008         |

### 5.2 Future Features (Backlog)

| Feature              | Deskripsi                                         | Priority |
| -------------------- | ------------------------------------------------- | -------- |
| AI Summary           | Auto-generate summary dari hasil pencarian        | P1       |
| Advanced Filtering   | Filter hasil dalam tabel (by company, title, etc) | P1       |
| Profile Detail Modal | Modal untuk melihat detail profil lengkap         | P2       |
| Saved Searches       | Simpan query pencarian untuk digunakan kembali    | P2       |
| Search History       | Lihat riwayat pencarian                           | P2       |
| Bulk Actions         | Select multiple profiles untuk export/hapus       | P2       |
| AI Recommendations   | Saran untuk improving search query                | P2       |
| Integration with CRM | Push langsung ke HubSpot, Salesforce, dll         | P3       |

### 5.3 Out of Scope

- LinkedIn OAuth login untuk scraping own network
- Real-time profile updates/monitoring
- Automated outreach/messaging
- LinkedIn Premium/Sales Navigator features
- Profile enrichment dengan data dari sumber lain

---

## 6. Technical Overview

### 6.1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Stella Frontend                          │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │   Chat Input    │    │         Project Detail Page          │ │
│  │                 │    │  ┌─────────────┐ ┌─────────────────┐ │ │
│  │ "Cari AI engi-  │    │  │ Chat Section│ │ LinkedIn Results│ │ │
│  │  neer di Dubai" │    │  │             │ │     Table       │ │ │
│  └────────┬────────┘    │  └─────────────┘ └─────────────────┘ │ │
│           │             └─────────────────────────────────────┘ │
└───────────┼─────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              /api/chat/groq (Modified)                       │  │
│  │  - Parse natural language query                              │  │
│  │  - Tool calling untuk trigger LinkedIn search                │  │
│  │  - Return structured response                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              /api/linkedin/search (New)                      │  │
│  │  - Call Apify Actor                                          │  │
│  │  - Poll for results                                          │  │
│  │  - Store to Supabase                                         │  │
│  │  - Return results                                            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              /api/linkedin/export (New)                      │  │
│  │  - Generate CSV from stored results                          │  │
│  │  - Return downloadable file                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                       External Services                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │    Groq API     │    │   Apify API     │    │   Supabase    │  │
│  │                 │    │                 │    │               │  │
│  │ - LLM inference │    │ - LinkedIn      │    │ - Database    │  │
│  │ - Tool calling  │    │   scraping      │    │ - Storage     │  │
│  └─────────────────┘    └─────────────────┘    └───────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### 6.2 Tool Calling Flow

```typescript
// 1. Define Tool Schema
const linkedinSearchTool = {
  type: "function",
  function: {
    name: "search_linkedin_profiles",
    description:
      "Search for LinkedIn profiles based on job title, location, and keywords",
    parameters: {
      type: "object",
      properties: {
        searchQuery: {
          type: "string",
          description: "Main search query or keyword",
        },
        currentJobTitles: {
          type: "array",
          items: { type: "string" },
          description: "Job titles to filter by",
        },
        locations: {
          type: "array",
          items: { type: "string" },
          description: "Locations to filter by",
        },
        maxItems: {
          type: "integer",
          description: "Maximum number of results (default: 25)",
          default: 25,
        },
      },
      required: ["searchQuery"],
    },
  },
};

// 2. User Query -> Groq -> Tool Call
// User: "Cari AI engineer di Dubai"
// Groq returns: { tool_calls: [{ name: "search_linkedin_profiles", arguments: { searchQuery: "AI engineer", locations: ["Dubai"] } }] }

// 3. Execute Tool -> Apify -> Store -> Return Results
```

### 6.3 Database Schema

```sql
-- Table: linkedin_searches
CREATE TABLE linkedin_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  search_params JSONB, -- { searchQuery, currentJobTitles, locations, maxItems }
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  total_results INTEGER DEFAULT 0,
  apify_run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Table: linkedin_profiles
CREATE TABLE linkedin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID REFERENCES linkedin_searches(id) ON DELETE CASCADE,
  linkedin_id TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  summary TEXT,
  picture_url TEXT,
  location TEXT,
  current_positions JSONB, -- Array of positions
  open_profile BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  raw_data JSONB, -- Full response from Apify
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(search_id, linkedin_id)
);

-- Indexes
CREATE INDEX idx_linkedin_searches_project ON linkedin_searches(project_id);
CREATE INDEX idx_linkedin_profiles_search ON linkedin_profiles(search_id);
```

### 6.4 API Endpoints

#### POST /api/linkedin/search

```typescript
// Request
{
  searchQuery: "AI engineer",
  currentJobTitles: ["AI Engineer", "ML Engineer"],
  locations: ["Dubai"],
  maxItems: 25,
  projectId: "uuid"
}

// Response
{
  status: "success",
  searchId: "uuid",
  results: [
    {
      id: "uuid",
      linkedinUrl: "https://linkedin.com/in/...",
      firstName: "John",
      lastName: "Doe",
      summary: "...",
      currentPositions: [...],
      location: "Dubai, UAE",
      pictureUrl: "..."
    }
  ],
  meta: {
    totalElements: 18,
    totalPages: 1
  }
}
```

#### GET /api/linkedin/export?searchId=uuid

```typescript
// Response: CSV file download
```

### 6.5 Environment Variables

```env
# Existing
GROQ_API_KEY=xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# New
APIFY_API_TOKEN=xxx
```

---

## 7. Timeline & Milestones

### 7.1 Phases

| Phase             | Timeline | Deliverables                                 |
| ----------------- | -------- | -------------------------------------------- |
| Phase 1: Setup    | Week 1   | Database schema, Apify integration, env vars |
| Phase 2: Backend  | Week 1-2 | API endpoints, tool calling, Apify polling   |
| Phase 3: Frontend | Week 2-3 | Results table component, chat integration    |
| Phase 4: Polish   | Week 3   | Loading states, error handling, CSV export   |
| Phase 5: Testing  | Week 4   | QA, bug fixes, performance optimization      |

### 7.2 Key Milestones

| Milestone                 | Target Date  | Status |
| ------------------------- | ------------ | ------ |
| PRD Approved              | Feb 17, 2026 | ⏳     |
| Database Schema Ready     | Feb 18, 2026 | ⏳     |
| API Endpoints Complete    | Feb 21, 2026 | ⏳     |
| Tool Calling Working      | Feb 23, 2026 | ⏳     |
| Results Table UI Complete | Feb 25, 2026 | ⏳     |
| MVP Ready for Testing     | Feb 28, 2026 | ⏳     |
| Beta Launch               | Mar 3, 2026  | ⏳     |

---

## 8. Dependencies & Risks

### 8.1 Dependencies

| Dependency           | Type     | Owner       | Status       |
| -------------------- | -------- | ----------- | ------------ |
| Apify API Token      | External | Product     | ⏳ Pending   |
| Apify LinkedIn Actor | External | Apify       | ✅ Available |
| Groq Tool Calling    | External | Groq        | ✅ Available |
| Supabase Migration   | Internal | Engineering | ⏳ Pending   |

### 8.2 Risks & Mitigation

| Risk                             | Impact | Probability | Mitigation                                         |
| -------------------------------- | ------ | ----------- | -------------------------------------------------- |
| Apify rate limiting              | High   | Medium      | Implement queue system, show user friendly message |
| LinkedIn blocking scraping       | High   | Medium      | Use Apify residential proxies, respect rate limits |
| Groq tool calling accuracy       | Medium | Low         | Provide clear examples in system prompt            |
| Large result sets causing UI lag | Medium | Medium      | Implement pagination, virtual scrolling            |
| API costs exceeding budget       | Medium | Medium      | Set max results limit, monitor usage               |

---

## 9. UI/UX Mockups

### 9.1 Project Detail Page Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  ┌──────────────────────┬──────────────────────────────┐  │
│             │  │                      │                              │  │
│  Projects   │  │    Chat Section      │    LinkedIn Results          │  │
│  ├─ Proj 1  │  │    (w-75)            │    (flex-1)                  │  │
│  ├─ Proj 2  │  │                      │                              │  │
│  └─ Proj 3  │  │  ┌────────────────┐  │  ┌────────────────────────┐  │  │
│             │  │  │ User: Cari AI  │  │  │ 🔍 Results: 18 profiles│  │  │
│             │  │  │ engineer Dubai │  │  ├────────────────────────┤  │  │
│             │  │  └────────────────┘  │  │ 📤 Export CSV   🔄 Refresh│  │  │
│             │  │                      │  ├────────────────────────┤  │  │
│             │  │  ┌────────────────┐  │  │ Photo│Name  │Title │Loc │  │  │
│             │  │  │ AI: Saya akan  │  │  │  👤  │John  │AI Eng│UAE │  │  │
│             │  │  │ mencari profil │  │  │  👤  │Jane  │ML Eng│DXB │  │  │
│             │  │  │ LinkedIn...    │  │  │  👤  │Bob   │Data │DXB │  │  │
│             │  │  │                │  │  │  👤  │Alice │AI   │AUH │  │  │
│             │  │  │ ⏳ Loading...  │  │  │      │      │     │    │  │  │
│             │  │  └────────────────┘  │  │      │      │     │    │  │  │
│             │  │                      │  │      │      │     │    │  │  │
│             │  │  ┌────────────────┐  │  │      │      │     │    │  │  │
│             │  │  │ [Type message] │  │  └────────────────────────┘  │  │
│             │  │  └────────────────┘  │                              │  │
│             │  └──────────────────────┴──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Chat Flow

```
User: Cari AI engineer di Dubai dengan pengalaman 5+ tahun

AI: 🔍 Saya akan mencari profil LinkedIn dengan kriteria:
    - Job Title: AI Engineer, ML Engineer
    - Lokasi: Dubai
    - Keyword: "AI engineer"

    [⏳ Sedang mencari 18 profil...]

    ✅ Selesai! Saya menemukan 18 profil yang cocok.
    Hasil ditampilkan di panel sebelah kanan.

    📊 **Ringkasan:**
    - Mayoritas bekerja di Trilogy, Google, Oracle
    - Top skills: LLM, RAG, Python, Cloud
    - Pengalaman rata-rata: 5-8 tahun

    Mau saya filter lebih spesifik atau export hasilnya?
```

---

## 10. Appendix

### 10.1 Apify Actor Details

**Actor:** `~apify_linkedin-profile-search` or equivalent

**Input Schema:**

```json
{
  "searchQuery": "principal architect",
  "currentJobTitles": ["ai engineer"],
  "locations": ["dubai"],
  "maxItems": 25,
  "profileScraperMode": "Short",
  "autoQuerySegmentation": false,
  "recentlyChangedJobs": false
}
```

**Output Schema (per profile):**

```json
{
  "id": "ACwAABZIOuEBScg_RnMo_-Cwsp9KpEgYa5np2Rc",
  "linkedinUrl": "https://www.linkedin.com/in/...",
  "firstName": "Amine",
  "lastName": "AMMENOUCHE",
  "summary": "Back-end Scala and Python developer...",
  "openProfile": false,
  "premium": false,
  "currentPositions": [
    {
      "title": "Principal AI Engineer",
      "companyName": "Trilogy",
      "tenureAtPosition": { "numMonths": 6 },
      "startedOn": { "month": 9, "year": 2025 }
    }
  ],
  "location": { "linkedinText": "Dubai, United Arab Emirates" },
  "pictureUrl": "https://media.licdn.com/..."
}
```

### 10.2 References

- [Apify LinkedIn Profile Search Actor](https://apify.com/apify/linkedin-profile-search)
- [Groq Tool Calling Documentation](https://console.groq.com/docs/tool-use)
- [Supabase PostgreSQL Documentation](https://supabase.com/docs/guides/database)

### 10.3 Revision History

| Version | Date         | Author | Changes         |
| ------- | ------------ | ------ | --------------- |
| 1.0     | Feb 16, 2026 | Pi     | Initial version |

---

## Approval

| Role            | Name | Signature | Date |
| --------------- | ---- | --------- | ---- |
| Product Manager |      |           |      |
| Tech Lead       |      |           |      |
| Stakeholder     |      |           |      |
