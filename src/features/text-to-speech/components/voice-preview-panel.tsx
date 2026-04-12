"use client";

import { useState } from "react";
import {
  PauseIcon,
  PlayIcon,
  DownloadIcon,
  RedoIcon,
  UndoIcon,
} from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";

import { useWaveSurfer } from "../hooks/use-wavesurfer";

type VoicePreviewPanelVoice = {
  id?: string;
  name: string;
};

function formatTime(seconds: number): string {
  return format(new Date(seconds * 1000), "mm:ss");
}

export function VoicePreviewPanel({
  audioUrl,
  voice,
  text,
}: {
  audioUrl: string;
  voice: VoicePreviewPanelVoice | null;
  text: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedVoiceName = voice?.name ?? null;
  const selectedVoiceSeed = voice?.id ?? null;

  const {
    containerRef,
    isPlaying,
    isReady,
    currentTime,
    duration,
    togglePlayPause,
    seekForward,
    seekBackward,
  } = useWaveSurfer({ url: audioUrl, autoplay: true });

  const handleDownload = async () => {
    setIsDownloading(true);

    const safeName =
      text
        .slice(0, 50)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "speech";

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading audio:", error);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <div className="hidden h-full flex-1 flex-col gap-8 border-t lg:flex">
      {/* header */}
      <div className="p-6 pb-0">
        <h3 className="font-semibold text-foreground">Voice preview</h3>
      </div>

      {/* content */}
      <div className="relative flex flex-1 items-center justify-center">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Badge
              variant="outline"
              className="gap-2 bg-background/90 px-3 py-1.5 text-sm text-muted-foreground shadow-sm"
            >
              <Spinner className="size-4" />
              <span>Loading audio...</span>
            </Badge>
          </div>
        )}

        <div
          ref={containerRef}
          className={cn(
            "w-full cursor-pointer transition-opacity duration-200",
            !isReady && "opacity-0",
          )}
        />
      </div>

      {/* time display */}
      <div className="flex items-center justify-center">
        <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatTime(currentTime)}&nbsp;/&nbsp;
          <span className="text-muted-foreground">{formatTime(duration)}</span>
        </p>
      </div>

      {/* footer */}
      <div className="flex flex-col items-center p-6">
        <div className="grid w-full grid-cols-3">
          {/* metadata */}
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-sm font-medium text-foreground">
              {text}
            </p>
            {selectedVoiceName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <VoiceAvatar
                  seed={selectedVoiceSeed ?? selectedVoiceName}
                  name={selectedVoiceName}
                  className="shrink-0"
                />
                <span className="truncate">{selectedVoiceName}</span>
              </div>
            )}
          </div>

          {/* player controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon-lg"
              className="flex-col"
              onClick={() => seekBackward(10)}
              disabled={!isReady}
              aria-label="Rewind 10 seconds"
            >
              <UndoIcon className="-mb-1 size-4" />
              <span className="text-[10px] font-medium">10s</span>
            </Button>

            <Button
              size="icon-lg"
              variant="default"
              className="rounded-full"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseIcon className="fill-background" />
              ) : (
                <PlayIcon className="fill-background" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon-lg"
              className="flex-col"
              onClick={() => seekForward(10)}
              disabled={!isReady}
              aria-label="Forward 10 seconds"
            >
              <RedoIcon className="-mb-1 size-4" />
              <span className="text-[10px] font-medium">10s</span>
            </Button>
          </div>

          {/* download */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!isReady || isDownloading}
              aria-label="Download audio"
            >
              <DownloadIcon className="size-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
