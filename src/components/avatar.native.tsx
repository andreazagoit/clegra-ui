import { Children, createContext, useContext, useState, type ReactNode } from "react"
import { Image, View } from "react-native"

import { Div, Span } from "../primitives.native"
import { useTw } from "../native/use-tw"

const Loaded = createContext<{ loaded: boolean; setLoaded: (v: boolean) => void }>({ loaded: false, setLoaded: () => {} })

const sizes = { sm: "size-6", default: "size-8", lg: "size-10" }

export function Avatar({ className = "", size = "default", children, title }: { className?: string; size?: keyof typeof sizes; children?: ReactNode; title?: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <Loaded.Provider value={{ loaded, setLoaded }}>
      <Div title={title} className={`relative flex ${sizes[size]} shrink-0 overflow-hidden rounded-full ${className}`}>
        {children}
      </Div>
    </Loaded.Provider>
  )
}

export function AvatarImage({ src, alt = "", className = "" }: { src?: string; alt?: string; className?: string }) {
  const { setLoaded } = useContext(Loaded)
  const parsed = useTw(`size-full ${className}`)
  return src ? <Image source={{ uri: src }} accessibilityLabel={alt} onLoad={() => setLoaded(true)} onError={() => setLoaded(false)} style={[parsed.view as object, { position: "absolute" }]} /> : null
}

export function AvatarFallback({ className = "", children }: { className?: string; children?: ReactNode }) {
  // As Base UI: the initials until the picture has arrived, and if it never does.
  if (useContext(Loaded).loaded) return null
  return (
    <Div className={`flex size-full items-center justify-center rounded-full bg-muted ${className}`}>
      <Span className="text-sm text-muted-foreground">{children}</Span>
    </Div>
  )
}


/** A dot at the bottom right (status, unread). */
export const AvatarBadge = ({ className = "", children }: { className?: string; children?: ReactNode }) => (
  <Div className={`absolute right-0 bottom-0 flex size-2.5 items-center justify-center rounded-full bg-primary border-2 border-background ${className}`}>{children}</Div>
)

/** Avatars overlapping: each after the first moves left by 8, as -space-x-2. */
export function AvatarGroup({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <Div className={`flex flex-row ${className}`}>
      {Children.toArray(children).map((child, index) => (
        <View key={index} style={index ? { marginLeft: -8 } : undefined}>
          {child}
        </View>
      ))}
    </Div>
  )
}

export const AvatarGroupCount = ({ className = "", children }: { className?: string; children?: ReactNode }) => (
  <Div className={`relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted border-2 border-background text-sm text-muted-foreground ${className}`}>{children}</Div>
)
