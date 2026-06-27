"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import {
  AlertTriangle,
  Clock3,
  FileText,
  History,
  Loader2,
  Trash2,
  Linkedin,
  Twitter,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LinkedInPostData = {
  id: string;
  content: string | null;
  status: string;
  scheduledAt: Date | null;
} | null;

type XPostData = {
  id: string;
  content: string | null;
  mode: string | null;
  threadPosts: unknown;
  status: string;
  scheduledAt: Date | null;
} | null;

type DraftListItem = {
  id: string;
  title: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  linkedinPost?: LinkedInPostData;
  xPost?: XPostData;
};

function getDeleteImpactItems(draft: DraftListItem) {
  const items: {
    key: "linkedin" | "x";
    label: string;
    status: string;
    Icon: typeof Linkedin;
    className: string;
  }[] = [];

  if (draft.linkedinPost) {
    items.push({
      key: "linkedin",
      label: "LinkedIn",
      status: draft.linkedinPost.status,
      Icon: Linkedin,
      className:
        "bg-blue-50/80 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
    });
  }

  if (draft.xPost) {
    items.push({
      key: "x",
      label: "X",
      status: draft.xPost.status,
      Icon: Twitter,
      className:
        "bg-slate-50/80 text-slate-700 ring-1 ring-inset ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
    });
  }

  return items;
}

function formatPlatformStatus(status: string) {
  return status === "SCHEDULED" ? "Scheduled" : "Draft";
}

interface DraftsGridProps {
  initialDrafts: DraftListItem[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function DraftsGrid({ initialDrafts }: DraftsGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: drafts = initialDrafts } = useQuery({
    queryKey: ["drafts"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/drafts");
      if (!response.ok) throw new Error("Failed to fetch drafts");
      return response.json() as Promise<DraftListItem[]>;
    },
    initialData: initialDrafts,
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [filterOption, setFilterOption] = useState(
    searchParams.get("filter") || "all",
  );
  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") || "recent",
  );
  const [visibleCount, setVisibleCount] = useState(24);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setVisibleCount(24);
  }, [debouncedSearchQuery, filterOption, sortOption]);

