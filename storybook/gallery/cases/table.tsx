import * as table from "@clegra/ui/components/table"
import * as tableDrawn from "@clegra/ui/drawn/components/table"

import { defineCase } from "../case"

export default defineCase("table", [table], [tableDrawn], ({ Table, TableHeader, TableRow, TableHead, TableBody, TableCell }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Customer</TableHead>
        <TableHead>City</TableHead>
        <TableHead className="text-right">Total</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Acme Ltd</TableCell>
        <TableCell>London</TableCell>
        <TableCell className="text-right">1,240.00</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Bluefield plc</TableCell>
        <TableCell>Leeds</TableCell>
        <TableCell className="text-right">380.50</TableCell>
      </TableRow>
    </TableBody>
  </Table>
))
