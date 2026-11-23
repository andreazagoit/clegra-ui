import { Children, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import * as L from "lucide-react-native"
import { ScrollView, View, useWindowDimensions, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from "react-native"

import { ChevronRightIcon, wrapIcon, type IconProps } from "../native/icons"
import { Div, type BoxProps } from "../primitives.native"
import { Button, type ButtonProps } from "./button.native"

const ChevronLeftIcon = wrapIcon("ChevronLeftIcon", L.ChevronLeftIcon as unknown as React.ComponentType<IconProps>)

/** The part of Embla's API a screen uses (selectedScrollSnap, scrollTo, on("select")…). */
export type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: () => boolean
  canScrollNext: () => boolean
  selectedScrollSnap: () => number
  scrollSnapList: () => number[]
  on: (event: "select" | "reInit", listener: (api: CarouselApi) => void) => CarouselApi
  off: (event: "select" | "reInit", listener: (api: CarouselApi) => void) => CarouselApi
}
type CarouselOptions = { loop?: boolean; align?: "start" | "center" | "end"; startIndex?: number; axis?: "x" | "y" }

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: unknown
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type Ctx = {
  orientation: "horizontal" | "vertical"
  opts?: CarouselOptions
  index: number
  setIndex: (index: number) => void
  count: number
  setCount: (count: number) => void
  /** Slides that fit in the viewport at once. */
  perView: number
  setPerView: (n: number) => void
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  api: CarouselApi
}
const CarouselContext = createContext<Ctx | null>(null)

export function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context) throw new Error("useCarousel must be used within a <Carousel />")
  return context
}

/** Embla's carousel drawn: a scroll view that snaps to each slide, with the same buttons and API. */
export function Carousel({ orientation = "horizontal", opts, setApi, plugins: _plugins, className = "", children, ...props }: BoxProps & CarouselProps) {
  const [index, setOwn] = useState(opts?.startIndex ?? 0)
  const [count, setCount] = useState(0)
  const [perView, setPerView] = useState(1)
  const listeners = useRef(new Set<(api: CarouselApi) => void>())
  const last = Math.max(0, count - Math.round(perView))
  const loop = Boolean(opts?.loop)
  const state = useRef({ index, last, loop })
  state.current = { index, last, loop }
  const setIndex = useCallback((next: number) => setOwn(next), [])
  const api = useMemo<CarouselApi>(() => {
    const go = (next: number) => {
      const { last, loop } = state.current
      setOwn(loop ? (next < 0 ? last : next > last ? 0 : next) : Math.max(0, Math.min(last, next)))
    }
    const self: CarouselApi = {
      scrollPrev: () => go(state.current.index - 1),
      scrollNext: () => go(state.current.index + 1),
      scrollTo: go,
      canScrollPrev: () => state.current.loop || state.current.index > 0,
      canScrollNext: () => state.current.loop || state.current.index < state.current.last,
      selectedScrollSnap: () => state.current.index,
      scrollSnapList: () => Array.from({ length: state.current.last + 1 }, (_, i) => i),
      on: (_event, listener) => (listeners.current.add(listener), self),
      off: (_event, listener) => (listeners.current.delete(listener), self),
    }
    return self
  }, [])
  useEffect(() => setApi?.(api), [api, setApi])
  useEffect(() => {
    for (const listener of listeners.current) listener(api)
  }, [api, index, count])
  return (
    <CarouselContext.Provider value={{ orientation, opts, index, setIndex, count, setCount, perView, setPerView, scrollPrev: api.scrollPrev, scrollNext: api.scrollNext, canScrollPrev: loop || index > 0, canScrollNext: loop || index < last, api }}>
      <Div role="region" aria-roledescription="carousel" {...props} className={`relative ${className}`}>
        {children}
      </Div>
    </CarouselContext.Provider>
  )
}

