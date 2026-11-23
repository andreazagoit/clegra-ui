import * as calendar from "@clegra/ui/components/calendar"
import * as calendarDrawn from "@clegra/ui/drawn/components/calendar"

import { defineCase } from "../case"

export default defineCase("calendar", [calendar], [calendarDrawn], ({ Calendar }) => <Calendar mode="single" defaultMonth={new Date(2026, 10, 1)} className="rounded-2xl border" />)
