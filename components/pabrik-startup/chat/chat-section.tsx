"use client";

import ChatInput from "./chat-input";
import ChatBubble from "./chat-bubble";
import { Chat } from "@/type/interface/chat";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ChatSectionProps {
  projectId?: string;
  onToolCall?: (toolCall: any) => void;
}

export default function ChatSection({ projectId, onToolCall }: ChatSectionProps) {
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
      } catch { }
    };

    fetchProjectChats();
  }, [projectId]);

  const handleToolCall = useCallback((toolCall: any) => {
    if (onToolCall) {
      onToolCall(toolCall);
    }
  }, [onToolCall]);

  return (
    <Card className="w-75 shrink-0 h-[calc(100vh-64px)] flex flex-col rounded-none shadow-none gap-2 pt-2">
      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4">
        <ChatBubble messages={messages} />
      </CardContent>
      <CardFooter>
        <ChatInput
          messages={messages}
          setMessages={setMessages}
          projectId={projectId}
          onToolCall={handleToolCall}
        />
      </CardFooter>
    </Card>
  );
}
