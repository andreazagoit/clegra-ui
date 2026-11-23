import * as card from "@clegra/ui/components/card"
import * as button from "@clegra/ui/components/button"
import * as cardDrawn from "@clegra/ui/drawn/components/card"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("card", [card, button], [cardDrawn, buttonDrawn], ({ Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Span }) => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle>Quote 2026-114</CardTitle>
      <CardDescription>Acme Ltd, 3 lines</CardDescription>
    </CardHeader>
    <CardContent>
      <Span className="text-sm">Total €1,240.00</Span>
    </CardContent>
    <CardFooter>
      <Button size="sm">Open</Button>
    </CardFooter>
  </Card>
))
