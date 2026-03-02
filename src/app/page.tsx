"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <Button onClick={() => toast("Hello world")}>Click me</Button>
    </div>
  );
}
