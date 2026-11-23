import type { Decorator, Preview } from "@storybook/react-native-web-vite"
import { useEffect } from "react"

import { TooltipProvider } from "@clegra/ui/components/tooltip"
import { setThemeChoice } from "@clegra/ui/native/theme"

import "./preview.css"

/** The toolbar's theme switch, as in the internal catalogue: the `dark` class on <html>, and the React Native theme. */
const withClegraTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === "dark"
  setThemeChoice(dark ? "dark" : "light")
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", dark)
    root.dataset.theme = dark ? "dark" : "light"
  }, [dark])
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-6 text-foreground">
        <Story />
      </div>
    </TooltipProvider>
  )
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Light or dark",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [withClegraTheme],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    options: {
      storySort: {
        order: ["Apps", ["Introduction", "Catalogue", ["Record", "List", "Table", "Chart", "Stat", "Timeline", "Form"], "Declared views", ["Overview", "Table", "Cards", "Detail", "Form", "Chart", "Number", "Frame", "States"], "Components", ["Overview", "Actions", "Forms", "Data display", "Feedback", "Overlays", "Layout"], "Frame theming"]],
      },
    },
  },
}

export default preview