  const updateUrlParams = useCallback(
    (newSearch: string, newFilter: string, newSort: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newSearch) params.set("search", newSearch);
      else params.delete("search");

      if (newFilter && newFilter !== "all") params.set("filter", newFilter);
      else params.delete("filter");

      if (newSort && newSort !== "recent") params.set("sort", newSort);
      else params.delete("sort");

      const newQueryString = params.toString();
      if (newQueryString !== searchParams.toString()) {
        router.replace(`${pathname}?${newQueryString}`, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    updateUrlParams(debouncedSearchQuery, filterOption, sortOption);
  }, [debouncedSearchQuery, filterOption, sortOption, updateUrlParams]);

  const [pendingDeleteDraft, setPendingDeleteDraft] =
    useState<DraftListItem | null>(null);
  const pendingDeleteImpact = pendingDeleteDraft
    ? getDeleteImpactItems(pendingDeleteDraft)
    : [];
  const pendingDeleteIncludesScheduled = pendingDeleteImpact.some(
    (item) => item.status === "SCHEDULED",
  );

  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const response = await fetch(`/api/dashboard/drafts/${draftId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;

        const error = new Error(
          errorBody?.message ?? errorBody?.error ?? "Failed to delete draft.",
        );
        (error as unknown as { status: number }).status = response.status;
        throw error;
      }
    },
    onMutate: async (draftId) => {
      await queryClient.cancelQueries({ queryKey: ["drafts"] });
      const previousDrafts =
        queryClient.getQueryData<DraftListItem[]>(["drafts"]) || drafts;

      queryClient.setQueryData<DraftListItem[]>(["drafts"], (old) =>
        old ? old.filter((draft) => draft.id !== draftId) : old,
      );

      setPendingDeleteDraft(null);

      return { previousDrafts };
    },
    onSuccess: () => {
      toast.success("Draft deleted.");
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
    onError: (error, _draftId, context) => {
      if (
        (error as unknown as { status: number }).status !== 404 &&
        context?.previousDrafts
      ) {
        queryClient.setQueryData(["drafts"], context.previousDrafts);
      }

      console.error("Failed to delete draft:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete draft.",
      );
    },
  });

  const fuse = useMemo(() => {
    return new Fuse(drafts, {
      keys: ["title", "topic"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    let result = drafts;

    if (debouncedSearchQuery.trim()) {
      const fuseResults = fuse.search(debouncedSearchQuery);
      result = fuseResults.map((r) => r.item);
    }

    result = result.filter((draft) => {
      if (filterOption === "linkedin") return !!draft.linkedinPost;
      if (filterOption === "x") return !!draft.xPost;
      if (filterOption === "scheduled")
        return (
          draft.linkedinPost?.status === "SCHEDULED" ||
          draft.xPost?.status === "SCHEDULED"
        );
      if (filterOption === "drafts")
        return (
          draft.linkedinPost?.status !== "SCHEDULED" &&
          draft.xPost?.status !== "SCHEDULED"
        );
      return true;
    });

    return result;
  }, [drafts, debouncedSearchQuery, filterOption, fuse]);

  const sortedDrafts = useMemo(() => {
    return [...filteredDrafts].sort((a, b) => {
      if (sortOption === "recent") {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } else if (sortOption === "oldest") {
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      } else if (sortOption === "newest-created") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortOption === "az") {
        return a.topic.localeCompare(b.topic);
      }
      return 0;
    });
  }, [filteredDrafts, sortOption]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterOption("all");
    setSortOption("recent");
  };

  const visibleDrafts = sortedDrafts.slice(0, visibleCount);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search drafts by topic or title..."
            className="pl-9 rounded-xl border-border/60 bg-card shadow-sm h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={filterOption} onValueChange={setFilterOption}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl h-10 bg-card shadow-sm border-border/60 font-medium">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Drafts</SelectItem>
              <SelectItem value="linkedin">LinkedIn Only</SelectItem>
              <SelectItem value="x">X Only</SelectItem>
              <SelectItem value="scheduled">Scheduled Only</SelectItem>
              <SelectItem value="drafts">Drafts Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl h-10 bg-card shadow-sm border-border/60 font-medium">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="recent">Recently Edited</SelectItem>
              <SelectItem value="oldest">Oldest Edited</SelectItem>
              <SelectItem value="newest-created">Newest Created</SelectItem>
              <SelectItem value="az">A-Z by Topic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-12 text-center">
          <Search className="size-8 text-muted-foreground/40 mb-4" />
          <p className="text-sm font-medium text-foreground">No drafts found</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Try adjusting your search or filters.
          </p>
          {(searchQuery ||
            filterOption !== "all" ||
            sortOption !== "recent") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="rounded-xl"
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleDrafts.map((draft) => (
              // biome-ignore lint/a11y/useSemanticElements: The card contains its own delete button, so a native button wrapper would be invalid nested interactive markup.
              <div
                key={draft.id}
                tabIndex={0}
                role="button"
                className="group flex h-full cursor-pointer flex-col rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card dark:border-transparent dark:bg-card/80 dark:hover:bg-card"
                onClick={() => router.push(`/dashboard/drafts/${draft.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/dashboard/drafts/${draft.id}`);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {(draft.linkedinPost?.status === "DRAFT" ||
                      draft.xPost?.status === "DRAFT") && (
                      <div className="flex gap-1">
                        {draft.linkedinPost?.status === "DRAFT" && (
                          <span className="inline-flex items-center rounded-md bg-blue-50/80 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                            LinkedIn
                          </span>
                        )}
                        {draft.xPost?.status === "DRAFT" && (
                          <span className="inline-flex items-center rounded-md bg-slate-50/80 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20">
                            X
                          </span>
                        )}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] sm:min-h-[32px] sm:h-8 rounded-full border-border/60 bg-background/70 px-4 sm:px-3 text-xs font-medium text-muted-foreground shadow-none hover:border-destructive/25 hover:bg-destructive/8 hover:text-destructive dark:bg-input/20 dark:hover:bg-destructive/15"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteDraft(draft);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      aria-label={`Delete all content for ${draft.title}`}
                    >
                      <Trash2 />
                      Delete all
                    </Button>
                  </div>
                </div>

                <div className="mt-5 flex flex-1 flex-col">
                  <h3 className="line-clamp-1 text-lg font-bold leading-7 text-foreground transition-colors group-hover:text-primary capitalize">
                    {draft.topic}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {draft.title}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 pt-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted/45 px-3 py-1.5 text-xs font-medium text-foreground">
                      <Clock3 className="size-3.5 text-muted-foreground" />
                      <span>Edited {formatDate(draft.updatedAt)}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      <History className="size-3.5" />
                      <span>Created {formatDate(draft.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < sortedDrafts.length && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                className="rounded-xl border-border/60 bg-card px-8 shadow-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => setVisibleCount((prev) => prev + 24)}
              >
                Load more drafts
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog
        open={pendingDeleteDraft !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteDraft(null);
          }
        }}
      >
        <DialogContent className="rounded-2xl p-0 sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-4 border-b px-6 py-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-left">Delete draft?</DialogTitle>
                <DialogDescription className="mt-2 text-left leading-6">
                  This will delete the base idea and every platform version
                  attached to it.
                </DialogDescription>
                {pendingDeleteDraft ? (
                  <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm font-medium text-foreground">
                    {pendingDeleteDraft.title}
                  </p>
                ) : null}
                {pendingDeleteImpact.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pendingDeleteImpact.map((item) => {
                      const Icon = item.Icon;
                      return (
                        <span
                          key={item.key}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${item.className}`}
                        >
                          <Icon className="size-3.5" />
                          {item.label} {formatPlatformStatus(item.status)}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
                {pendingDeleteIncludesScheduled ? (
                  <p className="mt-3 text-sm font-medium text-destructive">
                    Scheduled posts for this draft will also be removed from the
                    calendar.
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="px-6 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteDraft(null)}
              disabled={deleteDraftMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (pendingDeleteDraft) {
                  deleteDraftMutation.mutate(pendingDeleteDraft.id);
                }
              }}
              disabled={deleteDraftMutation.isPending}
            >
              {deleteDraftMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 />
              )}
              {deleteDraftMutation.isPending
                ? "Deleting..."
                : "Delete everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
