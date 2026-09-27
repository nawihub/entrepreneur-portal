"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { Building2, CreditCard, Download, FileText, Loader2, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { useBusiness } from "@/lib/queries/businesses";
import { startCheckout } from "@/lib/api/payments";
import { businessesApi } from "@/lib/api/businesses";
import { useAuthStore } from "@/lib/store/auth-store";
import { gradientFor, initialsOf } from "@/components/feed/tile-parts";
import { fileNameFor, saveBlob } from "@/lib/save-blob";
import { env } from "@/lib/env";
import { formatEnumLabel } from "@/lib/utils";

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: business, isLoading, isError } = useBusiness(id);
  const [checkingOut, setCheckingOut] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState(false);
  const userId = useAuthStore((s) => s.user?.id);

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

  const isOwner = Boolean(userId && business.ownerId && business.ownerId === userId);

  async function handleDownloadDocument() {
    if (!business) return;
    setDownloadingDoc(true);
    try {
      const blob = await businessesApi.downloadDocument(business.id);
      saveBlob(blob, fileNameFor(`${business.businessName} - ID document`, blob));
    } catch {
      toast.error("Couldn't download your ID document. Try again in a moment.");
    } finally {
      setDownloadingDoc(false);
    }
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
        <div className="relative h-32 w-full overflow-hidden">
          <div className={`tile-pattern absolute inset-0 animate-hero-zoom bg-gradient-to-br ${gradientFor(business.businessName)}`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 animate-scale-in items-center justify-center rounded-2xl bg-white/15 font-display text-2xl font-semibold text-white shadow-lg ring-1 ring-white/30 backdrop-blur-sm">
              {initialsOf(business.businessName)}
            </span>
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

          {isOwner && business.documentUrl && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" /> ID document submitted with this registration
                <span className="text-xs text-muted-foreground">(only visible to you)</span>
              </span>
              <Button variant="ghost" size="sm" disabled={downloadingDoc} onClick={handleDownloadDocument}>
                {downloadingDoc ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download
              </Button>
            </div>
          )}

          {business.status === "PAYMENT_PENDING" && (
            <Button onClick={handlePayNow} disabled={checkingOut} className="w-fit">
              <CreditCard className="size-4" /> {checkingOut ? "Redirecting…" : "Pay registration fee"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
