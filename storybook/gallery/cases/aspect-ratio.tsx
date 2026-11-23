import * as aspectRatio from "@clegra/ui/components/aspect-ratio"
import * as aspectRatioDrawn from "@clegra/ui/drawn/components/aspect-ratio"

import { defineCase } from "../case"

export default defineCase("aspect-ratio", [aspectRatio], [aspectRatioDrawn], ({ AspectRatio, Div, Span }) => (
  <Div className="max-w-sm">
    <AspectRatio ratio={16 / 9} className="rounded-2xl bg-muted">
      <Div className="flex h-full items-center justify-center">
        <Span className="text-sm text-muted-foreground">16:9</Span>
      </Div>
    </AspectRatio>
  </Div>
))
