"use client";

import { useRef, useEffect } from "react";
import { Bot, User, Search, Loader2, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Item } from "../../ui/item";
import { Chat } from "@/type/interface/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  messages: Chat[];
  isProcessingTools?: boolean;
}

function ChatBubble({ messages, isProcessingTools = false }: ChatBubbleProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if message has LinkedIn search tool call
  const hasLinkedInSearch = (msg: Chat) => {
    return msg.tool_calls?.some(
      (tc: any) => tc.function?.name === "search_linkedin_profiles" || tc.name === "search_linkedin_profiles"
    );
  };

  // Get tool call status (checking if there's a tool response after this message)
  const getToolCallStatus = (msg: Chat, msgIndex: number, allMessages: Chat[]) => {
    // If this message has tool_calls, check if the next messages contain tool responses
    if (msg.role === "assistant" && msg.tool_calls?.length) {
      // Look for tool responses with matching tool_call_id
      const toolCallIds = msg.tool_calls.map((tc: any) => tc.id);
      const hasResponses = allMessages.slice(msgIndex + 1).some(
        (m) => m.role === "tool" && toolCallIds.includes(m.tool_call_id)
      );
      return hasResponses ? "completed" : "running";
    }
    return null;
  };

  return (
    <>
      {messages.map((msg, i) => {
        // Skip tool messages in main display (they're shown as status badges on assistant messages)
        if (msg.role === "tool") {
          return null;
        }

        const toolStatus = getToolCallStatus(msg, i, messages);
        
        return (
          <Item
            key={msg.id || i}
            className={cn(
              "flex flex-col p-0 gap-1",
              msg.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div className={cn(
              "flex items-start gap-2 w-full",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              <Avatar className={cn(
                msg.role === "assistant" ? "bg-purple-100 text-purple-600 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"
              )}>
                <AvatarFallback>
                  {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                </AvatarFallback>
              </Avatar>
              
              <div
                className={cn(
                  "rounded-md text-sm max-w-[85%]",
                  msg.role === "assistant"
                    ? "bg-muted/50 px-3 py-2"
                    : "bg-primary text-primary-foreground rounded-tr-none px-3 py-2"
                )}
              >
                {/* Tool call indicator */}
                {msg.role === "assistant" && hasLinkedInSearch(msg) && (
                  <div className="mb-2 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Search className="h-3 w-3" />
                      <span>LinkedIn Profile Search</span>
                      {toolStatus === "completed" ? (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-auto">
                          Completed
                        </Badge>
                      ) : toolStatus === "running" || isProcessingTools ? (
                        <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                      ) : null}
                    </div>
                  </div>
                )}
                
                {/* Tool call indicator for any tool */}
                {msg.role === "assistant" && msg.tool_calls && msg.tool_calls.length > 0 && !hasLinkedInSearch(msg) && (
                  <div className="mb-2 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wrench className="h-3 w-3" />
                      <span>Using {msg.tool_calls.length} tool(s)</span>
                      {toolStatus === "running" || isProcessingTools ? (
                        <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                      ) : toolStatus === "completed" ? (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-auto">
                          Completed
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                )}
                
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                >
                  {msg.content || ""}
                </ReactMarkdown>
              </div>
            </div>
          </Item>
        );
      })}
      
      {/* Processing indicator when tools are running */}
      {isProcessingTools && messages[messages.length - 1]?.role === "tool" && (
        <Item className="flex flex-col items-start p-0 gap-1">
          <div className="flex items-start gap-2 w-full flex-row">
            <Avatar className="bg-purple-100 text-purple-600 border-purple-200">
              <AvatarFallback>
                <Bot size={16} />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-md text-sm bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            </div>
          </div>
        </Item>
      )}
      
      <div ref={messagesEndRef} />
    </>
  );
}

export default ChatBubble;
