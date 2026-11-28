"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle, Users } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  SearchInput,
  Skeleton,
} from "@bandhan/ui";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetCommunitiesQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  type Community,
  type CommunityMember,
} from "@/store/api/communityApi";
import { getApiMessage } from "@/lib/apiError";

function getMemberId(member: string | CommunityMember): string {
  if (typeof member === "string") return member;
  return String(member?._id ?? member?.id ?? "");
}

export default function CommunitiesPage() {
  const { user } = useAuth();
  const { data: communities = [], isLoading, isError, refetch } = useGetCommunitiesQuery();
  const [joinCommunity] = useJoinCommunityMutation();
  const [leaveCommunity] = useLeaveCommunityMutation();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [busyId, setBusyId] = useState<string | null>(null);

  const userId = user?.id ? String(user.id) : "";

  const categories = useMemo(() => {
    const values = communities
      .map((community) => community.category)
      .filter((value): value is string => Boolean(value));
    return ["All", ...Array.from(new Set(values))];
  }, [communities]);

  const filteredCommunities = useMemo(() => {
    const query = search.trim().toLowerCase();
    return communities.filter((community) => {
      const matchesCategory = selectedCategory === "All" || community.category === selectedCategory;
      const matchesSearch = !query
        || community.name.toLowerCase().includes(query)
        || community.description?.toLowerCase().includes(query)
        || community.category?.toLowerCase().includes(query);
      return matchesCategory && Boolean(matchesSearch);
    });
  }, [communities, search, selectedCategory]);

  const isJoined = (community: Community) => {
    if (!userId) return false;
    const members = community.members;
    if (typeof members === "number") return false;
    return (members || []).some((member) => getMemberId(member) === userId);
  };

  const handleMembership = async (community: Community, action: "join" | "leave") => {
    if (!userId) {
      toast.error("Please sign in to join communities.");
      return;
    }
    if (busyId) return;

    setBusyId(community._id);
    try {
      if (action === "join") await joinCommunity(community._id).unwrap();
      else await leaveCommunity(community._id).unwrap();

      toast.success(action === "join" ? `Joined ${community.name}.` : `Left ${community.name}.`);
      await refetch();
    } catch (err: unknown) {
      toast.error(getApiMessage(err, "Could not update your membership. Please try again."));
    } finally {
      setBusyId(null);
    }
  };

  const hasFilters = selectedCategory !== "All" || search.trim().length > 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <PageHeader
          title="Communities"
          subtitle="Discover Bandhan communities, join the ones you care about, and keep up with shared event ideas."
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search communities"
            className="w-full sm:max-w-sm"
            aria-label="Search communities"
          />
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2" aria-label="Filter communities by category">
              {categories.map((category) => (
                <Chip key={category} selected={selectedCategory === category} aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
                  {category}
                </Chip>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} padded={false} className="overflow-hidden">
                  <Skeleton height={140} width="100%" />
                  <div className="space-y-3 p-5">
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={14} width="100%" />
                    <Skeleton height={14} width="80%" />
                    <Skeleton height={36} width={100} />
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={<AlertCircle className="text-[var(--bhn-error-600)]" size={34} />}
              title="Communities could not be loaded"
              description="We could not fetch the community list right now. Please try again."
              action={<Button onClick={() => void refetch()}>Try again</Button>}
            />
          ) : filteredCommunities.length === 0 ? (
            <EmptyState
              icon={<Users className="text-[var(--bhn-brand-600)]" size={34} />}
              title={hasFilters ? "No matching communities" : "No communities yet"}
              description={hasFilters
                ? "Try a different search or category to find a community."
                : "Communities will appear here once Bandhan creates them."}
              action={hasFilters ? (
                <Button variant="secondary" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>
                  Clear filters
                </Button>
              ) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCommunities.map((community) => {
                const joined = isJoined(community);
                const members = community.members;
                const memberCount = typeof members === "number" ? members : members?.length ?? 0;
                const status = community.isActive === false ? "Inactive" : community.status || "Active";
                const busy = busyId === community._id;

                return (
                  <Card key={community._id} padded={false} hover className="flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--bhn-surface-3)]">
                      {community.coverImage ? (
                        <Image
                          src={community.coverImage}
                          alt={community.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--bhn-text-soft)]">
                          <Users size={34} aria-hidden="true" />
                          <span className="sr-only">No cover image for {community.name}</span>
                        </div>
                      )}
                      <div className="absolute left-3 top-3">
                        <Badge tone={community.isActive === false ? "neutral" : "success"}>{status}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div>
                        <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">{community.name}</h3>
                        {community.category && (
                          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--bhn-brand-700)]">
                            {community.category}
                          </p>
                        )}
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-[var(--bhn-text-muted)]">
                        {community.description || "No description provided yet."}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-[var(--bhn-text-muted)]">
                        <Users size={14} aria-hidden="true" />
                        <span>{memberCount} member{memberCount === 1 ? "" : "s"}</span>
                        {community.createdAt && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                      <div className="mt-auto pt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={joined ? "outline" : "primary"}
                          block
                          loading={busy}
                          disabled={busyId !== null}
                          onClick={() => void handleMembership(community, joined ? "leave" : "join")}
                        >
                          {joined ? "Leave community" : "Join community"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
