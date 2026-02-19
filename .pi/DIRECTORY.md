# 📁 Stella Project Directory

> Daftar isi lengkap semua file di project Stella untuk memudahkan navigasi.
> Last updated: February 19, 2026

---

## 📋 Quick Links

| Section       | Description           | Link                                         |
| ------------- | --------------------- | -------------------------------------------- |
| 📚 Docs       | PRD & Specs           | [docs/](#-docs-documentation)                |
| 🎨 App        | Pages & API Routes    | [app/](#-app-nextjs-app-router)              |
| 🧩 Components | React Components      | [components/](#-components-react-components) |
| 🔧 Lib        | Business Logic        | [lib/](#-lib-library--services)              |
| 🗃️ Types      | TypeScript Interfaces | [type/](#-type-typescript-interfaces)        |
| 🪝 Hooks      | Custom React Hooks    | [hooks/](#-hooks-custom-hooks)               |

---

## 📚 Docs (Documentation)

Dokumentasi produk dan teknis.

| File                                                  | Description                         |
| ----------------------------------------------------- | ----------------------------------- |
| [prd-linkedin-search.md](docs/prd-linkedin-search.md) | PRD fitur LinkedIn Profile Search   |
| [spec-1-database-api.md](docs/spec-1-database-api.md) | Spec: Database & API endpoints      |
| [spec-2-tool-calling.md](docs/spec-2-tool-calling.md) | Spec: Groq Tool Calling integration |
| [spec-3-frontend-ui.md](docs/spec-3-frontend-ui.md)   | Spec: Frontend UI components        |
| [apify.md](docs/apify.md)                             | Dokumentasi Apify Actor             |
| [apify-endpoint.md](docs/apify-endpoint.md)           | Apify endpoint reference            |

---

## 🎨 App (Next.js App Router)

### Pages

| Path                               | Description   |
| ---------------------------------- | ------------- |
| [app/page.tsx](app/page.tsx)       | Landing page  |
| [app/layout.tsx](app/layout.tsx)   | Root layout   |
| [app/globals.css](app/globals.css) | Global styles |

#### Auth Pages

| Path                                                     | Description         |
| -------------------------------------------------------- | ------------------- |
| [app/auth/layout.tsx](app/auth/layout.tsx)               | Auth layout         |
| [app/auth/login/page.tsx](app/auth/login/page.tsx)       | Login page          |
| [app/auth/register/page.tsx](app/auth/register/page.tsx) | Register page       |
| [app/auth/account/page.tsx](app/auth/account/page.tsx)   | Account settings    |
| [app/auth/keys/page.tsx](app/auth/keys/page.tsx)         | API keys management |

#### Project Pages

| Path                                                   | Description                     |
| ------------------------------------------------------ | ------------------------------- |
| [app/project/[id]/page.tsx](app/project/[id]/page.tsx) | Project detail (chat + results) |

#### Payment Pages

| Path                                                           | Description    |
| -------------------------------------------------------------- | -------------- |
| [app/pricing/page.tsx](app/pricing/page.tsx)                   | Pricing page   |
| [app/payment/plan/page.tsx](app/payment/plan/page.tsx)         | Plan selection |
| [app/payment/checkout/page.tsx](app/payment/checkout/page.tsx) | Checkout page  |
| [app/payment/status/page.tsx](app/payment/status/page.tsx)     | Payment status |

### API Routes

#### Auth

| Method | Endpoint             | File                                                             |
| ------ | -------------------- | ---------------------------------------------------------------- |
| POST   | `/api/auth/login`    | [app/api/auth/login/route.ts](app/api/auth/login/route.ts)       |
| POST   | `/api/auth/logout`   | [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts)     |
| POST   | `/api/auth/register` | [app/api/auth/register/route.ts](app/api/auth/register/route.ts) |
| GET    | `/api/auth/user`     | [app/api/auth/user/route.ts](app/api/auth/user/route.ts)         |

#### Chat

| Method | Endpoint         | File                                                     |
| ------ | ---------------- | -------------------------------------------------------- |
| POST   | `/api/chat/groq` | [app/api/chat/groq/route.ts](app/api/chat/groq/route.ts) |

#### LinkedIn

| Method | Endpoint                 | File                                                                     |
| ------ | ------------------------ | ------------------------------------------------------------------------ |
| POST   | `/api/linkedin/search`   | [app/api/linkedin/search/route.ts](app/api/linkedin/search/route.ts)     |
| GET    | `/api/linkedin/results`  | [app/api/linkedin/results/route.ts](app/api/linkedin/results/route.ts)   |
| GET    | `/api/linkedin/export`   | [app/api/linkedin/export/route.ts](app/api/linkedin/export/route.ts)     |
| GET    | `/api/linkedin/searches` | [app/api/linkedin/searches/route.ts](app/api/linkedin/searches/route.ts) |

#### Organization

| Method | Endpoint                   | File                                                                         |
| ------ | -------------------------- | ---------------------------------------------------------------------------- |
| POST   | `/api/organization/create` | [app/api/organization/create/route.ts](app/api/organization/create/route.ts) |

#### Payment

| Method | Endpoint                | File                                                                   |
| ------ | ----------------------- | ---------------------------------------------------------------------- |
| GET    | `/api/payment/plan`     | [app/api/payment/plan/route.ts](app/api/payment/plan/route.ts)         |
| POST   | `/api/payment/checkout` | [app/api/payment/checkout/route.ts](app/api/payment/checkout/route.ts) |
| GET    | `/api/payment/status`   | [app/api/payment/status/route.ts](app/api/payment/status/route.ts)     |

#### Project

| Method | Endpoint              | File                                                               |
| ------ | --------------------- | ------------------------------------------------------------------ |
| GET    | `/api/project/list`   | [app/api/project/list/route.ts](app/api/project/list/route.ts)     |
| GET    | `/api/project/detail` | [app/api/project/detail/route.ts](app/api/project/detail/route.ts) |

---

## 🧩 Components (React Components)

### UI Components (`components/ui/`)

Komponen UI primitif dari shadcn/ui.

| File                                                     | Component      |
| -------------------------------------------------------- | -------------- |
| [accordion.tsx](components/ui/accordion.tsx)             | Accordion      |
| [alert.tsx](components/ui/alert.tsx)                     | Alert          |
| [alert-dialog.tsx](components/ui/alert-dialog.tsx)       | AlertDialog    |
| [aspect-ratio.tsx](components/ui/aspect-ratio.tsx)       | AspectRatio    |
| [avatar.tsx](components/ui/avatar.tsx)                   | Avatar         |
| [badge.tsx](components/ui/badge.tsx)                     | Badge          |
| [breadcrumb.tsx](components/ui/breadcrumb.tsx)           | Breadcrumb     |
| [button.tsx](components/ui/button.tsx)                   | Button         |
| [button-group.tsx](components/ui/button-group.tsx)       | ButtonGroup    |
| [calendar.tsx](components/ui/calendar.tsx)               | Calendar       |
| [card.tsx](components/ui/card.tsx)                       | Card           |
| [carousel.tsx](components/ui/carousel.tsx)               | Carousel       |
| [chart.tsx](components/ui/chart.tsx)                     | Chart          |
| [checkbox.tsx](components/ui/checkbox.tsx)               | Checkbox       |
| [collapsible.tsx](components/ui/collapsible.tsx)         | Collapsible    |
| [combobox.tsx](components/ui/combobox.tsx)               | Combobox       |
| [command.tsx](components/ui/command.tsx)                 | Command        |
| [context-menu.tsx](components/ui/context-menu.tsx)       | ContextMenu    |
| [dialog.tsx](components/ui/dialog.tsx)                   | Dialog         |
| [direction.tsx](components/ui/direction.tsx)             | Direction      |
| [drawer.tsx](components/ui/drawer.tsx)                   | Drawer         |
| [dropdown-menu.tsx](components/ui/dropdown-menu.tsx)     | DropdownMenu   |
| [empty.tsx](components/ui/empty.tsx)                     | Empty          |
| [field.tsx](components/ui/field.tsx)                     | Field          |
| [form.tsx](components/ui/form.tsx)                       | Form           |
| [hover-card.tsx](components/ui/hover-card.tsx)           | HoverCard      |
| [input.tsx](components/ui/input.tsx)                     | Input          |
| [input-group.tsx](components/ui/input-group.tsx)         | InputGroup     |
| [input-otp.tsx](components/ui/input-otp.tsx)             | InputOTP       |
| [item.tsx](components/ui/item.tsx)                       | Item           |
| [kbd.tsx](components/ui/kbd.tsx)                         | Kbd            |
| [label.tsx](components/ui/label.tsx)                     | Label          |
| [menubar.tsx](components/ui/menubar.tsx)                 | Menubar        |
| [native-select.tsx](components/ui/native-select.tsx)     | NativeSelect   |
| [navigation-menu.tsx](components/ui/navigation-menu.tsx) | NavigationMenu |
| [pagination.tsx](components/ui/pagination.tsx)           | Pagination     |
| [popover.tsx](components/ui/popover.tsx)                 | Popover        |
| [progress.tsx](components/ui/progress.tsx)               | Progress       |
| [radio-group.tsx](components/ui/radio-group.tsx)         | RadioGroup     |
| [resizable.tsx](components/ui/resizable.tsx)             | Resizable      |
| [scroll-area.tsx](components/ui/scroll-area.tsx)         | ScrollArea     |
| [select.tsx](components/ui/select.tsx)                   | Select         |
| [separator.tsx](components/ui/separator.tsx)             | Separator      |
| [sheet.tsx](components/ui/sheet.tsx)                     | Sheet          |
| [sidebar.tsx](components/ui/sidebar.tsx)                 | Sidebar        |
| [skeleton.tsx](components/ui/skeleton.tsx)               | Skeleton       |
| [slider.tsx](components/ui/slider.tsx)                   | Slider         |
| [sonner.tsx](components/ui/sonner.tsx)                   | Sonner (Toast) |
| [spinner.tsx](components/ui/spinner.tsx)                 | Spinner        |
| [switch.tsx](components/ui/switch.tsx)                   | Switch         |
| [table.tsx](components/ui/table.tsx)                     | Table          |
| [tabs.tsx](components/ui/tabs.tsx)                       | Tabs           |
| [textarea.tsx](components/ui/textarea.tsx)               | Textarea       |
| [toggle.tsx](components/ui/toggle.tsx)                   | Toggle         |
| [toggle-group.tsx](components/ui/toggle-group.tsx)       | ToggleGroup    |
| [tooltip.tsx](components/ui/tooltip.tsx)                 | Tooltip        |

### Magic UI (`components/magic-ui/`)

Animasi dan efek visual.

| File                                                                         | Component                     |
| ---------------------------------------------------------------------------- | ----------------------------- |
| [animated-gradient-text.tsx](components/magic-ui/animated-gradient-text.tsx) | Animated gradient text effect |

### Pabrik Startup Components (`components/pabrik-startup/`)

Komponen bisnis logic aplikasi.

#### Auth

| File                                                                       | Component     |
| -------------------------------------------------------------------------- | ------------- |
| [auth/auth-login.tsx](components/pabrik-startup/auth/auth-login.tsx)       | Login form    |
| [auth/auth-register.tsx](components/pabrik-startup/auth/auth-register.tsx) | Register form |

#### Chat

| File                                                                     | Component           |
| ------------------------------------------------------------------------ | ------------------- |
| [chat/chat-section.tsx](components/pabrik-startup/chat/chat-section.tsx) | Main chat container |
| [chat/chat-bubble.tsx](components/pabrik-startup/chat/chat-bubble.tsx)   | Chat message bubble |
| [chat/chat-input.tsx](components/pabrik-startup/chat/chat-input.tsx)     | Chat input field    |

#### Header

| File                                                                                             | Component              |
| ------------------------------------------------------------------------------------------------ | ---------------------- |
| [header/header.tsx](components/pabrik-startup/header/header.tsx)                                 | App header             |
| [header/editable-project-title.tsx](components/pabrik-startup/header/editable-project-title.tsx) | Editable project title |

#### LinkedIn Results

| File                                                                                 | Component                   |
| ------------------------------------------------------------------------------------ | --------------------------- |
| [linkedin/index.ts](components/pabrik-startup/linkedin/index.ts)                     | Exports                     |
| [linkedin/results-panel.tsx](components/pabrik-startup/linkedin/results-panel.tsx)   | Results panel container     |
| [linkedin/results-header.tsx](components/pabrik-startup/linkedin/results-header.tsx) | Results header with actions |
| [linkedin/results-table.tsx](components/pabrik-startup/linkedin/results-table.tsx)   | Results table               |
| [linkedin/profile-row.tsx](components/pabrik-startup/linkedin/profile-row.tsx)       | Single profile row          |
| [linkedin/profile-avatar.tsx](components/pabrik-startup/linkedin/profile-avatar.tsx) | Profile avatar              |

#### Sidebar

| File                                                                                           | Component             |
| ---------------------------------------------------------------------------------------------- | --------------------- |
| [sidebar/sidebar.tsx](components/pabrik-startup/sidebar/sidebar.tsx)                           | Main sidebar          |
| [sidebar/sidebar-project.tsx](components/pabrik-startup/sidebar/sidebar-project.tsx)           | Project list          |
| [sidebar/sidebar-organization.tsx](components/pabrik-startup/sidebar/sidebar-organization.tsx) | Organization selector |
| [sidebar/sidebar-org-dialog.tsx](components/pabrik-startup/sidebar/sidebar-org-dialog.tsx)     | Create org dialog     |
| [sidebar/sidebar-user.tsx](components/pabrik-startup/sidebar/sidebar-user.tsx)                 | User menu             |

#### Subs (Subscription/Payment)

| File                                                                                | Component         |
| ----------------------------------------------------------------------------------- | ----------------- |
| [subs/subs-plan.tsx](components/pabrik-startup/subs/subs-plan.tsx)                  | Plan selector     |
| [subs/subs-pricing.tsx](components/pabrik-startup/subs/subs-pricing.tsx)            | Pricing cards     |
| [subs/subs-checkout.tsx](components/pabrik-startup/subs/subs-checkout.tsx)          | Checkout flow     |
| [subs/subs-payment.tsx](components/pabrik-startup/subs/subs-plan-payment.tsx)       | Payment component |
| [subs/subs-status.tsx](components/pabrik-startup/subs/subs-status.tsx)              | Payment status    |
| [subs/subs-usage.tsx](components/pabrik-startup/subs/subs-plan-usage.tsx)           | Usage display     |
| [subs/subs-pagination.tsx](components/pabrik-startup/subs/subs-plan-pagination.tsx) | Plan pagination   |

#### Marketing

| File                                                               | Component          |
| ------------------------------------------------------------------ | ------------------ |
| [marketing/chip.tsx](components/pabrik-startup/marketing/chip.tsx) | Marketing chip/tag |

---

## 🔧 Lib (Library & Services)

### Supabase

| File                                             | Description                  |
| ------------------------------------------------ | ---------------------------- |
| [lib/supabase/client.ts](lib/supabase/client.ts) | Client-side Supabase client  |
| [lib/supabase/server.ts](lib/supabase/server.ts) | Server-side Supabase client  |
| [lib/supabase/proxy.ts](lib/supabase/proxy.ts)   | Supabase proxy configuration |

### Groq (LLM Integration)

| File                                                                           | Description                           |
| ------------------------------------------------------------------------------ | ------------------------------------- |
| [lib/groq/index.ts](lib/groq/index.ts)                                         | Groq exports                          |
| [lib/groq/prompts/system.ts](lib/groq/prompts/system.ts)                       | System prompt untuk chat              |
| [lib/groq/tools/linkedin-search.ts](lib/groq/tools/linkedin-search.ts)         | Tool definition untuk LinkedIn search |
| [lib/groq/executors/linkedin-search.ts](lib/groq/executors/linkedin-search.ts) | Executor untuk LinkedIn tool call     |
| [lib/groq/executors/types.ts](lib/groq/executors/types.ts)                     | Types untuk executors                 |

### LinkedIn (Scraping & Search)

| File                                                             | Description                              |
| ---------------------------------------------------------------- | ---------------------------------------- |
| [lib/linkedin/index.ts](lib/linkedin/index.ts)                   | LinkedIn exports                         |
| [lib/linkedin/apify-client.ts](lib/linkedin/apify-client.ts)     | Apify API client untuk LinkedIn scraping |
| [lib/linkedin/search-service.ts](lib/linkedin/search-service.ts) | Business logic untuk search              |
| [lib/linkedin/result-mapper.ts](lib/linkedin/result-mapper.ts)   | Transform Apify response ke app model    |
| [lib/linkedin/csv-exporter.ts](lib/linkedin/csv-exporter.ts)     | Generate CSV dari results                |

### Utils

| File                         | Description                  |
| ---------------------------- | ---------------------------- |
| [lib/utils.ts](lib/utils.ts) | Utility functions (cn, etc.) |

---

## 🗃️ Type (TypeScript Interfaces)

### Interfaces

| File                                                             | Description                            |
| ---------------------------------------------------------------- | -------------------------------------- |
| [type/interface/linkedin.ts](type/interface/linkedin.ts)         | LinkedIn types (Profile, Search, etc.) |
| [type/interface/chat.ts](type/interface/chat.ts)                 | Chat message types                     |
| [type/interface/project.ts](type/interface/project.ts)           | Project types                          |
| [type/interface/organization.ts](type/interface/organization.ts) | Organization types                     |
| [type/interface/user.ts](type/interface/user.ts)                 | User types                             |
| [type/interface/member.ts](type/interface/member.ts)             | Team member types                      |
| [type/interface/payment.ts](type/interface/payment.ts)           | Payment types                          |
| [type/interface/credit.ts](type/interface/credit.ts)             | Credit/usage types                     |
| [type/interface/usage.ts](type/interface/usage.ts)               | Usage tracking types                   |

### Migrations

| File                                                                                 | Description    |
| ------------------------------------------------------------------------------------ | -------------- |
| [type/migration/2026000_init_tables.sql](type/migration/2026000_init_tables.sql)     | Initial tables |
| [type/migration/2026001_enable_rls.sql](type/migration/2026001_enable_rls.sql)       | RLS policies   |
| [type/migration/2026002_billing_rules.sql](type/migration/2026002_billing_rules.sql) | Billing rules  |

---

## 🪝 Hooks (Custom Hooks)

| File                                                         | Description                      |
| ------------------------------------------------------------ | -------------------------------- |
| [hooks/use-mobile.ts](hooks/use-mobile.ts)                   | Detect mobile viewport           |
| [hooks/use-linkedin-search.ts](hooks/use-linkedin-search.ts) | LinkedIn search state management |

---

## 🗄️ Supabase Migrations

| File                                                                                                                           | Description                          |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| [supabase/migrations/20260216000000_create_linkedin_tables.sql](supabase/migrations/20260216000000_create_linkedin_tables.sql) | LinkedIn tables (searches, profiles) |

---

## ⚙️ Config Files

| File                               | Description                    |
| ---------------------------------- | ------------------------------ |
| [package.json](package.json)       | NPM dependencies & scripts     |
| [tsconfig.json](tsconfig.json)     | TypeScript config              |
| [next.config.ts](next.config.ts)   | Next.js config                 |
| [components.json](components.json) | shadcn/ui config               |
| [.env.example](.env.example)       | Environment variables template |
| [.gitignore](.gitignore)           | Git ignore rules               |
| [proxy.ts](proxy.ts)               | Proxy configuration            |

---

## 📊 File Statistics

| Category               | Count    |
| ---------------------- | -------- |
| Pages (tsx)            | 13       |
| API Routes (ts)        | 14       |
| UI Components          | 54       |
| Business Components    | 22       |
| Lib/Services           | 12       |
| Type Definitions       | 10       |
| Hooks                  | 2        |
| Docs                   | 6        |
| Migrations             | 4        |
| **Total Source Files** | **~137** |

---

## 🚀 Quick Navigation by Feature

### LinkedIn Search Feature

```
docs/prd-linkedin-search.md          ← PRD
docs/spec-1-database-api.md          ← Spec: Backend
docs/spec-2-tool-calling.md          ← Spec: Tool Calling
docs/spec-3-frontend-ui.md           ← Spec: Frontend

app/api/linkedin/search/route.ts     ← API: Run search
app/api/linkedin/results/route.ts    ← API: Get results
app/api/linkedin/export/route.ts     ← API: Export CSV
app/api/linkedin/searches/route.ts   ← API: List searches

lib/linkedin/apify-client.ts         ← Apify integration
lib/linkedin/search-service.ts       ← Search logic
lib/linkedin/result-mapper.ts        ← Data transform
lib/linkedin/csv-exporter.ts         ← CSV export

lib/groq/tools/linkedin-search.ts    ← Tool definition
lib/groq/executors/linkedin-search.ts ← Tool executor

components/pabrik-startup/linkedin/  ← UI Components
hooks/use-linkedin-search.ts         ← React hook

type/interface/linkedin.ts           ← Types
```

### Chat Feature

```
app/api/chat/groq/route.ts           ← API: Chat with Groq

lib/groq/prompts/system.ts           ← System prompt
lib/groq/tools/                      ← Tool definitions
lib/groq/executors/                  ← Tool executors

components/pabrik-startup/chat/      ← UI Components

type/interface/chat.ts               ← Types
```

### Auth Feature

```
app/api/auth/login/route.ts          ← API: Login
app/api/auth/register/route.ts       ← API: Register
app/api/auth/logout/route.ts         ← API: Logout
app/api/auth/user/route.ts           ← API: Get user

app/auth/login/page.tsx              ← Login page
app/auth/register/page.tsx           ← Register page
app/auth/account/page.tsx            ← Account page

components/pabrik-startup/auth/      ← Auth forms
```

---

_Generated for Stella Project - LinkedIn Profile Search App_
