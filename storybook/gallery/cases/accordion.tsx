import * as accordion from "@clegra/ui/components/accordion"
import * as accordionDrawn from "@clegra/ui/drawn/components/accordion"

import { defineCase } from "../case"

export default defineCase("accordion", [accordion], [accordionDrawn], ({ Accordion, AccordionItem, AccordionTrigger, AccordionContent }) => (
  <Accordion defaultValue={["delivery"]}>
    <AccordionItem value="delivery">
      <AccordionTrigger>Delivery times</AccordionTrigger>
      <AccordionContent>Usually within five working days.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="payment">
      <AccordionTrigger>Payment</AccordionTrigger>
      <AccordionContent>Bank transfer, thirty days from the invoice date.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="returns">
      <AccordionTrigger>Returns</AccordionTrigger>
      <AccordionContent>Within fourteen days, goods undamaged.</AccordionContent>
    </AccordionItem>
  </Accordion>
))
