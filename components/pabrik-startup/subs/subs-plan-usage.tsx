import { Separator } from "../../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Usage } from "@/type/interface/usage";
import { Badge } from "../../ui/badge";

function SubsPlanUsageCard({ usageHistory }: { usageHistory: Usage[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-8 w-1/4">Description</TableHead>
          <TableHead className="py-2">
            <Separator orientation="vertical" />
          </TableHead>
          <TableHead className="w-1/4">Type</TableHead>
          <TableHead className="py-2">
            <Separator orientation="vertical" />
          </TableHead>
          <TableHead className="w-1/4">Credit</TableHead>
          <TableHead className="py-2">
            <Separator orientation="vertical" />
          </TableHead>
          <TableHead className="w-1/4">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usageHistory.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              No credit history found.
            </TableCell>
          </TableRow>
        ) : (
          usageHistory.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="pl-8">
                {item.description || "-"}
              </TableCell>
              <TableCell className="p-0">
                <Separator orientation="vertical" className="h-6" />
              </TableCell>
              <TableCell>
                <Badge className={item.type === "refill" ? `bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300` : `bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300`}>
                  {item.type.toUpperCase() || "-"}
                </Badge>
              </TableCell>
              <TableCell className="p-0">
                <Separator orientation="vertical" className="h-6" />
              </TableCell>
              <TableCell>{Math.abs(item.amount)}</TableCell>
              <TableCell className="p-0">
                <Separator orientation="vertical" className="h-6" />
              </TableCell>
              <TableCell>
                {new Date(item.created_at).toLocaleString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default SubsPlanUsageCard;
