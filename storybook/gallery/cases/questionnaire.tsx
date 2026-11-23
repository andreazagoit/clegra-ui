import { useState } from "react"

import * as questionnaire from "@clegra/ui/components/questionnaire"
import * as questionnaireDrawn from "@clegra/ui/drawn/components/questionnaire"

import { defineCase, type Kit } from "../case"

function Survey({ kit: { Questionnaire, QuestionnaireProgress, QuestionnaireItem, QuestionnaireTitle, QuestionnaireDescription, QuestionnaireChoices, QuestionnaireChoice, QuestionnaireChoiceDescription, QuestionnaireInput, QuestionnaireError, QuestionnaireActions, QuestionnairePrevious, QuestionnaireSkip, QuestionnaireNext, QuestionnaireSubmit, Div, Span } }: { kit: Kit }) {
  const [sent, setSent] = useState(false)
  if (sent) return <Span className="text-sm">Answers sent.</Span>
  return (
    <Div className="max-w-md">
      <Questionnaire shortcuts="letters" onSubmit={(event: { preventDefault: () => void }) => (event.preventDefault(), setSent(true))}>
        <QuestionnaireProgress />
        <QuestionnaireItem name="delivery" required>
          <QuestionnaireTitle>How would you like to receive the quote?</QuestionnaireTitle>
          <QuestionnaireDescription>We'll have it ready today.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="email">By email</QuestionnaireChoice>
            <QuestionnaireChoice value="pdf">
              PDF to download
              <QuestionnaireChoiceDescription>In the customer portal.</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="notes">
          <QuestionnaireTitle>Notes for the team</QuestionnaireTitle>
          <QuestionnaireDescription>Optional.</QuestionnaireDescription>
          <QuestionnaireInput placeholder="Write a note" aria-label="Note" />
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious>Back</QuestionnairePrevious>
          <QuestionnaireSkip>Skip</QuestionnaireSkip>
          <QuestionnaireNext>Next</QuestionnaireNext>
          <QuestionnaireSubmit>Submit</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </Div>
  )
}

export default defineCase("questionnaire", [questionnaire], [questionnaireDrawn], (kit) => <Survey kit={kit} />)
