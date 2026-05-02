"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AudioLinesIcon,
  FolderOpenIcon,
  XIcon,
  FileAudioIcon,
  UploadIcon,
  MicIcon,
  TagIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  GlobeIcon,
  LayersIcon,
  AlignLeftIcon,
} from "lucide-react";
import locales from "locale-codes";

import { cn, formatFileSize } from "@/lib/utils";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { VoiceRecorder } from "./voice-recorder";

import {
  VOICE_CATEGORIES,
  VOICE_CATEGORY_LABELS,
} from "../data/voice-categories";

const LANGUAGE_OPTIONS = locales.all
  .filter((l) => l.tag && l.tag.includes("-") && l.name)
  .map((l) => ({
    value: l.tag,
    label: l.location ? `${l.name} (${l.location})` : l.name,
  }));

const voiceCreateFormSchema = z.object({
  file: z
    .instanceof(File, { message: "An audio file is required" })
    .nullable()
    .refine((f) => f !== null, "An audio file is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  language: z.string().min(1, "Language is required"),
  description: z.string(),
});

function FileDropzone({
  file,
  onFileChange,
  isInvalid,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  isInvalid?: boolean;
}) {
  const { isPlaying, togglePlay } = useAudioPlayback(file);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: { "audio/*": [] },
      maxSize: 20 * 1024 * 1024, // 20MB
      multiple: false,
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          onFileChange(acceptedFiles[0]);
        }
      },
    });

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <FileAudioIcon className="size-5 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <PauseIcon className="size-4" />
          ) : (
            <PlayIcon className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onFileChange(null)}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-10 transition-colors",
        isDragReject || isInvalid
          ? "border-destructive"
          : isDragActive
            ? "border-primary"
            : "",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <AudioLinesIcon className="size-5 text-muted-foreground" />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base font-semibold tracking-tight">
          Upload your audio file
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Supports all audio formats, max size 20MB
        </p>
      </div>

      <Button type="button" variant="outline" size="sm">
        <FolderOpenIcon className="size-3.5" />
        Upload file
      </Button>
    </div>
  );
}

function LanguageCombobox({
  value,
  onChange,
  isInvalid,
}: {
  value: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    LANGUAGE_OPTIONS.find((l) => l.value === value)?.label ?? "";

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={isInvalid}
          className={cn(
            "h-9 w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
            {value ? selectedLabel : "Select language..."}
          </div>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search language..." autoFocus />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {LANGUAGE_OPTIONS.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface VoiceCreateFormProps {
  scrollable?: boolean;
  footer?: (submit: React.ReactNode) => React.ReactNode;
  onError?: (message: string) => void;
}

export function VoiceCreateForm({
  scrollable,
  footer,
  onError,
}: VoiceCreateFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      file,
      name,
      category,
      language,
      description,
    }: {
      file: File;
      name: string;
      category: string;
      language: string;
      description?: string;
    }) => {
      const params = new URLSearchParams({
        name,
        category,
        language,
      });

      if (description) {
        params.set("description", description);
      }

      const response = await fetch(`/api/voices/create?${params.toString()}`, {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to create voice");
      }

      return response.json();
    },
  });

  const form = useForm({
    defaultValues: {
      file: null as File | null,
      name: "",
      category: "GENERAL" as string,
      language: "en-US",
      description: "",
    },
    validators: {
      onSubmit: voiceCreateFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync({
          file: value.file!,
          name: value.name,
          category: value.category,
          language: value.language,
          description: value.description || undefined,
        });

        toast.success("Voice created successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.voices.getAll.queryKey(),
        });
        form.reset();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create voice";
        if (onError) {
          onError(message);
        } else {
          toast.error(message);
        }
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn("flex flex-col", scrollable ? "min-h-0 flex-1" : "gap-6")}
    >
      <div
        className={cn(
          scrollable
            ? "no-scrollbar flex flex-col gap-6 overflow-y-auto px-4"
            : "flex flex-col gap-6",
        )}
      >
        <form.Field name="file">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <Tabs defaultValue="upload">
                  <TabsList className="h-11! w-full">
                    <TabsTrigger value="upload">
                      <UploadIcon className="size-3.5" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="record">
                      <MicIcon className="size-3.5" />
                      Record
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-3">
                    <FileDropzone
                      file={field.state.value}
                      onFileChange={field.handleChange}
                      isInvalid={isInvalid}
                    />
                  </TabsContent>

                  <TabsContent value="record" className="mt-3">
                    <VoiceRecorder
                      file={field.state.value}
                      onFileChange={field.handleChange}
                      isInvalid={isInvalid}
                    />
                  </TabsContent>
                </Tabs>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <TagIcon className="size-4 text-muted-foreground" />
                  </div>
                  <Input
                    id={field.name}
                    placeholder="Voice Label"
                    aria-invalid={isInvalid}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="pl-10"
                  />
                </div>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="category">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <LayersIcon className="size-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    onOpenChange={field.handleBlur}
                  >
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {VOICE_CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="language">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <LanguageCombobox
                  value={field.state.value}
                  onChange={field.handleChange}
                  isInvalid={isInvalid}
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <AlignLeftIcon className="size-4 text-muted-foreground" />
                  </div>
                  <Textarea
                    id={field.name}
                    placeholder="Describe the voice..."
                    aria-invalid={isInvalid}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="min-h-20 pl-10"
                    rows={3}
                  />
                </div>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe
          selector={(s) => ({
            isSubmitting: s.isSubmitting,
          })}
        >
          {({ isSubmitting }) => {
            const submitButton = (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Voice"}
              </Button>
            );

            return footer ? footer(submitButton) : submitButton;
          }}
        </form.Subscribe>
      </div>
    </form>
  );
}
