"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@/components/feed/business-card";
import { ListPageHeader, ListResults } from "@/components/list-results";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchField } from "@/components/filters/search-field";
import { SelectFilter } from "@/components/filters/select-filter";
import { MultiSelectFilter } from "@/components/filters/multi-select-filter";
import { useBusinessesFeed } from "@/lib/queries/businesses";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { BUSINESS_CATEGORIES, BUSINESS_STATUSES } from "@/lib/data/filter-options";

const FILTERS = { single: ["q", "status"], multi: ["categories"] } as const;

export default function BusinessesPage() {
  return (
    <div className="container-page py-6">
      <ListPageHeader
        title="My businesses"
        description="Businesses you've registered on NaWeHub, and where each registration stands."
        action={
          <Button asChild>
            <Link href="/businesses/new">
              <Plus className="size-4" /> Register a business
            </Link>
          </Button>
        }
      />
      {/* useSearchParams needs a Suspense boundary for production builds. */}
      <Suspense>
        <BusinessesContent />
      </Suspense>
    </div>
  );
}

function BusinessesContent() {
  const { values, update, clear, activeCount } = useUrlFilters(FILTERS);
  const feed = useBusinessesFeed({
    pageSize: 10,
    query: values.q || undefined,
    status: values.status || undefined,
    categories: values.categories,
  });

  return (
    <>
      <FilterBar
        activeCount={activeCount}
        onClear={clear}
        search={
          <SearchField value={values.q} onChange={(q) => update({ q })} placeholder="Search your businesses…" className="max-w-xl" />
        }
      >
        <SelectFilter label="Status" value={values.status} options={BUSINESS_STATUSES} onChange={(status) => update({ status })} />
        <MultiSelectFilter label="Category" values={values.categories} options={BUSINESS_CATEGORIES} onChange={(categories) => update({ categories })} />
      </FilterBar>

      <ListResults
        query={feed}
        getKey={(b) => b.id}
        renderItem={(business) => <BusinessCard business={business} />}
        isFiltered={activeCount > 0}
        onClearFilters={clear}
        empty={{
          icon: Building2,
          title: "No businesses yet",
          description: "Register your first business to track its registration here.",
          action: (
            <Button size="sm" asChild>
              <Link href="/businesses/new">Register a business</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
