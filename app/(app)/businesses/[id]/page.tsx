"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { Building2, CreditCard, MapPin, User, Eye, Wallet, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { useBusiness, useBusinessLifecycle } from "@/lib/queries/businesses";
import { startCheckout } from "@/lib/api/payments";
import { env } from "@/lib/env";
import { formatEnumLabel } from "@/lib/utils";

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: business, isLoading, isError } = useBusiness(id);
  const lifecycle = useBusinessLifecycle(id);
  const [checkingOut, setCheckingOut] = useState(false);

  if (isLoading) {
    return (
      <div className="container-page max-w-3xl py-6">
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={Building2} title="Business not found" />
      </div>
    );
  }

  async function handlePayNow() {
    if (!business) return;
    setCheckingOut(true);
    try {
      await startCheckout({
        purpose: "BUSINESS_REGISTRATION",
        referenceId: business.id,
        amount: { currency: "SLE", amount: "0" },
        successUrl: `${env.appUrl}/businesses/${business.id}?payment=success`,
        cancelUrl: `${env.appUrl}/businesses/${business.id}?payment=cancelled`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't start checkout");
      setCheckingOut(false);
    }
  }

  return (
    <div className="container-page max-w-3xl py-6">
      <Card className="animate-fade-in-up overflow-hidden">
        <div className="relative h-32 w-full bg-gradient-to-br from-primary-400 to-primary-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="size-10 text-white/90" />
          </div>
        </div>
        <CardHeader className="pb-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={business.status} />
            <span className="font-mono text-xs text-muted-foreground">#{business.trackingId}</span>
          </div>
          <CardTitle className="text-2xl">{business.businessName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" /> {business.ownerName}
            </span>
            {business.businessAddress && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {business.businessAddress}
              </span>
            )}
          </div>

          {business.businessActivities && <p className="text-sm leading-relaxed">{business.businessActivities}</p>}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2.5 py-0.5">
              {business.businessCategory === "OTHER" && business.otherCategory
                ? business.otherCategory
                : formatEnumLabel(business.businessCategory)}
            </span>
            {business.businessEntityType && (
              <span className="rounded-full bg-muted px-2.5 py-0.5">{business.businessEntityType}</span>
            )}
            {business.registrationNumber && (
              <span className="rounded-full bg-muted px-2.5 py-0.5">Reg. {business.registrationNumber}</span>
            )}
          </div>
          {business.rejectionReason && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{business.rejectionReason}</div>
          )}

          {business.status === "PAYMENT_PENDING" && (
            <Button onClick={handlePayNow} disabled={checkingOut} className="w-fit">
              <CreditCard className="size-4" /> {checkingOut ? "Redirecting…" : "Pay registration fee"}
            </Button>
          )}

          {/* TODO(backend): same role-gating caveat as Big Ideas/Opportunities
              moderation actions - no role field on UserInfo yet. */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => lifecycle.markInReview.mutate(undefined, { onError: () => toast.error("Failed") })}>
              <Eye className="size-4" /> Mark in review
            </Button>
            <Button variant="outline" size="sm" onClick={() => lifecycle.requestPayment.mutate(undefined, { onError: () => toast.error("Failed") })}>
              <Wallet className="size-4" /> Request payment
            </Button>
            <Button variant="outline" size="sm" onClick={() => lifecycle.confirmPayment.mutate(undefined, { onError: () => toast.error("Failed") })}>
              <CheckCircle2 className="size-4" /> Confirm payment
            </Button>
            <Button size="sm" onClick={() => lifecycle.approve.mutate(undefined, { onError: () => toast.error("Failed") })}>
              <ShieldCheck className="size-4" /> Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => lifecycle.reject.mutate(undefined, { onError: () => toast.error("Failed") })}>
              <XCircle className="size-4" /> Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
