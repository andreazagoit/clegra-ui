import * as pagination from "@clegra/ui/components/pagination"
import * as paginationDrawn from "@clegra/ui/drawn/components/pagination"

import { defineCase } from "../case"

export default defineCase("pagination", [pagination], [paginationDrawn], ({ Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis }) => (
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious href="#page-1" text="Previous" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#page-1">1</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#page-2" isActive>
          2
        </PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#page-3">3</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>
      <PaginationItem>
        <PaginationNext href="#page-3" text="Next" />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
))
