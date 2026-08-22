"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateBigIdea } from "@/lib/queries/big-ideas";

export default function NewBigIdeaPage() {
  const router = useRouter();
  const createMutation = useCreateBigIdea();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [category, setCategory] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const idea = await createMutation.mutateAsync({
        title,
        summary,
        problem: problem || undefined,
        solution: solution || undefined,
        category: category || undefined,
      });
      toast.success("Your idea has been submitted for review");
      router.replace(`/big-ideas/${idea.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit your idea");
    }
  }

  return (
    <div className="container-page max-w-2xl py-6">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Pitch a Big Idea</CardTitle>
          <CardDescription>Tell us about the venture concept you want to bring to life.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. AgriTech" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="problem">Problem</Label>
              <Textarea id="problem" value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solution">Solution</Label>
              <Textarea id="solution" value={solution} onChange={(e) => setSolution(e.target.value)} rows={3} />
            </div>
            <Button type="submit" disabled={createMutation.isPending || !title || !summary} className="w-fit">
              {createMutation.isPending ? "Submitting…" : "Submit for review"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Supporting material (pitch decks, images) can be attached after submission from the idea&apos;s page.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
