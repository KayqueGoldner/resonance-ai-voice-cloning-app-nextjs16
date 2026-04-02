import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { HealthCheck } from "./health-check";

export default function TestPage() {
  prefetch(trpc.health.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <HealthCheck />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
