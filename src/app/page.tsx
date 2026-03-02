"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1>Welcome to Resonance AI</h1>
      <OrganizationSwitcher />
      <UserButton />
    </div>
  );
}
