import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/client";

import { useCheckout } from "../hooks/use-checkout";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function UpgradeCard() {
  const { checkout, isPending: isCheckoutPending } = useCheckout();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Pay as you go
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Generate speech starting at $0.30 per 1,000 characters
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={checkout}
        disabled={isCheckoutPending}
      >
        {isCheckoutPending ? (
          <>
            <Spinner className="size-3" />
            Redirecting...
          </>
        ) : (
          "Upgrade"
        )}
      </Button>
    </div>
  );
}

function UsageCard({ estimatedCostCents }: { estimatedCostCents: number }) {
  const trpc = useTRPC();
  const portalMutation = useMutation(
    trpc.billing.createPortalSession.mutationOptions({}),
  );

  const openPortal = useCallback(() => {
    if (!portalMutation.isPending) {
      portalMutation.mutate(undefined, {
        onSuccess: (data) => {
          window.location.href = data.portalUrl;
        },
      });
    }
  }, [portalMutation]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Current usage
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
            {formatCurrency(estimatedCostCents)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Estimated this period
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={openPortal}
        disabled={portalMutation.isPending}
      >
        {portalMutation.isPending ? (
          <>
            <Spinner className="size-3" />
            Redirecting...
          </>
        ) : (
          "Manage Subscription"
        )}
      </Button>
    </div>
  );
}

export function UsageContainer() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.billing.getStatus.queryOptions());

  return (
    <div className="rounded-lg border border-border bg-background p-3 group-data-[collapsible=icon]:hidden">
      {data?.hasActiveSubscription ? (
        <UsageCard estimatedCostCents={data.estimatedCostCents} />
      ) : (
        <UpgradeCard />
      )}
    </div>
  );
}
