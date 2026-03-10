"use client"
import { getTechLogos } from "@/lib/utils"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  const [techIcons, setTechIcons] = useState<{ tech: string; url: string }[]>([])

  useEffect(() => {
    getTechLogos(techStack).then(setTechIcons)
  }, [techStack])

  return (
    <div className="flex flex-row gap-2">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div key={tech} className={cn("relative group bg-dark-300 rounded-full p-2 flex-center", index >= 1 && '-ml-3')}>
          <span className="tech-tooltip">{tech}</span>
          <Image src={url} alt={tech} width={80} height={80} className="size-6" />
        </div>
      ))}
    </div>
  )
}

export default DisplayTechIcons
