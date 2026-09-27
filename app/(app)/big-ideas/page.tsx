"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Lightbulb, NotebookPen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BigIdeaCard } from "@/components/feed/big-idea-card";
import { ListPageHeader, ListResults } from "@/components/list-results";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchField } from "@/components/filters/search-field";
import { SelectFilter } from "@/components/filters/select-filter";
import { useBigIdeasFeed, useMyBigIdeas } from "@/lib/queries/big-ideas";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { IDEA_STAGES, IDEA_STATUSES, IDEA_SUBMISSION_TYPES } from "@/lib/data/filter-options";

const VIEW = { single: ["view"] } as const;
const FILTERS = { single: ["q", "stage", "type"] } as const;
const MY_FILTERS = { single: ["q", "status"] } as const;

const pitchButton = (
  <Button asChild>
    <Link href="/big-ideas/new">
      <Plus className="size-4" /> Pitch an idea
    </Link>
  </Button>
);

export default function BigIdeasPage() {
  return (
    <div className="container-page py-6">
      <ListPageHeader title="Big Ideas" description="Pitches from entrepreneurs across the network." action={pitchButton} />
      {/* useSearchParams needs a Suspense boundary for production builds. */}
      <Suspense>
        <BigIdeasContent />
      </Suspense>
    </div>
  );
}

function BigIdeasContent() {
  const view = useUrlFilters(VIEW);
  const mine = view.values.view === "mine";
  return (
    <Tabs value={mine ? "mine" : "all"} onValueChange={(v) => view.update({ view: v === "mine" ? "mine" : "" })}>
      <TabsList className="mb-5">
        <TabsTrigger value="all">
          <Lightbulb className="size-4" /> All ideas
        </TabsTrigger>
        <TabsTrigger value="mine">
          <NotebookPen className="size-4" /> My ideas
        </TabsTrigger>
      </TabsList>
      {mine ? <MyIdeas /> : <AllIdeas />}
    </Tabs>
  );
}

function AllIdeas() {
  const { values, update, clear, activeCount } = useUrlFilters(FILTERS);
  const feed = useBigIdeasFeed({
    pageSize: 10,
    searchQuery: values.q || undefined,
    stage: values.stage || undefined,
    submissionType: values.type || undefined,
  });

  return (
    <>
      <FilterBar
        activeCount={activeCount}
        onClear={clear}
        search={<SearchField value={values.q} onChange={(q) => update({ q })} placeholder="Search ideas…" className="max-w-xl" />}
      >
        <SelectFilter label="Stage" value={values.stage} options={IDEA_STAGES} onChange={(stage) => update({ stage })} />
        <SelectFilter label="Submitted by" value={values.type} options={IDEA_SUBMISSION_TYPES} onChange={(type) => update({ type })} />
      </FilterBar>

      <ListResults
        query={feed}
        getKey={(i) => i.id}
        renderItem={(idea) => <BigIdeaCard idea={idea} />}
        isFiltered={activeCount > 0}
        onClearFilters={clear}
        empty={{
          icon: Lightbulb,
          title: "No Big Ideas yet",
          description: "Approved pitches from across the network will appear here.",
          action: (
            <Button size="sm" asChild>
              <Link href="/big-ideas/new">Pitch an idea</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}

function MyIdeas() {
  const { values, update, clear, activeCount } = useUrlFilters(MY_FILTERS);
  const feed = useMyBigIdeas({ pageSize: 10, searchQuery: values.q || undefined, status: values.status || undefined });

  return (
    <>
      <FilterBar
        activeCount={activeCount}
        onClear={clear}
        search={<SearchField value={values.q} onChange={(q) => update({ q })} placeholder="Search your ideas…" className="max-w-xl" />}
      >
        <SelectFilter label="Status" value={values.status} options={IDEA_STATUSES} onChange={(status) => update({ status })} />
      </FilterBar>

      <ListResults
        query={feed}
        getKey={(i) => i.id}
        renderItem={(idea) => <BigIdeaCard idea={idea} owned />}
        isFiltered={activeCount > 0}
        onClearFilters={clear}
        empty={{
          icon: NotebookPen,
          title: "You haven't pitched an idea yet",
          description: "Start a draft, add your pitch deck or photos, then publish it for review.",
          action: (
            <Button size="sm" asChild>
              <Link href="/big-ideas/new">Pitch an idea</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