/** The share of the viewport a slide takes: basis-full, basis-1/2, md:basis-1/3… (the last one that applies). */
const ItemBasis = createContext<(className?: string) => number>(() => 1)
function basisOf(className: string | undefined, width: number) {
  let basis = 1
  for (const raw of (className ?? "").split(/\s+/)) {
    const [prefix, token] = raw.includes(":") ? raw.split(":") : [undefined, raw]
    const min = prefix ? { sm: 640, md: 768, lg: 1024, xl: 1280 }[prefix] : 0
    if (min === undefined || width < min) continue
    const m = /^basis-(full|(\d+)\/(\d+))$/.exec(token ?? "")
    if (m) basis = m[1] === "full" ? 1 : Number(m[2]) / Number(m[3])
  }
  return basis
}

export function CarouselContent({ className = "", children }: BoxProps) {
  const carousel = useCarousel()
  const horizontal = carousel.orientation === "horizontal"
  const scroll = useRef<ScrollViewInstance>(null)
  const [size, setSize] = useState(0)
  const slides = Children.toArray(children)
  const first = slides[0] as { props?: { className?: string } } | undefined
  const basis = basisOf(first?.props?.className, useWindowDimensions().width)
  // The slides' track starts 16 px before the viewport (-ml-4), each slide pads 16 px (pl-4), as on the web.
  const track = size + 16
  const step = track * basis
  const { setCount, setPerView, index, setIndex } = carousel
  useEffect(() => setCount(slides.length), [setCount, slides.length])
  useEffect(() => setPerView(1 / basis), [setPerView, basis])
  useEffect(() => {
    if (step) scroll.current?.scrollTo(horizontal ? { x: index * step, animated: true } : { y: index * step, animated: true })
  }, [index, step, horizontal])
  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = horizontal ? event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.y
    if (step) setIndex(Math.round(offset / step))
  }
  const measure = (event: LayoutChangeEvent) => setSize(horizontal ? event.nativeEvent.layout.width : event.nativeEvent.layout.height)
  return (
    <View onLayout={measure} style={{ overflow: "hidden" }}>
      <ItemBasis.Provider value={() => step}>
        <ScrollView
          ref={scroll}
          horizontal={horizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          snapToInterval={step || undefined}
          decelerationRate="fast"
          onMomentumScrollEnd={settle}
          onScrollEndDrag={settle}
          style={horizontal ? { marginLeft: -16, width: track } : { marginTop: -16, height: track }}
        >
          <Div className={`flex ${horizontal ? "flex-row" : "flex-col"} ${className.replace(/(^|\s)-m[lt]-\d+/g, "")}`}>{children}</Div>
        </ScrollView>
      </ItemBasis.Provider>
    </View>
  )
}

export function CarouselItem({ className = "", style, children, ...props }: BoxProps) {
  const { orientation } = useCarousel()
  const step = useContext(ItemBasis)()
  const own = className.replace(/(^|\s)(\w+:)?basis-\S+/g, "")
  return (
    <Div role="group" aria-roledescription="slide" {...props} className={`shrink-0 ${orientation === "horizontal" ? "pl-4" : "pt-4"} ${own}`} style={[orientation === "horizontal" ? { width: step || undefined } : { height: step || undefined }, style]}>
      {children}
    </Div>
  )
}

function Arrow({ next, className = "", variant = "outline", size = "icon-sm", style, ...props }: ButtonProps & { next: boolean }) {
  const { orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()
  const horizontal = orientation === "horizontal"
  const place = horizontal ? { top: "50%", marginTop: -16, [next ? "right" : "left"]: -48 } : { left: "50%", marginLeft: -16, [next ? "bottom" : "top"]: -48, transform: [{ rotate: "90deg" }] }
  return (
    <Button
      aria-label={next ? "Next slide" : "Previous slide"}
      variant={variant}
      size={size}
      className={`rounded-full ${className}`}
      disabled={next ? !canScrollNext : !canScrollPrev}
      onClick={next ? scrollNext : scrollPrev}
      style={{ position: "absolute", ...place, ...(style as object) } as never}
      {...props}
    >
      {next ? <ChevronRightIcon /> : <ChevronLeftIcon />}
    </Button>
  )
}

export const CarouselPrevious = (props: ButtonProps) => <Arrow {...props} next={false} />
export const CarouselNext = (props: ButtonProps) => <Arrow {...props} next />
