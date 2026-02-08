import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { ExternalLink } from "lucide-react";
import { Payment } from "@/type/interface/payment";

function SubsPlanPaymentCard({ billingHistory }: { billingHistory: Payment[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-8 w-1/4">Name</TableHead>
          <TableHead className="py-2">
            <Separator orientation="vertical" />
          </TableHead>
          <TableHead className="w-1/4">Amount</TableHead>
          <TableHead className="py-2">
            <Separator orientation="vertical" />
          </TableHead>
          <TableHead className="w-1/4">Status</TableHead>
          <TableHead className="py-2">
            <Separator orientation="vertical" />
          </TableHead>
          <TableHead className="w-1/4">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {billingHistory.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              No billing history found.
            </TableCell>
          </TableRow>
        ) : (
          billingHistory.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="pl-8">{item.name}</TableCell>
              <TableCell className="p-0">
                <Separator orientation="vertical" className="h-6" />
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(item.amount)}
              </TableCell>
              <TableCell className="p-0">
                <Separator orientation="vertical" className="h-6" />
              </TableCell>
              <TableCell className="capitalize">
                {item.status}{" "}
                {item.url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(item.url!, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
              <TableCell className="p-0">
                <Separator orientation="vertical" className="h-6" />
              </TableCell>
              <TableCell>
                {new Date(item.date).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default SubsPlanPaymentCard;
