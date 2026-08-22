"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useOpportunityAnalysis } from "@/lib/queries/opportunities";

export default function OpportunityAnalysisPage() {
  const { data: analysis, isLoading } = useOpportunityAnalysis();

  return (
    <div className="container-page max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Opportunity insights</h1>
        <p className="text-muted-foreground">Category breakdown across all listed opportunities.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !analysis || analysis.byCategory.length === 0 ? (
        <EmptyState icon={BarChart3} title="No data yet" description="Analysis will appear once opportunities are categorized." />
      ) : (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>By category</CardTitle>
            <CardDescription>{analysis.totalOpportunities} opportunities total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.byCategory} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={140}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius-lg)",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--color-primary-500))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
