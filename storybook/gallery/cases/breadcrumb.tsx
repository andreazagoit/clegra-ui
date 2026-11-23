import * as breadcrumb from "@clegra/ui/components/breadcrumb"
import * as breadcrumbDrawn from "@clegra/ui/drawn/components/breadcrumb"

import { defineCase } from "../case"

export default defineCase("breadcrumb", [breadcrumb], [breadcrumbDrawn], ({ Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage }) => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink>Customers</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Acme Ltd</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
))
