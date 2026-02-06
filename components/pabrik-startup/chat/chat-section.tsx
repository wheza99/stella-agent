"use client";

import ChatInput from "./chat-input";
import { Card, CardContent, CardFooter } from "../../ui/card";
import ChatBubble from "./chat-bubble";
import { Chat } from "@/type/interface/chat";
import { useEffect, useState } from "react";
import axios from "axios";

interface ChatSectionProps {
  projectId?: string;
}

export default function ChatSection({ projectId }: ChatSectionProps) {
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

  return (
    <Card className="w-75 shrink-0 h-[calc(100vh-64px)] flex flex-col rounded-none shadow-none gap-2 pt-2">
      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4">
        <ChatBubble messages={messages} />
      </CardContent>
      <CardFooter>
        <ChatInput messages={messages} setMessages={setMessages} projectId={projectId} />
      </CardFooter>
    </Card>
  );
}
