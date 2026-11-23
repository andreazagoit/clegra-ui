import * as slider from "@clegra/ui/components/slider"
import * as sliderDrawn from "@clegra/ui/drawn/components/slider"

import { defineCase } from "../case"

export default defineCase("slider", [slider], [sliderDrawn], ({ Slider, Div }) => (
  <Div className="max-w-sm">
    <Slider defaultValue={[30]} aria-label="Discount" />
  </Div>
))
