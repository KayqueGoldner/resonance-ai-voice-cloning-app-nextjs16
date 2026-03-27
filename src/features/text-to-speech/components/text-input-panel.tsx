"use client";

import { CoinsIcon } from "lucide-react";
import { useStore } from "@tanstack/react-form";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { COST_PER_UNIT, TEXT_MAX_LENGTH } from "../data/constants";
import { ttsFormOptions } from "../components/text-to-speech-form";
import { GenerateButton } from "./generate-button";

export function TextInputPanel() {
  const form = useTypedAppFormContext(ttsFormOptions);

  const { text, isSubmitting, isValid } = useStore(form.store, (state) => ({
    text: state.values.text,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
  }));

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* text input area */}
      <div className="relative min-h-0 flex-1">
        <form.Field name="text">
          {(field) => (
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Start typing or place your text here..."
              className="absolute inset-0 resize-none border-0 bg-transparent p-4 pb-6 text-base! leading-relaxed tracking-tight wrap-break-word shadow-none focus-visible:ring-0 lg:p-6 lg:pb-8"
              maxLength={TEXT_MAX_LENGTH}
              disabled={isSubmitting}
            />
          )}
        </form.Field>
        {/* bottom fade overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent" />
      </div>
      {/* action bar */}
      <div className="shrink-0 p-4 lg:p-6">
        {/* mobile layout */}
        <div className="flex flex-col gap-3 lg:hidden">
          <GenerateButton
            className="w-full"
            disabled={isSubmitting}
            isSubmitting={isSubmitting}
            onSubmit={() => form.handleSubmit()}
          />
        </div>
        {/* desktop layout */}
        {text.length > 0 ? (
          <div className="hidden lg:flex lg:items-center lg:justify-between">
            <Badge variant="outline" className="gap-1.5 border-dashed">
              <CoinsIcon className="size-3 text-chart-5" />
              <span className="text-xs">
                <span className="tabular-nums">
                  ${(text.length * COST_PER_UNIT).toFixed(4)}
                </span>{" "}
                estimated
              </span>
            </Badge>
            <div className="flex items-center gap-3">
              <p className="text-xs tracking-tight">
                {text.length.toLocaleString()}{" "}
                <span className="text-muted-foreground">
                  / {TEXT_MAX_LENGTH.toLocaleString()} characters
                </span>
              </p>
              <GenerateButton
                size="sm"
                disabled={!isValid || isSubmitting}
                isSubmitting={isSubmitting}
                onSubmit={() => form.handleSubmit()}
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              Get started by typing or pasting your text above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
