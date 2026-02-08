import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination";

function SubsPlanPaginationCard({
  currentPage,
  totalPages,
  pageNumbers,
}: {
  currentPage: number;
  totalPages: number;
  pageNumbers: (number | string)[];
}) {
  return (
    <Pagination className="w-full justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={
              currentPage <= 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={page}>
              <PaginationLink href="#" isActive={currentPage === page}>
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default SubsPlanPaginationCard;
