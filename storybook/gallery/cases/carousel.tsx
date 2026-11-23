import * as carousel from "@clegra/ui/components/carousel"
import * as carouselDrawn from "@clegra/ui/drawn/components/carousel"

import { defineCase } from "../case"

const slides = [1, 2, 3, 4, 5]

export default defineCase("carousel", [carousel], [carouselDrawn], ({ Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, Div, Span }) => (
  <Div className="px-12">
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {slides.map((n) => (
          <CarouselItem key={n}>
            <Div className="flex h-32 items-center justify-center rounded-2xl border">
              <Span className="text-2xl font-semibold">{`Slide ${n}`}</Span>
            </Div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </Div>
))
