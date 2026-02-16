# Engineering Specification: Frontend UI

## Informasi Dokumen

| Field         | Value                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Nama Feature  | LinkedIn Profile Search - Frontend UI                                                                  |
| Versi Spec    | 1.0                                                                                                    |
| Status        | Draft                                                                                                  |
| Author        | Pi                                                                                                     |
| Reviewer      | -                                                                                                      |
| Tanggal       | 16 Februari 2026                                                                                       |
| PRD Reference | [prd-linkedin-search.md](./prd-linkedin-search.md)                                                     |
| Related Specs | [spec-1-database-api.md](./spec-1-database-api.md), [spec-2-tool-calling.md](./spec-2-tool-calling.md) |

---

## 1. Overview

### 1.1 Summary

Spec ini mencakup implementasi frontend untuk fitur LinkedIn Profile Search, termasuk modifikasi layout project detail page untuk 2-panel view (chat + results table), komponen tabel hasil, loading states, dan export functionality.

### 1.2 Goals

- Membuat 2-panel layout di project detail page
- Membuat komponen `LinkedInResultsTable` untuk menampilkan hasil pencarian
- Mengintegrasikan dengan chat untuk trigger pencarian
- Implementasi loading states dan error handling
- CSV export functionality

### 1.3 Non-Goals

- Backend API (covered in Spec 1)
- Tool calling logic (covered in Spec 2)
- Advanced filtering UI (future enhancement)
- Profile detail modal (future enhancement)
- Real-time WebSocket updates

---

## 2. Component Architecture

### 2.1 Component Tree

```
ProjectDetailPage
└── Card (flex container)
    ├── ChatSection (existing, modified)
    │   ├── CardContent
    │   │   └── ChatBubble
    │   └── CardFooter
    │       └── ChatInput
    │
    └── LinkedInResultsPanel (new)
        ├── ResultsHeader
        │   ├── Title + Count
        │   └── Action Buttons (Export, Refresh)
        └── ResultsTable
            ├── TableHeader
            └── TableBody
                └── ProfileRow[]
```

### 2.2 File Structure

```
stella/
├── app/
│   └── project/
│       └── [id]/
│           └── page.tsx          # Modified - add panel
├── components/
│   └── pabrik-startup/
│       ├── chat/
│       │   ├── chat-section.tsx  # Modified - width constraint
│       │   ├── chat-bubble.tsx   # Modified - handle tool messages
│       │   └── chat-input.tsx    # Existing
│       └── linkedin/             # New directory
│           ├── results-panel.tsx
│           ├── results-table.tsx
│           ├── results-header.tsx
│           ├── profile-row.tsx
│           └── profile-avatar.tsx
└── hooks/
    └── use-linkedin-search.ts    # New hook
```

---

## 3. Layout Implementation

### 3.1 Modified Project Detail Page

```tsx
// app/project/[id]/page.tsx

import ChatSection from "@/components/pabrik-startup/chat/chat-section";
import LinkedInResultsPanel from "@/components/pabrik-startup/linkedin/results-panel";
import { Card } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Card className="flex flex-1 p-0 rounded-none overflow-hidden">
      <ChatSection projectId={id} />
      <LinkedInResultsPanel projectId={id} />
    </Card>
  );
}

export default ProjectDetailPage;
```

### 3.2 Modified Chat Section

```tsx
// components/pabrik-startup/chat/chat-section.tsx

"use client";

import ChatInput from "./chat-input";
import { Card, CardContent, CardFooter } from "../../ui/card";
import ChatBubble from "./chat-bubble";
import { Chat } from "@/type/interface/chat";
import { useEffect, useState } from "react";
import axios from "axios";

interface ChatSectionProps {
  projectId?: string;
  onToolCall?: (toolCall: any) => void; // New prop
}

export default function ChatSection({
  projectId,
  onToolCall,
}: ChatSectionProps) {
  const [messages, setMessages] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchProjectChats = async () => {
      try {
        if (!projectId) return;
        const response = await axios.get("/api/project/detail", {
          params: { project_id: projectId },
        });
        if (response.data.status === "success") {
          setMessages(response.data.chats);
        }
      } catch {}
    };

    fetchProjectChats();
  }, [projectId]);

  return (
    <Card className="w-[400px] min-w-[350px] max-w-[500px] shrink-0 h-[calc(100vh-64px)] flex flex-col rounded-none shadow-none border-r">
      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4 px-4">
        <ChatBubble messages={messages} />
      </CardContent>
      <CardFooter className="p-4">
        <ChatInput
          messages={messages}
          setMessages={setMessages}
          projectId={projectId}
          onToolCall={onToolCall}
        />
      </CardFooter>
    </Card>
  );
}
```

