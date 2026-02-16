"use client";

import { useRef, useEffect } from "react";
import { Bot, User, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
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

  // Check if message has LinkedIn search tool call
  const hasLinkedInSearch = (msg: Chat) => {
    return msg.tool_calls?.some(
      (tc: any) => tc.name === "search_linkedin_profiles"
    );
  };

  // Check if tool call was successful
  const isToolCallSuccessful = (msg: Chat) => {
    const toolCall = msg.tool_calls?.find(
      (tc: any) => tc.name === "search_linkedin_profiles"
    );
    if (!toolCall) return false;
    try {
      const args = typeof toolCall.arguments === 'string' 
        ? JSON.parse(toolCall.arguments) 
        : toolCall.arguments;
      return args?.totalFound > 0;
    } catch {
      return false;
    }
  };

  return (
    <>
      {messages.map((msg, i) => (
        <Item
          key={i}
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
                    {isToolCallSuccessful(msg) ? (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-auto">
                        Completed
                      </Badge>
                    ) : (
                      <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                    )}
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
      ))}
      <div ref={messagesEndRef} />
    </>
  );
}

export default ChatBubble;
