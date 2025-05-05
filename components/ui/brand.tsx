"use client"

import { FC } from "react"
import Image from "next/image"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <div className="flex flex-col items-center hover:opacity-50">
      <div className="mb-2">
        <Image
          src="/images/logo_delavega.svg"
          alt="Chatbot Logo"
          width={300}
          height={300}
          className="delavega-logo"
        />
      </div>

      <div className="text-4xl font-bold tracking-wide">Chatbot Delavega</div>
    </div>
  )
}
