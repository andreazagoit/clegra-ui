import * as skeleton from "@clegra/ui/components/skeleton"
import * as skeletonDrawn from "@clegra/ui/drawn/components/skeleton"

import { defineCase } from "../case"

export default defineCase("skeleton", [skeleton], [skeletonDrawn], ({ Skeleton, Div }) => (
  <Div className="flex flex-col gap-2 max-w-sm">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-4 w-32" />
  </Div>
))
