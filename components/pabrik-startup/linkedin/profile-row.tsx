"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "./profile-avatar";
import { ExternalLink, Copy, Mail } from "lucide-react";
import { LinkedInProfile } from "@/type/interface/linkedin";
import { toast } from "sonner";

interface ProfileRowProps {
  profile: LinkedInProfile;
}

export function ProfileRow({ profile }: ProfileRowProps) {
  const position = profile.current_positions?.[0];
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <TableRow className="group hover:bg-muted/50">
      {/* Avatar */}
      <TableCell className="py-3">
        <ProfileAvatar
          src={profile.picture_url}
          name={fullName}
          size="md"
        />
      </TableCell>

      {/* Name & Badges */}
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">{fullName || "Unknown"}</span>
          <div className="flex items-center gap-1">
            {profile.premium && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                Premium
              </Badge>
            )}
            {profile.open_profile && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                Open
              </Badge>
            )}
          </div>
        </div>
      </TableCell>

      {/* Title */}
      <TableCell>
        <span className="text-sm text-foreground">{position?.title || "-"}</span>
      </TableCell>

      {/* Company */}
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {position?.company_name || "-"}
        </span>
      </TableCell>

      {/* Location */}
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {profile.location || "-"}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => copyToClipboard(profile.linkedin_url, "LinkedIn URL")}
            title="Copy LinkedIn URL"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            asChild
          >
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open LinkedIn Profile"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
