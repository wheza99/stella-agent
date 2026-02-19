# ⚡ Stella Quick Reference

> Cheat sheet untuk navigasi cepat di project Stella

---

## 🔥 Most Used Files

```
# Main Pages
app/page.tsx                          # Landing
app/project/[id]/page.tsx             # Project detail (chat + results)

# Chat API
app/api/chat/groq/route.ts            # Chat endpoint

# LinkedIn Search
app/api/linkedin/search/route.ts      # Run search
lib/linkedin/search-service.ts        # Search logic
lib/linkedin/apify-client.ts          # Apify integration

# Tool Calling
lib/groq/tools/linkedin-search.ts     # Tool definition
lib/groq/executors/linkedin-search.ts # Tool executor
lib/groq/prompts/system.ts            # System prompt

# Components
components/pabrik-startup/chat/       # Chat UI
components/pabrik-startup/linkedin/   # LinkedIn Results UI
components/pabrik-startup/sidebar/    # Sidebar

# Types
type/interface/linkedin.ts            # LinkedIn types
type/interface/chat.ts                # Chat types
```

---

## 📂 Folder Structure

```
stella/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── auth/           # Auth endpoints
│   │   ├── chat/           # Chat (Groq)
│   │   ├── linkedin/       # LinkedIn search
│   │   ├── organization/   # Organization
│   │   ├── payment/        # Payment
│   │   └── project/        # Project
│   ├── auth/               # Auth pages
│   ├── payment/            # Payment pages
│   ├── project/[id]/       # Project detail
│   └── pricing/            # Pricing page
│
├── components/
│   ├── ui/                 # shadcn/ui components (54 files)
│   ├── pabrik-startup/     # Business components
│   │   ├── auth/           # Auth forms
│   │   ├── chat/           # Chat UI
│   │   ├── header/         # App header
│   │   ├── linkedin/       # LinkedIn results
│   │   ├── marketing/      # Marketing
│   │   ├── sidebar/        # Sidebar
│   │   └── subs/           # Subscription
│   └── magic-ui/           # Animated effects
│
├── lib/
│   ├── groq/               # Groq LLM
│   │   ├── prompts/        # System prompts
│   │   ├── tools/          # Tool definitions
│   │   └── executors/      # Tool executors
│   ├── linkedin/           # LinkedIn service
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Utilities
│
├── hooks/                  # Custom hooks
├── context/                # React contexts
├── type/interface/         # TypeScript types
├── docs/                   # Documentation
└── supabase/migrations/    # DB migrations
```

---

## 🔗 API Endpoints

### Auth
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login user |
| `/api/auth/register` | POST | Register user |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/user` | GET | Get current user |

### Chat
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/groq` | POST | Chat with Groq LLM |

### LinkedIn
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/linkedin/search` | POST | Run LinkedIn search |
| `/api/linkedin/results` | GET | Get search results |
| `/api/linkedin/export` | GET | Export to CSV |
| `/api/linkedin/searches` | GET | List searches |

### Project
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/project/list` | GET | List projects |
| `/api/project/detail` | GET | Get project detail |

---

## 🛠️ Key Components

### Chat Section
```tsx
import ChatSection from '@/components/pabrik-startup/chat/chat-section'

<ChatSection 
  projectId={id} 
  onToolCallComplete={handleToolCall} 
/>
```

### LinkedIn Results
```tsx
import { LinkedInResultsPanel } from '@/components/pabrik-startup/linkedin'

<LinkedInResultsPanel projectId={id} />
```

---

## 📋 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABABASE_PUBLISHABLE_KEY=

# Groq
GROQ_API_KEY=

# Apify
APIFY_API_TOKEN=

# Tripay (Payment)
TRIPAY_API_URL=
TRIPAY_API_KEY=
TRIPAY_PRIVATE_KEY=
TRIPAY_MERCHANT_CODE=
```

---

## 🚀 Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm run start

# Lint
npm run lint
```

---

## 📚 Docs

| Doc | Path |
|-----|------|
| PRD | `docs/prd-linkedin-search.md` |
| Spec: Database & API | `docs/spec-1-database-api.md` |
| Spec: Tool Calling | `docs/spec-2-tool-calling.md` |
| Spec: Frontend | `docs/spec-3-frontend-ui.md` |
| Full Directory | `.pi/DIRECTORY.md` |

---

*Quick reference for Stella development*
