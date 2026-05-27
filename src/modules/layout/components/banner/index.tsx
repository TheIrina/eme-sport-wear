"use client"

import React from "react"

const messages = [
  "🚚 ENVÍO GRATIS A TODO EL PAÍS",
  "💳 PAGOS SEGUROS",
  "💬 ATENCIÓN PERSONALIZADA",
]

// Create a sufficiently long array that represents one full cycle
const singleSet = [...messages, ...messages, ...messages, ...messages]
// Duplicate the cycle so the -50% translation loops seamlessly
const doubleSet = [...singleSet, ...singleSet]

const Banner = () => {
  return (
    <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {doubleSet.map((msg, index) => (
          <span key={index} className="mx-8 text-sm font-light">
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Banner