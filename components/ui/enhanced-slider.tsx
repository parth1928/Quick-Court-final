"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

// Price Range Slider with labels
interface PriceRangeSliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  currency?: string
  className?: string
}

export function PriceRangeSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  currency = "$",
  className
}: PriceRangeSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100">
          <SliderPrimitive.Range className="absolute h-full bg-black" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-black bg-white shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-black bg-white shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-sm text-gray-600">
        <span className="font-medium">{currency}{value[0]}</span>
        <span className="font-medium">{currency}{value[1]}</span>
      </div>
    </div>
  )
}

// Rating Slider with stars
interface RatingSliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  className?: string
}

export function RatingSlider({
  value,
  onValueChange,
  max = 5,
  className
}: RatingSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={0}
        max={max}
        step={0.5}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100">
          <SliderPrimitive.Range className="absolute h-full bg-yellow-400" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-yellow-400 bg-white shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-sm text-gray-600">
        <span className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1">{value[0]}+</span>
        </span>
        <span className="text-gray-400">5 ★</span>
      </div>
    </div>
  )
}

// Duration Slider for booking hours
interface DurationSliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  className?: string
}

export function DurationSlider({
  value,
  onValueChange,
  min = 1,
  max = 8,
  className
}: DurationSliderProps) {
  const formatDuration = (hours: number) => {
    if (hours === 1) return "1 hour"
    return `${hours} hours`
  }

  return (
    <div className={cn("space-y-3", className)}>
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={1}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100">
          <SliderPrimitive.Range className="absolute h-full bg-green-600" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-green-600 bg-white shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-sm text-gray-600">
        <span className="font-medium">{formatDuration(value[0])}</span>
        <span className="text-gray-400">{formatDuration(max)}</span>
      </div>
    </div>
  )
}

// Time Range Slider for daily schedules
interface TimeRangeSliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  className?: string
}

export function TimeRangeSlider({
  value,
  onValueChange,
  min = 6,
  max = 22,
  className
}: TimeRangeSliderProps) {
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00 ${period}`
  }

  return (
    <div className={cn("space-y-3", className)}>
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={1}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100">
          <SliderPrimitive.Range className="absolute h-full bg-purple-600" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-purple-600 bg-white shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-purple-600 bg-white shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-sm text-gray-600">
        <span className="font-medium">{formatTime(value[0])}</span>
        <span className="font-medium">{formatTime(value[1])}</span>
      </div>
    </div>
  )
}

// Minimal slider with solid thumb (Origin UI style)
interface MinimalSliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  color?: string
  className?: string
}

export function MinimalSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  color = "blue",
  className
}: MinimalSliderProps) {
  const colorClasses = {
    blue: "bg-black",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
    yellow: "bg-yellow-500",
    gray: "bg-gray-600",
    black: "bg-black"
  }

  return (
    <SliderPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100">
        <SliderPrimitive.Range className={cn("absolute h-full", colorClasses[color as keyof typeof colorClasses] || colorClasses.black)} />
      </SliderPrimitive.Track>
      {value.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            "block h-4 w-4 rounded-full shadow-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            colorClasses[color as keyof typeof colorClasses] || colorClasses.black
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}
