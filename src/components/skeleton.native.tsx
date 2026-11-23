import { useEffect, useRef } from "react"
import { Animated } from "react-native"

import { useTw } from "../native/use-tw"

export function Skeleton({ className = "" }: { className?: string }) {
  const parsed = useTw(`bg-muted rounded-md ${className}`)
  const opacity = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 1000, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: false }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])
  return <Animated.View style={[parsed.view, { opacity }]} />
}
