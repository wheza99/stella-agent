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
  fetchLatestResults: () => Promise<void>;
  exportCSV: (searchId?: string) => Promise<void>;
}

export function useLinkedInSearch(projectId: string): UseLinkedInSearchReturn {
  const [searches, setSearches] = useState<LinkedInSearch[]>([]);
  const [currentSearch, setCurrentSearch] = useState<LinkedInSearch | null>(null);
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

        // Get profiles from most recent completed search
        const latestCompleted = searchesData.find(
          (s: LinkedInSearch) => s.status === "completed"
        );
        
        if (latestCompleted) {
          setCurrentSearch(latestCompleted);
          
          const resultsResponse = await axios.get("/api/linkedin/results", {
            params: { searchId: latestCompleted.id },
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

  const fetchLatestResults = useCallback(async () => {
    if (!searches.length) {
      await fetchSearches();
      return;
    }

    const latestCompleted = searches.find(
      (s: LinkedInSearch) => s.status === "completed"
    );

    if (!latestCompleted) return;

    try {
      const response = await axios.get("/api/linkedin/results", {
        params: { searchId: latestCompleted.id },
      });

      if (response.data.status === "success") {
        setProfiles(response.data.data.results);
        setCurrentSearch(latestCompleted);
      }
    } catch (err) {
      console.error("Fetch results error:", err);
    }
  }, [searches, fetchSearches]);

  const exportCSV = useCallback(async (searchId?: string) => {
    const id = searchId || currentSearch?.id;
    if (!id) {
      console.error("No search ID for export");
      return;
    }

    try {
      const response = await axios.get(`/api/linkedin/export?searchId=${id}`, {
        responseType: "blob",
      });

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
  }, [currentSearch]);

  return {
    searches,
    currentSearch,
    profiles,
    loading,
    error,
    fetchSearches,
    fetchLatestResults,
    exportCSV,
  };
}
