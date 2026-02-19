"use client";

import ChatInput from "./chat-input";
import ChatBubble from "./chat-bubble";
import { Chat } from "@/type/interface/chat";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ChatSectionProps {
  projectId?: string;
  initialChats?: Chat[];
  onToolCallComplete?: (toolName: string, success: boolean) => void;
}

export default function ChatSection({ 
  projectId, 
  initialChats = [],
  onToolCallComplete 
}: ChatSectionProps) {
  const [messages, setMessages] = useState<Chat[]>(initialChats);
  const [isProcessingTools, setIsProcessingTools] = useState(false);

  // Fetch chats only if no initial chats provided
  useEffect(() => {
    const fetchProjectChats = async () => {
      try {
        if (!projectId) return;
        if (initialChats.length > 0) return;

        const response = await axios.get("/api/project/detail", {
          params: { project_id: projectId },
        });
        if (response.data.status === "success") {
          setMessages(response.data.chats);
        }
      } catch { }
    };

    fetchProjectChats();
  }, [projectId, initialChats.length]);

  // Execute a single tool call
  const executeTool = useCallback(async (
    toolCall: { id: string; function: { name: string; arguments: string } },
    currentProjectId: string
  ): Promise<{ toolCallId: string; name: string; content: string; success: boolean }> => {
    const args = JSON.parse(toolCall.function.arguments);

    if (toolCall.function.name === "search_linkedin_profiles") {
      try {
        const response = await axios.post("/api/linkedin/search", {
          searchQuery: args.searchQuery,
          currentJobTitles: args.currentJobTitles,
          locations: args.locations,
          maxItems: args.maxItems || 25,
          projectId: currentProjectId,
        });

        if (response.data.status === "success") {
          const data = response.data.data;
          const summaryData = {
            searchId: data.searchId,
            totalFound: data.results?.length || 0,
            profiles: (data.results || []).slice(0, 5).map((p: any) => ({
              name: p.name,
              title: p.title || '',
              company: p.company || '',
              location: p.location || '',
              linkedinUrl: p.linkedin_url,
            })),
          };

          return {
            toolCallId: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(summaryData),
            success: true,
          };
        } else {
          return {
            toolCallId: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify({ error: response.data.error?.message || "Search failed" }),
            success: false,
          };
        }
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.error?.message || error.message
          : "Unknown error";
        return {
          toolCallId: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify({ error: errorMessage }),
          success: false,
        };
      }
    }

    // Unknown tool
    return {
      toolCallId: toolCall.id,
      name: toolCall.function.name,
      content: JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` }),
      success: false,
    };
  }, []);

  // Handle tool calls when detected in the last message
  useEffect(() => {
    const handleToolCalls = async () => {
      if (messages.length === 0 || isProcessingTools) return;

      const lastMessage = messages[messages.length - 1];
      
      // Check if last message is from assistant and has tool calls
      if (
        lastMessage?.role === "assistant" &&
        lastMessage?.tool_calls &&
        lastMessage.tool_calls.length > 0
      ) {
        // Check if tool calls have function property (from Groq format)
        const hasFunctionCalls = lastMessage.tool_calls.some(
          (tc: any) => tc.function && tc.function.name
        );
        
        if (!hasFunctionCalls) return; // Already processed or different format

        console.log("[ChatSection] Tool calls detected:", lastMessage.tool_calls.length);
        setIsProcessingTools(true);

        try {
          // Execute all tool calls in parallel
          const toolPromises = lastMessage.tool_calls.map((toolCall: any) =>
            executeTool(toolCall, projectId || "")
          );

          const toolResults = await Promise.all(toolPromises);

          console.log("[ChatSection] Tool results:", toolResults);

          // Add tool response messages
          const toolMessages: Chat[] = toolResults.map((result) => ({
            id: crypto.randomUUID(),
            project_id: projectId || "",
            role: "tool" as const,
            content: result.content,
            tool_call_id: result.toolCallId,
            created_at: new Date().toISOString(),
          }));

          const messagesWithToolResults = [...messages, ...toolMessages];
          setMessages(messagesWithToolResults);

          // Notify parent of tool call completion
          toolResults.forEach((result) => {
            if (onToolCallComplete) {
              onToolCallComplete(result.name, result.success);
            }
          });

          // Send back to LLM to get final response
          const response = await axios.post("/api/chat/groq", {
            messages: messagesWithToolResults.map((msg) => ({
              role: msg.role,
              content: msg.content,
              tool_calls: msg.tool_calls,
              tool_call_id: msg.tool_call_id,
            })),
            model: "llama-3.3-70b-versatile",
            project_id: projectId,
          });

          if (response.data.output) {
            const assistantMessage: Chat = {
              id: crypto.randomUUID(),
              project_id: projectId || "",
              role: response.data.output.role,
              content: response.data.output.content,
              tool_calls: response.data.output.tool_calls,
              created_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // If there are more tool calls, they will be handled by the next effect cycle
          }
        } catch (error) {
          console.error("[ChatSection] Tool execution failed:", error);
        } finally {
          setIsProcessingTools(false);
        }
      }
    };

    handleToolCalls();
  }, [messages, projectId, isProcessingTools, executeTool, onToolCallComplete]);

  return (
    <Card className="w-75 shrink-0 h-[calc(100vh-64px)] flex flex-col rounded-none shadow-none gap-2 pt-2">
      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4">
        <ChatBubble messages={messages} isProcessingTools={isProcessingTools} />
      </CardContent>
      <CardFooter>
        <ChatInput
          messages={messages}
          setMessages={setMessages}
          projectId={projectId}
          disabled={isProcessingTools}
        />
      </CardFooter>
    </Card>
  );
}
