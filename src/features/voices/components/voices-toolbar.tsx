"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { SearchIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";

import { voicesSearchParams } from "../lib/params";
import { VoiceCreateDialog } from "./voice-create-dialog";

export function VoicesToolbar() {
  const [query, setQuery] = useQueryState("query", voicesSearchParams.query);
  const [localQuery, setLocalQuery] = useState(query);

  const debouncedSetQuery = useDebouncedCallback(setQuery, 300);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
          All Libraries
        </h2>
        <p className="text-sm text-muted-foreground">
          Discover your voices, or make your own.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <InputGroup className="lg:max-w-sm">
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                debouncedSetQuery(e.target.value);
              }}
              placeholder="Search voices..."
            />
          </InputGroup>

          <div className="ml-auto hidden lg:block">
            <VoiceCreateDialog>
              <Button size="sm">
                <SparklesIcon />
                Custom voice
              </Button>
            </VoiceCreateDialog>
          </div>

          <div className="lg:hidden">
            <VoiceCreateDialog>
              <Button size="sm" className="w-full">
                <SparklesIcon />
                Custom voice
              </Button>
            </VoiceCreateDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
