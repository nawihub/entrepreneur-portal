"use client";

import Link from "next/link";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntrepreneursList } from "@/lib/queries/entrepreneurs";
import { useOpportunityAnalysis } from "@/lib/queries/opportunities";

export function RightRail() {
  const { data: directory, isLoading } = useEntrepreneursList({ pageSize: 4 });
  const { data: analysis } = useOpportunityAnalysis();

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base">Founders to discover</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}

          {!isLoading && !directory?.items.length && (
            <p className="text-sm text-muted-foreground">No entrepreneurs to show yet.</p>
          )}

          {directory?.items.map((entrepreneur) => (
            <Link
              key={entrepreneur.id}
              href={`/profile/${entrepreneur.id}`}
              className="flex items-center gap-3 rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Avatar className="size-9">
                <AvatarImage src={entrepreneur.identity.profilePhotoUrl ?? undefined} />
                <AvatarFallback>{entrepreneur.identity.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {entrepreneur.identity.firstName} {entrepreneur.identity.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {entrepreneur.identity.currentLocation ?? "NaWeHub member"}
                </p>
              </div>
            </Link>
          ))}

          <Link
            href="/entrepreneurs"
            className="flex items-center gap-1 pt-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Browse directory <ArrowUpRight className="size-3" />
          </Link>
        </CardContent>
      </Card>

      {analysis && analysis.byCategory.length > 0 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-secondary-500" /> Opportunity trends
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {analysis.byCategory.slice(0, 5).map((entry) => (
              <div key={entry.category} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{entry.category}</span>
                <span className="font-medium">{entry.count}</span>
              </div>
            ))}
            <Link
              href="/opportunities/analysis"
              className="flex items-center gap-1 pt-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              View full breakdown <ArrowUpRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
