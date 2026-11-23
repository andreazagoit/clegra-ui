import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { Button } from "@clegra/ui/components/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@clegra/ui/components/card"

const meta = { title: "Web/Examples/Card", component: Card } satisfies Meta<typeof Card>
export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Customer details</CardTitle>
        <CardDescription>Read live from the ERP.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm">ACME LTD · Manchester</CardContent>
      <CardFooter className="text-xs text-muted-foreground">Updated today</CardFooter>
    </Card>
  ),
}
