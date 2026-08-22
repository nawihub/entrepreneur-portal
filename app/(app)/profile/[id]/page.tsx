"use client";

import { use, useState } from "react";
import {
  BadgeCheck,
  Sparkles,
  MapPin,
  Globe,
  Plus,
  Trash2,
  Rocket,
  Milestone,
} from "lucide-react";
import { GithubGlyph, LinkedinGlyph, FacebookGlyph } from "@/components/icons/brand-glyphs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileScoreRing } from "@/components/profile/profile-score-ring";
import { EditableListDialog } from "@/components/profile/editable-list-dialog";
import { StoryEditDialog } from "@/components/profile/story-edit-dialog";
import { FundingEditDialog } from "@/components/profile/funding-edit-dialog";
import { ConnectButton } from "@/components/profile/connect-button";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/format-money";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  useEntrepreneurJourneys,
  useEntrepreneurProfile,
  useEntrepreneurVentures,
  useJourneyMutations,
  useUpdateAwards,
  useUpdateEducation,
  useUpdateFunding,
  useUpdateMemberships,
  useUpdatePublicLinks,
  useUpdateReferences,
  useUpdateSkills,
  useUpdateStory,
  useVentureMutations,
} from "@/lib/queries/entrepreneurs";
import { toast } from "sonner";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const currentUser = useAuthStore((s) => s.user);
  const { data: profile, isLoading, isError } = useEntrepreneurProfile(id);
  const { data: journeys } = useEntrepreneurJourneys(id);
  const { data: ventures } = useEntrepreneurVentures(id);

  const updateStory = useUpdateStory(id);
  const updateFunding = useUpdateFunding(id);
  const updateSkills = useUpdateSkills(id);
  const updateEducation = useUpdateEducation(id);
  const updateReferences = useUpdateReferences(id);
  const updateMemberships = useUpdateMemberships(id);
  const updateAwards = useUpdateAwards(id);
  const updatePublicLinks = useUpdatePublicLinks(id);
  const journeyMutations = useJourneyMutations(id);
  const ventureMutations = useVentureMutations(id);

  const [journeyDialogOpen, setJourneyDialogOpen] = useState(false);
  const [ventureDialogOpen, setVentureDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container-page py-6">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={Rocket} title="Profile not found" description="This entrepreneur profile doesn't exist or isn't visible." />
      </div>
    );
  }

  const isOwner = currentUser?.id === profile.userId;
  const { identity, socialLinks } = profile;

  return (
    <div className="container-page flex flex-col gap-6 py-6">
      <Card className="animate-fade-in-up overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary-500 via-primary-400 to-secondary-500 sm:h-36" />
        <CardContent className="relative -mt-12 flex flex-col gap-4 pt-0 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end">
            <ProfileScoreRing score={profile.profileScore} size={104} strokeWidth={6}>
              <Avatar className="size-24 border-4 border-card">
                <AvatarImage src={identity.profilePhotoUrl ?? undefined} alt={identity.firstName} />
                <AvatarFallback className="text-xl">
                  {identity.firstName?.[0]}
                  {identity.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </ProfileScoreRing>
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-2xl font-semibold">
                  {identity.firstName} {identity.lastName}
                </h1>
                {identity.pronoun && <span className="text-sm text-muted-foreground">({identity.pronoun})</span>}
              </div>
              {identity.currentLocation && (
                <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
                  <MapPin className="size-3.5" /> {identity.currentLocation}
                </p>
              )}
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {profile.vetted && (
                  <Badge variant="vetted">
                    <BadgeCheck className="size-3" /> Vetted
                  </Badge>
                )}
                {profile.featured && (
                  <Badge variant="featured">
                    <Sparkles className="size-3" /> Featured
                  </Badge>
                )}
                {profile.needFunding && <Badge variant="warning">Seeking funding</Badge>}
                {profile.hasReceivedFunding && <Badge variant="success">Funded</Badge>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 sm:justify-end">
            {socialLinks?.github && <SocialLink href={socialLinks.github} icon={GithubGlyph} />}
            {socialLinks?.linkedin && <SocialLink href={socialLinks.linkedin} icon={LinkedinGlyph} />}
            {socialLinks?.facebook && <SocialLink href={socialLinks.facebook} icon={FacebookGlyph} />}
            {socialLinks?.website && <SocialLink href={socialLinks.website} icon={Globe} />}
            {!isOwner && <ConnectButton profileId={profile.id} name={identity.firstName} />}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="ventures">Ventures</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <SectionCard title="About" editor={isOwner && <StoryEditDialog story={profile.story} onSave={(p) => updateStory.mutateAsync(p)} />}>
              {profile.story?.aboutMe ? (
                <p className="whitespace-pre-line text-sm leading-relaxed">{profile.story.aboutMe}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No bio yet.</p>
              )}
              {profile.story?.successStory && (
                <>
                  <Separator className="my-3" />
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Success story</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{profile.story.successStory}</p>
                </>
              )}
            </SectionCard>

            <SectionCard
              title="Skills"
              editor={
                isOwner && (
                  <EditableListDialog
                    title="Skills"
                    items={profile.skills}
                    fields={[
                      { key: "name", label: "Skill" },
                      { key: "level", label: "Level (e.g. Advanced)" },
                    ]}
                    emptyItem={{ name: "", level: "" }}
                    onSave={(items) => updateSkills.mutateAsync(items)}
                  />
                )
              }
            >
              {profile.skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <Badge key={skill.id ?? i} variant="outline">
                      {skill.name}
                      {skill.level ? ` · ${skill.level}` : ""}
                    </Badge>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Education"
              editor={
                isOwner && (
                  <EditableListDialog
                    title="Education"
                    items={profile.education}
                    fields={[
                      { key: "institution", label: "Institution" },
                      { key: "credential", label: "Credential" },
                      { key: "fieldOfStudy", label: "Field of study" },
                      { key: "startYear", label: "Start year", type: "number" },
                      { key: "endYear", label: "End year", type: "number" },
                    ]}
                    emptyItem={{ institution: "", credential: "", fieldOfStudy: "", startYear: undefined, endYear: undefined }}
                    onSave={(items) => updateEducation.mutateAsync(items)}
                  />
                )
              }
            >
              <ListRows
                items={profile.education}
                empty="No education history yet."
                render={(e) => (
                  <>
                    <p className="font-medium">{e.institution}</p>
                    <p className="text-xs text-muted-foreground">
                      {[e.credential, e.fieldOfStudy].filter(Boolean).join(" · ")}
                      {e.startYear && ` · ${e.startYear}–${e.endYear ?? "present"}`}
                    </p>
                  </>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Memberships"
              editor={
                isOwner && (
                  <EditableListDialog
                    title="Memberships"
                    items={profile.memberships}
                    fields={[
                      { key: "organization", label: "Organization" },
                      { key: "role", label: "Role" },
                      { key: "startYear", label: "Start year", type: "number" },
                      { key: "endYear", label: "End year", type: "number" },
                    ]}
                    emptyItem={{ organization: "", role: "", startYear: undefined, endYear: undefined }}
                    onSave={(items) => updateMemberships.mutateAsync(items)}
                  />
                )
              }
            >
              <ListRows
                items={profile.memberships}
                empty="No memberships yet."
                render={(m) => (
                  <>
                    <p className="font-medium">{m.organization}</p>
                    {m.role && <p className="text-xs text-muted-foreground">{m.role}</p>}
                  </>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Awards"
              editor={
                isOwner && (
                  <EditableListDialog
                    title="Awards"
                    items={profile.awards}
                    fields={[
                      { key: "title", label: "Title" },
                      { key: "issuer", label: "Issuer" },
                      { key: "year", label: "Year", type: "number" },
                    ]}
                    emptyItem={{ title: "", issuer: "", year: undefined }}
                    onSave={(items) => updateAwards.mutateAsync(items)}
                  />
                )
              }
            >
              <ListRows
                items={profile.awards}
                empty="No awards yet."
                render={(a) => (
                  <>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{[a.issuer, a.year].filter(Boolean).join(" · ")}</p>
                  </>
                )}
              />
            </SectionCard>

            <SectionCard
              title="References"
              editor={
                isOwner && (
                  <EditableListDialog
                    title="References"
                    items={profile.references}
                    fields={[
                      { key: "name", label: "Name" },
                      { key: "relationship", label: "Relationship" },
                      { key: "contact", label: "Contact" },
                    ]}
                    emptyItem={{ name: "", relationship: "", contact: "" }}
                    onSave={(items) => updateReferences.mutateAsync(items)}
                  />
                )
              }
            >
              <ListRows
                items={profile.references}
                empty="No references yet."
                render={(r) => (
                  <>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{[r.relationship, r.contact].filter(Boolean).join(" · ")}</p>
                  </>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Public links"
              editor={
                isOwner && (
                  <EditableListDialog
                    title="Public links"
                    items={profile.publicLinks}
                    fields={[
                      { key: "label", label: "Label" },
                      { key: "url", label: "URL" },
                    ]}
                    emptyItem={{ label: "", url: "" }}
                    onSave={(items) => updatePublicLinks.mutateAsync(items)}
                  />
                )
              }
            >
              {profile.publicLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No public links yet.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {profile.publicLinks.map((link, i) => (
                    <li key={link.id ?? i}>
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <div className="flex flex-col gap-4">
            <SectionCard title="Funding" editor={isOwner && <FundingEditDialog funding={profile.funding} onSave={(p) => updateFunding.mutateAsync(p)} />}>
              {profile.funding?.needAmount && (
                <p className="text-sm">
                  Seeking <span className="font-semibold">{formatMoney(profile.funding.needAmount)}</span>
                </p>
              )}
              {profile.funding?.received && (
                <p className="text-sm text-muted-foreground">Received to date: {formatMoney(profile.funding.received)}</p>
              )}
              {profile.funding?.needNote && <p className="mt-2 text-sm text-muted-foreground">{profile.funding.needNote}</p>}
              {!profile.funding?.needAmount && !profile.funding?.received && (
                <p className="text-sm text-muted-foreground">No funding details shared yet.</p>
              )}
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="ventures" className="flex flex-col gap-4">
          {isOwner && (
            <div className="flex justify-end">
              <Dialog open={ventureDialogOpen} onOpenChange={setVentureDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="size-4" /> Add venture
                  </Button>
                </DialogTrigger>
                <AddVentureDialogContent
                  onClose={() => setVentureDialogOpen(false)}
                  onSubmit={(payload) => ventureMutations.add.mutateAsync(payload)}
                />
              </Dialog>
            </div>
          )}
          {!ventures?.length ? (
            <EmptyState icon={Rocket} title="No ventures listed" description={isOwner ? "Add a venture you've founded or worked on." : "This entrepreneur hasn't listed any ventures yet."} />
          ) : (
            ventures.map((venture) => (
              <Card key={venture.id} className="animate-fade-in-up">
                <CardContent className="flex items-start justify-between gap-3 pt-6">
                  <div>
                    <p className="font-display font-semibold">{venture.name}</p>
                    {venture.role && <p className="text-sm text-muted-foreground">{venture.role}</p>}
                    {venture.description && <p className="mt-1.5 text-sm">{venture.description}</p>}
                  </div>
                  {venture.active && <Badge variant="success">Active</Badge>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="journey" className="flex flex-col gap-4">
          {isOwner && (
            <div className="flex justify-end">
              <Dialog open={journeyDialogOpen} onOpenChange={setJourneyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="size-4" /> Add milestone
                  </Button>
                </DialogTrigger>
                <AddJourneyDialogContent
                  onClose={() => setJourneyDialogOpen(false)}
                  onSubmit={(payload) => journeyMutations.add.mutateAsync(payload)}
                />
              </Dialog>
            </div>
          )}
          {!journeys?.length ? (
            <EmptyState icon={Milestone} title="No journey entries yet" description={isOwner ? "Log the milestones that matter." : "Nothing shared here yet."} />
          ) : (
            <ol className="relative flex flex-col gap-6 border-l border-border pl-6">
              {journeys.map((entry) => (
                <li key={entry.id} className="relative animate-fade-in-up">
                  <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-primary-500 ring-4 ring-background" />
                  <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-medium">{entry.title}</p>
                      {entry.description && <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>}
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          journeyMutations.remove.mutate(entry.id, {
                            onError: () => toast.error("Couldn't remove that entry"),
                          })
                        }
                      >
                        <Trash2 className="size-4 text-error" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionCard({
  title,
  editor,
  children,
}: {
  title: string;
  editor?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {editor}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function ListRows<T>({
  items,
  empty,
  render,
}: {
  items: T[];
  empty: string;
  render: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i}>{render(item)}</div>
      ))}
    </div>
  );
}

function SocialLink({
  href,
  icon: Icon,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-primary-600 dark:hover:text-primary-400"
    >
      <Icon className="size-4" />
    </a>
  );
}

function AddVentureDialogContent({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: { name: string; role?: string; description?: string; active: boolean }) => Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name, role: role || undefined, description: description || undefined, active: true });
      toast.success("Venture added");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add venture");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a venture</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Your role</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Founder & CEO" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
          {saving ? "Adding…" : "Add venture"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AddJourneyDialogContent({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: { title: string; description?: string; date: string }) => Promise<unknown>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ title, description: description || undefined, date: new Date(date).toISOString() });
      toast.success("Milestone added");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add milestone");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a journey milestone</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Launched MVP" />
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
          {saving ? "Adding…" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
