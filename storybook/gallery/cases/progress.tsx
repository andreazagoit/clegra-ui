import * as progress from "@clegra/ui/components/progress"
import * as progressDrawn from "@clegra/ui/drawn/components/progress"

import { defineCase } from "../case"

export default defineCase("progress", [progress], [progressDrawn], ({ Progress, ProgressLabel, ProgressValue, Div }) => (
  <Div className="flex flex-col gap-4 max-w-sm">
    <Progress value={40} />
    <Progress value={70}>
      <ProgressLabel>Uploading</ProgressLabel>
      <ProgressValue />
    </Progress>
  </Div>
))
