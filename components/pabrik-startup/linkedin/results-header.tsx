"use client";

import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ResultsHeaderProps {
  searchQuery: string;
  totalResults: number;
  onExport: () => Promise<void>;
  onRefresh: () => void;
  loading?: boolean;
}

export function ResultsHeader({
  searchQuery,
  totalResults,
  onExport,
  onRefresh,
  loading = false,
}: ResultsHeaderProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="border-b px-4 py-3 flex flex-row items-center justify-between bg-muted/30 shrink-0 overflow-hidden">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-medium">LinkedIn Results</h3>
          <p className="text-xs text-muted-foreground">
            {totalResults} profile{totalResults !== 1 ? "s" : ""} found
            {searchQuery && (
              <span className="ml-1">for "{searchQuery}"</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleExport}
          disabled={exporting || totalResults === 0}
          className="h-8"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
    </div>
  );
}
