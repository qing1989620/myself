import { ViewTransition } from "react"
import HeroSection from "@/components/home/HeroSection"
import AboutSection from "@/components/home/AboutSection"
import HobbiesSection from "@/components/home/HobbiesSection"
import MottoSection from "@/components/home/MottoSection"
import Reveal from "@/components/ui/Reveal"

export default function HomePage() {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <HeroSection />
      <Reveal>
        <AboutSection />
      </Reveal>
      <Reveal delay={100}>
        <HobbiesSection />
      </Reveal>
      <Reveal delay={150}>
        <MottoSection />
      </Reveal>
    </ViewTransition>
  )
}
