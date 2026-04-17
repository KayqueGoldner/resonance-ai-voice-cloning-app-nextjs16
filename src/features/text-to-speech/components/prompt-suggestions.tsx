"use client";

import {
  BookOpenIcon,
  SmileIcon,
  MicIcon,
  LanguagesIcon,
  ClapperboardIcon,
  GamepadIcon,
  PodcastIcon,
  BrainIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

export const PROMPT_SUGGESTIONS: {
  label: string;
  prompt: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Narrate a story",
    prompt:
      "In a village tucked between mist-covered mountains, there lived an old clockmaker whose clocks never told the right time — but they always told the truth. One rainy evening, a stranger walked in and asked for a clock that could show him his future.",
    icon: BookOpenIcon,
  },
  {
    label: "Create an advertisement",
    prompt:
      "Introducing BrightBean Coffee — the smoothest roast you'll ever taste. Sourced from high-altitude farms, slow-roasted to perfection, and delivered fresh to your door every single week. Wake up to something extraordinary. Try BrightBean today and get your first bag free.",
    icon: SmileIcon,
  },
  {
    label: "Direct a movie scene",
    prompt:
      "The rain hammered against the window as she turned to face him. You knew, didn't you? she whispered, her voice barely holding together. He stepped forward, jaw clenched. I did what I had to do. The silence between them was louder than the storm outside.",
    icon: ClapperboardIcon,
  },
  {
    label: "Voice a game character",
    prompt:
      "Listen up, adventurer. The realm of Ashenvale is crumbling, and the Crystal of Eternity has been shattered into seven pieces. You are the only one who can reassemble it. Gather your courage, sharpen your blade, and meet me at the Gates of Dawn. Time is not on our side.",
    icon: GamepadIcon,
  },
  {
    label: "Introduce your podcast",
    prompt:
      "Hey everyone, welcome back to another episode of The Curious Mind — the podcast where we dig into the stories, science, and strange ideas that shape our world. I'm your host, and today we have an incredible guest who's going to challenge everything you thought you knew.",
    icon: PodcastIcon,
  },
  {
    label: "Guide a meditation",
    prompt:
      "Close your eyes and take a deep breath in. Hold it gently... and release. Feel the weight of the day slowly melting away. With each breath, you're sinking deeper into calm. There is nowhere else you need to be. Just here. Just now. Breathe in peace, breathe out tension.",
    icon: BrainIcon,
  },
  {
    label: "Deliver a speech",
    prompt:
      "Friends, colleagues, citizens. We stand today at the precipice of a new era. The challenges before us are great, but our resolve is greater. Let us move forward not with fear, but with the courage to forge a brighter tomorrow.",
    icon: MicIcon,
  },
  {
    label: "Practice pronunciation",
    prompt:
      "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. How much wood would a woodchuck chuck if a woodchuck could chuck wood? Peter Piper picked a peck of pickled peppers.",
    icon: LanguagesIcon,
  },
];

export function PromptSuggestions({
  onSelect,
}: {
  onSelect(prompt: string): void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm text-muted-foreground">Get started with</p>

      <div className="flex flex-wrap gap-2">
        {PROMPT_SUGGESTIONS.map((suggestion) => (
          <Badge
            key={suggestion.label}
            variant="outline"
            className="cursor-pointer gap-1.5 rounded-md px-2.5 py-1 text-xs hover:bg-accent"
            onClick={() => onSelect(suggestion.prompt)}
          >
            <suggestion.icon className="size-3.5 shrink-0" />
            {suggestion.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
