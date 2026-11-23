import * as codeBlock from "@clegra/ui/components/code-block"
import * as codeBlockDrawn from "@clegra/ui/drawn/components/code-block"

import { defineCase } from "../case"

const query = `select number, customer, total
from quotes
where status = 'open'
order by number desc;`

export default defineCase("code-block", [codeBlock], [codeBlockDrawn], ({ CodeBlock, CodeBlockHeader, CodeBlockTitle, CodeBlockActions, CodeBlockCopyButton, CodeBlockContent, CodeBlockLine, CodeBlockFooter, Div, Span, icons }) => (
  <Div className="flex max-w-md flex-col gap-4">
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>
          <icons.FileText />
          quotes.sql
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={query} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{query}</CodeBlockContent>
    </CodeBlock>
    <CodeBlock size="sm">
      <CodeBlockContent>
        <CodeBlockLine variant="removed">total = quantity * price</CodeBlockLine>
        <CodeBlockLine variant="added">total = quantity * price * (1 - discount)</CodeBlockLine>
        <CodeBlockLine variant="highlighted">return total</CodeBlockLine>
      </CodeBlockContent>
      <CodeBlockFooter>
        <Span className="text-xs">Suggested change</Span>
      </CodeBlockFooter>
    </CodeBlock>
  </Div>
))
