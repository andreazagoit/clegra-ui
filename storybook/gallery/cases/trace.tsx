import * as trace from "@clegra/ui/components/trace"
import * as traceDrawn from "@clegra/ui/drawn/components/trace"

import { defineCase } from "../case"

export default defineCase("trace", [trace], [traceDrawn], ({ Trace, TraceLine, TraceIcon, TraceTitle, TraceDescription, TraceCollapsible, TraceCollapsibleTrigger, TraceCollapsibleContent, icons }) => (
  <Trace className="max-w-md">
    <TraceLine>
      <TraceIcon>
        <icons.Search />
      </TraceIcon>
      <TraceTitle>Searched the ERP for “Acme Ltd”</TraceTitle>
      <TraceDescription>0.4 s</TraceDescription>
    </TraceLine>
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <TraceLine>
          <TraceIcon>
            <icons.FileText />
          </TraceIcon>
          <TraceTitle>Read 3 open orders</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>Orders 2026-210, 2026-211 and 2026-214, all in production.</TraceCollapsibleContent>
    </TraceCollapsible>
    <TraceLine status="error">
      <TraceIcon>
        <icons.Inbox />
      </TraceIcon>
      <TraceTitle>Mail unreachable</TraceTitle>
    </TraceLine>
    <TraceLine status="pending">
      <TraceTitle>Drafting the reply</TraceTitle>
    </TraceLine>
  </Trace>
))
