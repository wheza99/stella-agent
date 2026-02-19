"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

interface EditableProjectTitleProps {
  projectId: string;
  initialTitle: string;
  onTitleUpdated?: (newTitle: string) => void;
}

export function EditableProjectTitle({
  projectId,
  initialTitle,
  onTitleUpdated,
}: EditableProjectTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Project title cannot be empty");
      return;
    }

    if (title === initialTitle) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(
        `/api/project/detail?project_id=${projectId}`,
        { title: title.trim() }
      );

      if (response.data.status === "success") {
        toast.success("Project renamed successfully");
        setIsEditing(false);
        onTitleUpdated?.(title.trim());
      }
    } catch (error) {
      toast.error("Failed to rename project");
      setTitle(initialTitle); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium truncate max-w-[200px]">{title}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className="h-7 w-[200px] rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder="Project name"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3 text-green-600" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCancel}
        disabled={isSaving}
      >
        <X className="h-3 w-3 text-red-600" />
      </Button>
    </div>
  );
}
