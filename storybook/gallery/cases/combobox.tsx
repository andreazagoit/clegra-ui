import * as combobox from "@clegra/ui/components/combobox"
import * as comboboxDrawn from "@clegra/ui/drawn/components/combobox"

import { defineCase } from "../case"

const cities = ["Bristol", "Leeds", "London", "Manchester", "York"]

export default defineCase("combobox", [combobox], [comboboxDrawn], ({ Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem, Div }) => (
  <Div className="w-64">
    <Combobox items={cities}>
      <ComboboxInput placeholder="Choose a city" aria-label="City" />
      <ComboboxContent>
        <ComboboxEmpty>No cities found.</ComboboxEmpty>
        <ComboboxList>
          {(city: string) => (
            <ComboboxItem key={city} value={city}>
              {city}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </Div>
))
