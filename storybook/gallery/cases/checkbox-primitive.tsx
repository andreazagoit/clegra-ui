
import { defineCase } from "../case"

export default defineCase("checkbox (primitives)", [], [], ({ Checkbox, Div, Span }) => (
  <Div className="flex flex-row items-center gap-2">
    <Checkbox aria-label="I agree" defaultChecked />
    <Span className="text-sm">I agree</Span>
  </Div>
))