---

## 4. LinkedIn Results Panel

### 4.1 Main Panel Component

```tsx
// components/pabrik-startup/linkedin/results-panel.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ResultsHeader } from "./results-header";
import { ResultsTable } from "./results-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkedInSearch } from "@/hooks/use-linkedin-search";
import { LinkedInProfile } from "@/type/interface/linkedin";

interface LinkedInResultsPanelProps {
  projectId: string;
}

export function LinkedInResultsPanel({ projectId }: LinkedInResultsPanelProps) {
  const {
    searches,
    currentSearch,
    profiles,
    loading,
    error,
    fetchSearches,
    exportCSV,
  } = useLinkedInSearch(projectId);

  useEffect(() => {
    fetchSearches();
  }, [projectId]);

  if (loading && profiles.length === 0) {
    return (
      <Card className="flex-1 h-[calc(100vh-64px)] rounded-none shadow-none">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex-1 h-[calc(100vh-64px)] rounded-none shadow-none flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Error loading results</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card className="flex-1 h-[calc(100vh-64px)] rounded-none shadow-none flex items-center justify-center">
        <div className="text-center text-muted-foreground max-w-sm px-8">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium">LinkedIn Profile Search</p>
          <p className="text-sm mt-2">
            Ketik pencarian di chat untuk menemukan profil LinkedIn. Contoh:
            "Cari AI engineer di Dubai"
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 h-[calc(100vh-64px)] rounded-none shadow-none flex flex-col">
      <ResultsHeader
        searchQuery={currentSearch?.query || ""}
        totalResults={profiles.length}
        onExport={() => exportCSV(currentSearch?.id)}
        onRefresh={fetchSearches}
      />
      <CardContent className="flex-1 overflow-auto p-0">
        <ResultsTable profiles={profiles} />
      </CardContent>
    </Card>
  );
}
```

### 4.2 Results Header

```tsx
// components/pabrik-startup/linkedin/results-header.tsx

"use client";

import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Download, RefreshCw } from "lucide-react";
import { useState } from "react";

interface ResultsHeaderProps {
  searchQuery: string;
  totalResults: number;
  onExport: () => void;
  onRefresh: () => void;
}

export function ResultsHeader({
  searchQuery,
  totalResults,
  onExport,
  onRefresh,
}: ResultsHeaderProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between space-y-0">
      <div>
        <h3 className="text-sm font-medium">LinkedIn Results</h3>
        <p className="text-xs text-muted-foreground">
          {totalResults} profiles found for "{searchQuery}"
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh} className="h-8">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleExport}
          disabled={exporting || totalResults === 0}
          className="h-8"
        >
          <Download className="h-4 w-4 mr-1" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
    </CardHeader>
  );
}
```

### 4.3 Results Table

```tsx
// components/pabrik-startup/linkedin/results-table.tsx

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProfileRow } from "./profile-row";
import { LinkedInProfile } from "@/type/interface/linkedin";

interface ResultsTableProps {
  profiles: LinkedInProfile[];
}

export function ResultsTable({ profiles }: ResultsTableProps) {
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <ProfileRow key={profile.id} profile={profile} />
        ))}
      </TableBody>
    </Table>
  );
}
```

### 4.4 Profile Row

