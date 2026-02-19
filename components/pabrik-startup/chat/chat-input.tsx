"use client";

import { ArrowUpIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { Chat } from "@/type/interface/chat";
import { Project } from "@/type/interface/project";

const MODELS = [
  {
    label: "Llama 3.3 70B",
    value: "llama-3.3-70b-versatile",
    provider: "groq",
  },
];

interface ChatInputProps {
  messages?: Chat[];
  setMessages?: React.Dispatch<React.SetStateAction<Chat[]>>;
  projectId?: string;
  disabled?: boolean;
}

export default function ChatInput({ 
  messages, 
  setMessages, 
  projectId,
  disabled = false
}: ChatInputProps) {
  const [userInput, setUserInput] = useState<string>("");
  const [model, setModel] = useState(MODELS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, activeOrg, projects, setProjects } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    if (!userInput.trim()) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    e.preventDefault();
    setLoading(true);
    setError(null);

    // Add user message to UI immediately
    if (setMessages) {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        project_id: activeOrg?.id || "",
        role: "user",
        content: userInput,
        created_at: new Date().toISOString(),
      }]);
    }

    try {
      // Format messages for API
      const formatMessages = (messages || []).map((msg) => ({
        role: msg.role,
        content: msg.content,
        tool_calls: msg.tool_calls,
        tool_call_id: msg.tool_call_id,
      }));

      const newMessages = [...formatMessages, {
        role: "user",
        content: userInput
      }];

      const response = await axios.post("/api/chat/groq", {
        messages: newMessages,
        model: model.value,
        org_id: !projectId ? activeOrg?.id : null,
        project_id: projectId,
      });

      // Handle new project creation
      if (response.data.project) {
        setProjects([...projects, response.data.project as Project]);
        router.push(`/project/${response.data.project.id}`);
      } else if (setMessages) {
        // Add assistant message (may contain tool_calls)
        const assistantMessage: Chat = {
          id: crypto.randomUUID(),
          project_id: projectId || activeOrg?.id || "",
          role: response.data.output.role,
          content: response.data.output.content,
          tool_calls: response.data.output.tool_calls || [],
          created_at: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Failed to send message",
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setUserInput("");
      setLoading(false);
    }
  };

  return (
    <>
      <InputGroup className="bg-background w-full">
        <InputGroupTextarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type your message... (e.g., 'Cari AI engineer di Dubai')"
          disabled={loading || disabled}
          className="min-h-[60px]"
        />
        <InputGroupAddon align="block-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton className="ml-auto text-xs" variant="ghost">
                {model.label}
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              {MODELS.map((m) => (
                <DropdownMenuItem key={m.value} onSelect={() => setModel(m)}>
                  {m.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Separator className="h-4!" orientation="vertical" />
          <InputGroupButton
            className="rounded-full"
            size="icon-xs"
            variant="default"
            onClick={handleSubmit}
            disabled={loading || disabled || !userInput.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpIcon />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}
