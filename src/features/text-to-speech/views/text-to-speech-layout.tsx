import { PageHeader } from "@/components/page-header";

interface TextToSpeechLayoutProps {
  children: React.ReactNode;
}

export function TextToSpeechLayout({ children }: TextToSpeechLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader title="Text to speech" />
      {children}
    </div>
  );
}
