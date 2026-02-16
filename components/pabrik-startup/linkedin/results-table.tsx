"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProfileRow } from "./profile-row";
import { LinkedInProfile } from "@/type/interface/linkedin";

interface ResultsTableProps {
  profiles: LinkedInProfile[];
}

export function ResultsTable({ profiles }: ResultsTableProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No profiles found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background z-10">
        <TableRow>
          <TableHead className="w-14"></TableHead>
          <TableHead className="min-w-[150px]">Name</TableHead>
          <TableHead className="min-w-[180px]">Title</TableHead>
          <TableHead className="min-w-[150px]">Company</TableHead>
          <TableHead className="min-w-[120px]">Location</TableHead>
          <TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <ProfileRow key={profile.id} profile={profile} />
        ))}
      </TableBody>
    </Table>
  );
}
