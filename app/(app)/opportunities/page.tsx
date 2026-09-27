"use client";

import { Suspense } from "react";
import Link from "next/link";
import { BarChart3, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/feed/opportunity-card";
import { ListPageHeader, ListResults } from "@/components/list-results";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchField } from "@/components/filters/search-field";
import { SelectFilter } from "@/components/filters/select-filter";
import { MultiSelectFilter } from "@/components/filters/multi-select-filter";
import { useOpportunitiesFeed } from "@/lib/queries/opportunities";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { OPPORTUNITY_BENEFICIARIES, OPPORTUNITY_CATEGORIES, OPPORTUNITY_SCOPES } from "@/lib/data/filter-options";

const FILTERS = { single: ["q", "scope"], multi: ["categories", "for"] } as const;

export default function OpportunitiesPage() {
  return (
    <div className="container-page py-6">
      <ListPageHeader
        title="Opportunities"
        description="Grants, competitions, programs and more for entrepreneurs."
        action={
          <Button variant="outline" asChild>
            <Link href="/opportunities/analysis">
              <BarChart3 className="size-4" /> Insights
            </Link>
          </Button>
        }
      />
      {/* useSearchParams needs a Suspense boundary for production builds. */}
      <Suspense>
        <OpportunitiesContent />
      </Suspense>
    </div>
  );
}

function OpportunitiesContent() {
  const { values, update, clear, activeCount } = useUrlFilters(FILTERS);
  const feed = useOpportunitiesFeed({
    pageSize: 10,
    status: "APPROVED",
    searchQuery: values.q || undefined,
    categories: values.categories,
    targetBeneficiaries: values.for,
    geographicScope: values.scope || undefined,
  });

  return (
    <>
      <FilterBar
        activeCount={activeCount}
        onClear={clear}
        search={
          <SearchField
            value={values.q}
            onChange={(q) => update({ q })}
            placeholder="Search by title or organization…"
            className="max-w-xl"
          />
        }
      >
        <MultiSelectFilter label="Category" values={values.categories} options={OPPORTUNITY_CATEGORIES} onChange={(categories) => update({ categories })} />
        <MultiSelectFilter label="Who it's for" values={values.for} options={OPPORTUNITY_BENEFICIARIES} onChange={(v) => update({ for: v })} />
        <SelectFilter label="Location" value={values.scope} options={OPPORTUNITY_SCOPES} onChange={(scope) => update({ scope })} />
      </FilterBar>

      <ListResults
        query={feed}
        getKey={(o) => o.id}
        renderItem={(opportunity) => <OpportunityCard opportunity={opportunity} />}
        isFiltered={activeCount > 0}
        onClearFilters={clear}
        empty={{ icon: HandCoins, title: "No opportunities yet", description: "New grants and programs appear here as soon as they're published." }}
      />
    </>
  );
}
