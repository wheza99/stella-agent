"use client";

import { useEffect } from "react";
import { ResultsHeader } from "./results-header";
import { ResultsTable } from "./results-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkedInSearch } from "@/hooks/use-linkedin-search";
import { Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LinkedInResultsPanelProps {
  projectId: string;
}

export function LinkedInResultsPanel({ projectId }: LinkedInResultsPanelProps) {
  const {
    currentSearch,
    profiles,
    loading,
    fetchSearches,
    exportCSV,
  } = useLinkedInSearch(projectId);

  useEffect(() => {
    fetchSearches();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading skeleton
  if (loading && profiles.length === 0) {
    return (
      <Card className="w-75 shrink-0 h-[calc(100vh-64px)] flex flex-col rounded-none shadow-none gap-2 pt-2">
        <div className="shrink-0 p-4 border-b bg-muted/30">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-auto min-h-0">
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
      </Card>
    );
  }

  // Empty state
  if (profiles.length === 0) {
    return (
      <Card className="w-75 shrink-0 h-[calc(100vh-64px)] flex flex-col rounded-none shadow-none gap-2 pt-2">
        <div className="text-center text-muted-foreground max-w-sm px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium mb-2">LinkedIn Profile Search</p>
          <p className="text-sm mb-4">
            Cari profil LinkedIn dengan mengetik di chat.
          </p>
          <div className="text-xs text-muted-foreground/70 space-y-1">
            <p className="flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Contoh: "Cari AI engineer di Dubai"</span>
            </p>
            <p>"Find software developers in Singapore"</p>
            <p>"Search for marketing managers in Indonesia"</p>
          </div>
        </div>
      </Card>
    );
  }

  // Results view
  return (
    <Card className="flex-1 shrink-0 h-[calc(100vh-64px)] flex flex-col rounded-none shadow-none gap-2 pt-2 overflow-auto">
      <ResultsHeader
        searchQuery={currentSearch?.query || ""}
        totalResults={profiles.length}
        onExport={() => exportCSV()}
        onRefresh={fetchSearches}
        loading={loading}
      />
      <div className="flex-1 overflow-auto min-h-0">
        <ResultsTable profiles={profiles} />
      </div>
    </Card>
  );
}
