"use client";

import { Suspense } from "react";
import Link from "next/link";
import { BarChart3, FilePlus2, HandCoins, Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunityCard } from "@/components/feed/opportunity-card";
import { ListPageHeader, ListResults } from "@/components/list-results";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchField } from "@/components/filters/search-field";
import { SelectFilter } from "@/components/filters/select-filter";
import { MultiSelectFilter } from "@/components/filters/multi-select-filter";
import { useMyOpportunities, useOpportunitiesFeed } from "@/lib/queries/opportunities";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { OPPORTUNITY_BENEFICIARIES, OPPORTUNITY_CATEGORIES, OPPORTUNITY_SCOPES, OPPORTUNITY_STATUSES } from "@/lib/data/filter-options";

const VIEW = { single: ["view"] } as const;
const FILTERS = { single: ["q", "scope"], multi: ["categories", "for"] } as const;
const MY_FILTERS = { single: ["q", "status"] } as const;

export default function OpportunitiesPage() {
  return (
    <div className="container-page py-6">
      <ListPageHeader
        title="Opportunities"
        description="Grants, competitions, programs and more for entrepreneurs."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/opportunities/analysis">
                <BarChart3 className="size-4" /> Insights
              </Link>
            </Button>
            <Button asChild>
              <Link href="/opportunities/new">
                <Plus className="size-4" /> Post an opportunity
              </Link>
            </Button>
          </div>
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
  const view = useUrlFilters(VIEW);
  const mine = view.values.view === "mine";
  return (
    <Tabs value={mine ? "mine" : "all"} onValueChange={(v) => view.update({ view: v === "mine" ? "mine" : "" })}>
      <TabsList className="mb-5">
        <TabsTrigger value="all">
          <HandCoins className="size-4" /> All opportunities
        </TabsTrigger>
        <TabsTrigger value="mine">
          <Megaphone className="size-4" /> My opportunities
        </TabsTrigger>
      </TabsList>
      {mine ? <MyOpportunities /> : <AllOpportunities />}
    </Tabs>
  );
}

function AllOpportunities() {
  const { values, update, clear, activeCount } = useUrlFilters(FILTERS);
  const feed = useOpportunitiesFeed({
    pageSize: 10,
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
        layout="grid"
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

function MyOpportunities() {
  const { values, update, clear, activeCount } = useUrlFilters(MY_FILTERS);
  const feed = useMyOpportunities({ pageSize: 10, searchQuery: values.q || undefined, status: values.status || undefined });

  return (
    <>
      <FilterBar
        activeCount={activeCount}
        onClear={clear}
        search={<SearchField value={values.q} onChange={(q) => update({ q })} placeholder="Search your opportunities…" className="max-w-xl" />}
      >
        <SelectFilter label="Status" value={values.status} options={OPPORTUNITY_STATUSES} onChange={(status) => update({ status })} />
      </FilterBar>

      <ListResults
        layout="grid"
        query={feed}
        getKey={(o) => o.id}
        renderItem={(opportunity) => <OpportunityCard opportunity={opportunity} owned />}
        isFiltered={activeCount > 0}
        onClearFilters={clear}
        empty={{
          icon: FilePlus2,
          title: "You haven't posted an opportunity yet",
          description: "Share a grant, program or event with the network. It's saved as a draft until you publish it for review.",
          action: (
            <Button size="sm" asChild>
              <Link href="/opportunities/new">Post an opportunity</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