```tsx
// components/pabrik-startup/linkedin/profile-row.tsx

"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "./profile-avatar";
import { ExternalLink, Copy } from "lucide-react";
import { LinkedInProfile } from "@/type/interface/linkedin";
import { toast } from "sonner";

interface ProfileRowProps {
  profile: LinkedInProfile;
}

export function ProfileRow({ profile }: ProfileRowProps) {
  const position = profile.currentPositions?.[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <TableRow className="group">
      <TableCell>
        <ProfileAvatar
          src={profile.pictureUrl}
          name={`${profile.firstName} ${profile.lastName}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {profile.firstName} {profile.lastName}
          </span>
          <div className="flex items-center gap-1">
            {profile.premium && (
              <Badge variant="secondary" className="text-xs py-0 px-1">
                Premium
              </Badge>
            )}
            {profile.openProfile && (
              <Badge variant="outline" className="text-xs py-0 px-1">
                Open
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm">{position?.title || "-"}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm">{position?.companyName || "-"}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {profile.location || "-"}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => copyToClipboard(profile.linkedinUrl)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
```

### 4.5 Profile Avatar

```tsx
// components/pabrik-startup/linkedin/profile-avatar.tsx

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfileAvatarProps {
  src?: string | null;
  name: string;
}

export function ProfileAvatar({ src, name }: ProfileAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className="h-10 w-10">
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
        {initials || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
```

---

## 5. Custom Hook

### 5.1 useLinkedInSearch Hook

```tsx
// hooks/use-linkedin-search.ts

"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { LinkedInProfile, LinkedInSearch } from "@/type/interface/linkedin";

interface UseLinkedInSearchReturn {
  searches: LinkedInSearch[];
  currentSearch: LinkedInSearch | null;
  profiles: LinkedInProfile[];
  loading: boolean;
  error: string | null;
  fetchSearches: () => Promise<void>;
  exportCSV: (searchId?: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

export function useLinkedInSearch(projectId: string): UseLinkedInSearchReturn {
  const [searches, setSearches] = useState<LinkedInSearch[]>([]);
  const [currentSearch, setCurrentSearch] = useState<LinkedInSearch | null>(
    null
  );
  const [profiles, setProfiles] = useState<LinkedInProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearches = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/linkedin/searches", {
        params: { projectId },
      });

      if (response.data.status === "success") {
        const searchesData = response.data.data.searches;
        setSearches(searchesData);

        // Get profiles from most recent search
        if (searchesData.length > 0) {
          const latestSearch = searchesData[0];
          setCurrentSearch(latestSearch);

          const resultsResponse = await axios.get("/api/linkedin/results", {
            params: { searchId: latestSearch.id },
          });

          if (resultsResponse.data.status === "success") {
            setProfiles(resultsResponse.data.data.results);
          }
        }
      }
    } catch (err) {
      setError("Failed to load search results");
      console.error("Fetch searches error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const exportCSV = useCallback(
    async (searchId?: string) => {
      const id = searchId || currentSearch?.id;
      if (!id) return;

      try {
        const response = await axios.get(
          `/api/linkedin/export?searchId=${id}`,
          {
            responseType: "blob",
          }
        );

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `linkedin-search-${id.slice(0, 8)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Export error:", err);
        throw err;
      }
    },
    [currentSearch]
  );

  const refreshProfiles = useCallback(async () => {
    await fetchSearches();
  }, [fetchSearches]);

  return {
    searches,
    currentSearch,
    profiles,
    loading,
    error,
    fetchSearches,
    exportCSV,
    refreshProfiles,
  };
}
```

---

## 6. Chat Integration

### 6.1 Modified Chat Bubble (Tool Messages)

```tsx
// components/pabrik-startup/chat/chat-bubble.tsx

"use client";

import { useRef, useEffect } from "react";
import { Bot, User, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Item } from "../../ui/item";
import { Chat } from "@/type/interface/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  messages: Chat[];
}

function ChatBubble({ messages }: ChatBubbleProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {messages.map((msg, i) => (
        <Item
          key={i}
          className={cn(
            "flex flex-col p-0 gap-1",
            msg.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          <Item className="p-0 w-full">
            <Avatar
              className={cn(msg.role === "assistant" ? "mr-auto" : "ml-auto")}
            >
              <AvatarFallback
                className={
                  msg.role === "assistant"
                    ? "bg-purple-100 text-purple-600 border-purple-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }
              >
                {msg.role === "assistant" ? (
                  <Bot size={16} />
                ) : (
                  <User size={16} />
                )}
              </AvatarFallback>
            </Avatar>
          </Item>

          <Item
            className={cn(
              "rounded-md text-sm w-full",
              msg.role === "assistant"
                ? "p-0"
                : "bg-primary text-primary-foreground rounded-tr-none p-3"
            )}
          >
            {/* Tool call indicator */}
            {msg.tool_calls && msg.tool_calls.length > 0 && (
              <div className="mb-2 p-2 bg-muted rounded-md text-xs flex items-center gap-2">
                {msg.tool_calls.some(
                  (tc: any) => tc.name === "search_linkedin_profiles"
                ) && (
                  <>
                    <Search className="h-3 w-3" />
                    <span>Searching LinkedIn profiles...</span>
                  </>
                )}
              </div>
            )}

            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content || ""}
            </ReactMarkdown>
          </Item>
        </Item>
      ))}
      <Item ref={messagesEndRef} />
    </>
  );
}

export default ChatBubble;
```

### 6.2 Chat Input with Tool Call Handling

```tsx
// components/pabrik-startup/chat/chat-input.tsx

"use client";

import { ArrowUpIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { Chat } from "@/type/interface/chat";
import { Project } from "@/type/interface/project";

const MODELS = [
  {
    label: "Llama 3.3 70B",
    value: "llama-3.3-70b-versatile",
    provider: "groq",
  },
];

interface ChatInputProps {
  messages?: Chat[];
  setMessages?: React.Dispatch<React.SetStateAction<Chat[]>>;
  projectId?: string;
  onToolCall?: (toolCall: any) => void;
}

export default function ChatInput({
  messages,
  setMessages,
  projectId,
  onToolCall,
}: ChatInputProps) {
  const [userInput, setUserInput] = useState<string>("");
  const [model, setModel] = useState(MODELS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, activeOrg, projects, setProjects } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    if (!userInput.trim()) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    e.preventDefault();
    setLoading(true);
    setError(null);

    // Add user message to UI immediately
    if (setMessages) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          project_id: activeOrg?.id || "",
          role: "user",
          content: userInput,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    try {
      const formatMessages = (messages || []).map((msg) => ({
        role: msg.role,
        content: msg.content,
        tool_calls: msg.tool_calls,
      }));

      const newMessages = [
        ...formatMessages,
        {
          role: "user",
          content: userInput,
        },
      ];

      const response = await axios.post("/api/chat/groq", {
        messages: newMessages,
        model: model.value,
        org_id: !projectId ? activeOrg?.id : null,
        project_id: projectId,
      });

      // Handle new project creation
      if (response.data.project !== null) {
        setProjects([...projects, response.data.project as Project]);
        router.push(`/project/${response.data.project.id}`);
      }

      // Add assistant message
      if (setMessages) {
        const assistantMessage: Chat = {
          id: crypto.randomUUID(),
          project_id: activeOrg?.id || "",
          role: response.data.output.role,
          content: response.data.output.content,
          tool_calls: response.data.toolCalls?.map((tc: any) => ({
            id: crypto.randomUUID(),
            name: tc.name,
            arguments: JSON.stringify(tc.data),
          })),
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Notify parent of tool call (for refreshing results panel)
      if (onToolCall && response.data.toolCalls) {
        onToolCall(response.data.toolCalls);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || err.message || "Failed to send message"
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setUserInput("");
      setLoading(false);
    }
  };

  return (
    <>
      <InputGroup className="bg-background max-w-lg">
        <InputGroupTextarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
          placeholder="Type your message... (e.g., 'Cari AI engineer di Dubai')"
          disabled={loading}
        />
        <InputGroupAddon align="block-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton className="ml-auto text-xs" variant="ghost">
                {model.label}
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              {MODELS.map((m) => (
                <DropdownMenuItem key={m.value} onSelect={() => setModel(m)}>
                  {m.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Separator className="h-4!" orientation="vertical" />
          <InputGroupButton
            className="rounded-full"
            size="icon-xs"
            variant="default"
            onClick={handleSubmit}
            disabled={loading || !userInput.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpIcon />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </>
  );
}
```

---

## 7. State Management

### 7.1 Polling for Search Status

```tsx
// hooks/use-search-polling.ts

"use client";

import { useEffect, useRef } from "react";
import axios from "axios";

interface UseSearchPollingOptions {
  searchId: string | null;
  onComplete: () => void;
  interval?: number;
  enabled?: boolean;
}

export function useSearchPolling({
  searchId,
  onComplete,
  interval = 3000,
  enabled = true,
}: UseSearchPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchId || !enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get("/api/linkedin/results", {
          params: { searchId },
        });

        if (response.data.data.status === "completed") {
          onComplete();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [searchId, enabled, interval, onComplete]);
}
```

---

## 8. Loading States

### 8.1 Skeleton Components

```tsx
// components/pabrik-startup/linkedin/results-skeleton.tsx

export function ResultsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 8.2 Search In Progress Indicator

```tsx
// components/pabrik-startup/linkedin/search-progress.tsx

"use client";

import { Loader2, Search } from "lucide-react";

interface SearchProgressProps {
  query: string;
}

export function SearchProgress({ query }: SearchProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <Search className="h-6 w-6" />
      </div>
      <p className="text-lg font-medium">Searching LinkedIn...</p>
      <p className="text-sm">Finding profiles for "{query}"</p>
      <p className="text-xs mt-2">This may take up to 2 minutes</p>
    </div>
  );
}
```

---

## 9. Responsive Design

### 9.1 Breakpoints

```css
/* Mobile-first approach */

/* Default: Stack vertically on mobile */
.project-detail-container {
  @apply flex flex-col;
}

.chat-section {
  @apply w-full h-[50vh];
}

.results-panel {
  @apply w-full flex-1;
}

/* md (768px+): Side by side */
@screen md {
  .project-detail-container {
    @apply flex-row;
  }

  .chat-section {
    @apply w-[400px] h-[calc(100vh-64px)];
  }
}

/* lg (1024px+): Wider chat */
@screen lg {
  .chat-section {
    @apply w-[450px];
  }
}
```

### 9.2 Collapsible Results Panel (Mobile)

```tsx
// components/pabrik-startup/linkedin/collapsible-results.tsx

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CollapsibleResultsProps {
  children: React.ReactNode;
  resultCount: number;
}

export function CollapsibleResults({
  children,
  resultCount,
}: CollapsibleResultsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{resultCount} LinkedIn Results</span>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </Button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-[60vh] mt-2" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## 10. Accessibility

### 10.1 ARIA Labels

```tsx
// Profile row with accessibility
<TableRow
  role="row"
  aria-label={`${profile.firstName} ${profile.lastName}, ${position?.title} at ${position?.companyName}`}
>
  <TableCell role="cell">
    <img
      src={profile.pictureUrl}
      alt={`${profile.firstName} ${profile.lastName}'s profile picture`}
      className="h-10 w-10 rounded-full"
    />
  </TableCell>
  {/* ... */}
  <TableCell>
    <a
      href={profile.linkedinUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${profile.firstName}'s LinkedIn profile`}
    >
      <ExternalLink aria-hidden="true" />
      <span className="sr-only">View LinkedIn Profile</span>
    </a>
  </TableCell>
</TableRow>
```

### 10.2 Keyboard Navigation

```tsx
// Table with keyboard navigation
<Table
  role="grid"
  onKeyDown={(e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      // Handle row navigation
    }
    if (e.key === "Enter") {
      // Open selected profile
    }
  }}
>
  {/* ... */}
</Table>
```

---

## 11. Testing

### 11.1 Component Tests

```tsx
// __tests__/components/linkedin/results-table.test.tsx

import { render, screen } from "@testing-library/react";
import { ResultsTable } from "@/components/pabrik-startup/linkedin/results-table";
import { LinkedInProfile } from "@/type/interface/linkedin";

const mockProfiles: LinkedInProfile[] = [
  {
    id: "1",
    searchId: "search-1",
    linkedinId: "ABC123",
    linkedinUrl: "https://linkedin.com/in/test",
    firstName: "John",
    lastName: "Doe",
    summary: "Test summary",
    pictureUrl: null,
    location: "Dubai, UAE",
    currentPositions: [
      {
        title: "AI Engineer",
        companyName: "Tech Corp",
        tenureMonths: 12,
        startedOn: null,
        companyId: null,
        companyLinkedinUrl: null,
      },
    ],
    openProfile: false,
    premium: true,
    rawData: null,
    createdAt: "2026-02-16T00:00:00Z",
  },
];

describe("ResultsTable", () => {
  it("should render profile data correctly", () => {
    render(<ResultsTable profiles={mockProfiles} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("AI Engineer")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Dubai, UAE")).toBeInTheDocument();
  });

  it("should show Premium badge for premium members", () => {
    render(<ResultsTable profiles={mockProfiles} />);

    expect(screen.getByText("Premium")).toBeInTheDocument();
  });
});
```

### 11.2 Hook Tests

```tsx
// __tests__/hooks/use-linkedin-search.test.ts

import { renderHook, waitFor } from "@testing-library/react";
import { useLinkedInSearch } from "@/hooks/use-linkedin-search";
import axios from "axios";

jest.mock("axios");

describe("useLinkedInSearch", () => {
  it("should fetch searches and profiles on mount", async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        data: {
          searches: [{ id: "search-1", query: "test" }],
        },
      },
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        data: {
          results: [],
        },
      },
    });

    const { result } = renderHook(() => useLinkedInSearch("project-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.searches).toHaveLength(1);
  });
});
```

---

## 12. Dependencies

### 12.1 Required Packages

```json
{
  "dependencies": {
    // Already installed
    "axios": "^1.13.4",
    "lucide-react": "^0.563.0",
    "sonner": "^2.0.7",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.1",

    // Already installed (shadcn/ui)
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-dropdown-menu": "^2.1.16"
  }
}
```

### 12.2 shadcn/ui Components Needed

```bash
# Add if not already installed
npx shadcn@latest add table
npx shadcn@latest add skeleton
npx shadcn@latest add badge
```

---

## 13. Appendix

### 13.1 CSS Variables

```css
/* globals.css additions */

:root {
  /* LinkedIn-specific colors */
  --linkedin-primary: #0a66c2;
  --linkedin-primary-hover: #004182;
}

.linkedin-badge {
  @apply bg-[var(--linkedin-primary)] text-white;
}
```

### 13.2 Revision History

| Version | Date         | Author | Changes         |
| ------- | ------------ | ------ | --------------- |
| 1.0     | Feb 16, 2026 | Pi     | Initial version |
