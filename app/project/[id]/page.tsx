"use client";

import { useState, useCallback, use } from "react";
import ChatSection from '@/components/pabrik-startup/chat/chat-section'
import { LinkedInResultsPanel } from '@/components/pabrik-startup/linkedin'

interface PageProps {
  params: Promise<{ id: string }>
}

function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleToolCallComplete = useCallback((toolName: string, success: boolean) => {
    if (toolName === "search_linkedin_profiles" && success) {
      setRefreshKey(prev => prev + 1);
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-row flex-1 overflow-hidden">
      <ChatSection projectId={id} onToolCallComplete={handleToolCallComplete} />
      <LinkedInResultsPanel key={refreshKey} projectId={id} />
    </div>
  )
}

export default ProjectDetailPage
