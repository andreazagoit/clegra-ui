import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { Badge } from "@clegra/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@clegra/ui/components/table"

const meta = { title: "Web/Examples/Table", component: Table } satisfies Meta<typeof Table>
export default meta

const rows = [
  { number: "2026-001", customer: "Acme Ltd", status: "Draft", total: "€1,250.00" },
  { number: "2026-002", customer: "Bluefield plc", status: "Sent", total: "€830.00" },
  { number: "2026-003", customer: "Harbour & Pine Ltd", status: "Accepted", total: "€4,120.00" },
]

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.number}>
            <TableCell className="font-mono text-xs">{r.number}</TableCell>
            <TableCell>{r.customer}</TableCell>
            <TableCell>
              <Badge variant="outline">{r.status}</Badge>
            </TableCell>
            <TableCell className="text-right">{r.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
