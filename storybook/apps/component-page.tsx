import { cases } from "../gallery/cases"
import { statusLine } from "../gallery/native-status"

import { COMPONENTS, RESERVED, type ComponentDoc } from "./components"
import { Callout, Code, DataTable, DocPage, DoDont, Notes, Platforms, Schemes, Section } from "./doc"

const caseOf = (name: string) => cases.find((item) => item.name === name)

/** One component's page: purpose, web and native side by side, light and dark, props, do and don't, an example, accessibility. */
export function ComponentPage({ name }: { name: string }) {
  const doc = COMPONENTS.find((item) => item.name === name) as ComponentDoc
  const example = caseOf(name)
  return (
    <DocPage title={doc.title} lead={doc.purpose}>
      <Section title="Import">
        <Code label="Web (a view in a frame)">{`import { … } from "@clegra/ui/components/${doc.name}"`}</Code>
        <p className="text-sm text-muted-foreground">
          React Native (Clegra&apos;s own apps, standalone Expo apps): <code>@clegra/ui/react-native/components/{doc.name}</code>, same names and props. {statusLine(doc.name)}.
        </p>
      </Section>
      {example ? (
        <>
          <Section title="Web and native" lead="The same code with the web's components and with React Native's.">
            <Platforms>{(kit) => example.render(kit.platform === "web" ? example.platform : example.drawn)}</Platforms>
          </Section>
          <Section title="Light and dark" lead="Both looks side by side (web). The native side follows the toolbar's Theme. Popups open in the page's look.">
            <Schemes>{example.render(example.platform)}</Schemes>
          </Section>
        </>
      ) : null}
      <Section title="Props" lead="The ones that matter; every component also takes `className` and its element's own props.">
        <DataTable head={["Prop", "Values", "What it does"]} rows={doc.props} />
      </Section>
      <Section title="Do and don't">
        <DoDont doThis={doc.doThis} dont={doc.dont} />
      </Section>
      <Section title="Example" lead="Copy, paste, change the words. UI copy is Italian.">
        <Code>{doc.example}</Code>
      </Section>
      <Section title="Accessibility">
        <Notes items={doc.a11y} />
      </Section>
    </DocPage>
  )
}

export function ComponentsOverviewPage() {
  return (
    <DocPage title="Components" lead="What an application's own view (a frame) may use from @clegra/ui. Declared views and artifacts need none of this: Clegra draws them. Reach for these only inside a frame.">
      <Callout>Data first. Before building a view from these components, check Apps › Declared views and Apps › Catalogue: what is declared is native on every device, usable by the assistant and read aloud.</Callout>
      <Section title="By group">
        <DataTable head={["Component", "Group", "For"]} rows={COMPONENTS.map((doc) => [doc.name, doc.group, doc.purpose])} />
      </Section>
      <Section title="Reserved for Clegra" lead="Parts of Clegra's own shell and assistant. Not for applications, and (proposed) not exported from the published package.">
        <DataTable head={["Component", "Why"]} rows={RESERVED} />
      </Section>
    </DocPage>
  )
}
