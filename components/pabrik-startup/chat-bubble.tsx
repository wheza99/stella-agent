"use client";

import { useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Item } from "../ui/item";
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
            <Avatar className={cn(
              msg.role === "assistant" ? "mr-auto" : "ml-auto"
            )}>
              <AvatarFallback
                className={msg.role === "assistant"
                  ? "bg-purple-100 text-purple-600 border-purple-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"}
              >
                {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </Item>
        </Item>
      ))}
      <Item ref={messagesEndRef} />
    </>
  )
}

export default ChatBubble
