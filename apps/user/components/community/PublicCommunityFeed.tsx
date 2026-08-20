"use client";

import { useState } from "react";
import {
  Heart,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  Send,
  Share2,
  UsersRound,
} from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useRequireAuth } from "@/lib/auth";
import {
  type CommunityComment,
  type CommunityPost,
  useCommentPostMutation,
  useCreatePostMutation,
  useGetPostsQuery,
  useLikePostMutation,
} from "@/store/api/feedApi";

const formatPostDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const roleLabel = (value?: string) =>
  String(value || "member")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const initials = (name?: string) => {
  const letters = String(name || "Bandhan member")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return letters.toUpperCase() || "B";
};

const mutationMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const data = "data" in error ? error.data : undefined;
  if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
    return data.message;
  }
  return fallback;
};

function MemberAvatar({ name, image, size = "md" }: { name?: string; image?: string; size?: "sm" | "md" }) {
  const dimensions = size === "sm" ? "h-8 w-8 text-[10px]" : "h-11 w-11 text-xs";

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bhn-brand-100)] font-extrabold text-[var(--bhn-brand-800)] ${dimensions}`}>
      {initials(name)}
      {image ? (
        // Community media is supplied by members and can use different CDN hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
}

function Comment({ comment }: { comment: CommunityComment }) {
  return (
    <div className="flex gap-2.5">
      <MemberAvatar name={comment.user} size="sm" />
      <div className="min-w-0 flex-1 rounded-2xl bg-[var(--bhn-surface-2)] px-3.5 py-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-bold text-[var(--bhn-text)]">{comment.user || "Bandhan member"}</p>
          {formatPostDate(comment.createdAt) ? (
            <time dateTime={comment.createdAt} className="text-[10px] text-[var(--bhn-text-soft)]">{formatPostDate(comment.createdAt)}</time>
          ) : null}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[var(--bhn-text-muted)]">{comment.text}</p>
      </div>
    </div>
  );
}

export default function PublicCommunityFeed() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isAuthed, gate } = useRequireAuth();
  const { data: posts = [], isLoading, isFetching, isError, refetch } = useGetPostsQuery();
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [likePost] = useLikePostMutation();
  const [commentPost] = useCommentPostMutation();
  const [postText, setPostText] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [pendingLikeId, setPendingLikeId] = useState("");
  const [pendingCommentId, setPendingCommentId] = useState("");

  const handleCreatePost = async () => {
    const content = postText.trim();
    if (!gate()) return;
    if (!content) {
      toast.error("Write something before publishing your post.");
      return;
    }

    try {
      await createPost({ content }).unwrap();
      setPostText("");
      toast.success("Your post is now in the community feed.");
    } catch (error) {
      toast.error(mutationMessage(error, "We could not publish your post."));
    }
  };

  const handleLike = (postId: string) => {
    gate(() => {
      setPendingLikeId(postId);
      void likePost({ postId })
        .unwrap()
        .then(() => toast.success("Reaction updated."))
        .catch((error) => toast.error(mutationMessage(error, "We could not update your reaction.")))
        .finally(() => setPendingLikeId(""));
    });
  };

  const handleComment = (postId: string) => {
    gate(() => {
      const text = String(commentDrafts[postId] || "").trim();
      if (!text) {
        toast.error("Write a comment first.");
        return;
      }

      setPendingCommentId(postId);
      void commentPost({ postId, text })
        .unwrap()
        .then(() => {
          setCommentDrafts((current) => ({ ...current, [postId]: "" }));
          toast.success("Comment added.");
        })
        .catch((error) => toast.error(mutationMessage(error, "We could not add your comment.")))
        .finally(() => setPendingCommentId(""));
    });
  };

  const handleShare = async (post: CommunityPost) => {
    const shareUrl = `${window.location.origin}/community#post-${encodeURIComponent(post.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.user} on Bandhan`, text: post.content, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Post link copied.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("We could not share this post.");
    }
  };

  return (
    <AppShell>
      <section className="border-b border-[var(--bhn-border)] bg-gradient-to-b from-[var(--bhn-brand-50)] to-[var(--bhn-bg)]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bhn-brand-100)] text-[var(--bhn-brand-800)]">
            <UsersRound aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--bhn-brand-700)]">Bandhan Community</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-[var(--bhn-text)] sm:text-5xl">Ideas and stories from real celebrations</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--bhn-text-muted)]">Read public posts from the Bandhan community. Sign in only when you want to publish, react or comment.</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6" aria-label="Community feed">
        {!isAuthed ? (
          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[var(--bhn-brand-200)] bg-[var(--bhn-brand-50)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--bhn-brand-700)]" />
              <div>
                <p className="text-sm font-bold text-[var(--bhn-text)]">Browsing is open to everyone</p>
                <p className="mt-1 text-xs leading-5 text-[var(--bhn-text-muted)]">Your account is only needed to post, like or comment.</p>
              </div>
            </div>
            <button type="button" onClick={() => gate()} className="min-h-10 shrink-0 rounded-xl bg-[var(--bhn-brand-700)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--bhn-brand-800)]">
              Sign in to join
            </button>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4 shadow-[var(--bhn-shadow-sm)] sm:p-5">
            <div className="flex gap-3">
              <MemberAvatar name={currentUser?.name} />
              <div className="min-w-0 flex-1">
                <label htmlFor="community-post" className="text-sm font-bold text-[var(--bhn-text)]">Share with the community</label>
                <textarea
                  id="community-post"
                  value={postText}
                  onChange={(event) => setPostText(event.target.value)}
                  maxLength={3000}
                  rows={4}
                  placeholder="Share an event idea, question or celebration story…"
                  className="mt-2 w-full resize-y rounded-2xl border border-[var(--bhn-border-strong)] bg-[var(--bhn-bg)] px-4 py-3 text-sm leading-6 text-[var(--bhn-text)] outline-none placeholder:text-[var(--bhn-text-soft)] focus:border-[var(--bhn-brand-500)] focus:ring-2 focus:ring-[var(--bhn-brand-100)]"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[var(--bhn-text-soft)]">{postText.length}/3000</span>
                  <button
                    type="button"
                    onClick={handleCreatePost}
                    disabled={isCreating || !postText.trim()}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--bhn-brand-700)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--bhn-brand-800)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreating ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" />}
                    {isCreating ? "Publishing…" : "Publish post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3" role="status">
            <LoaderCircle aria-hidden="true" className="h-7 w-7 animate-spin text-[var(--bhn-brand-600)]" />
            <p className="text-sm text-[var(--bhn-text-muted)]">Loading community posts…</p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
            <h2 className="text-lg font-bold text-red-900">The community feed is unavailable</h2>
            <p className="mt-2 text-sm text-red-700">Please check your connection and try again.</p>
            <button type="button" onClick={() => refetch()} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--bhn-brand-700)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--bhn-brand-800)]">
              <RefreshCw aria-hidden="true" className="h-4 w-4" /> Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--bhn-border-strong)] bg-[var(--bhn-surface-2)] px-5 py-12 text-center">
            <UsersRound aria-hidden="true" className="mx-auto h-9 w-9 text-[var(--bhn-brand-400)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--bhn-text)]">No community posts yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--bhn-text-muted)]">When members publish their first stories and ideas, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-5" aria-live="polite">
            {posts.map((post) => (
              <article id={`post-${post.id}`} key={post.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] shadow-[var(--bhn-shadow-sm)]">
                <div className="p-4 sm:p-5">
                  <header className="flex items-start gap-3">
                    <MemberAvatar name={post.user} image={post.avatar} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold text-[var(--bhn-text)]">{post.user || "Bandhan member"}</h2>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--bhn-text-soft)]">
                        <span>{roleLabel(post.role)}</span>
                        {formatPostDate(post.time) ? <><span aria-hidden="true">•</span><time dateTime={post.time}>{formatPostDate(post.time)}</time></> : null}
                      </p>
                    </div>
                  </header>

                  {post.content ? <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--bhn-text-muted)]">{post.content}</p> : null}
                </div>

                {post.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image} alt={`Shared by ${post.user}`} loading="lazy" className="max-h-[560px] w-full border-y border-[var(--bhn-border)] object-cover" />
                ) : null}
                {post.video ? (
                  <video controls preload="metadata" className="max-h-[560px] w-full border-y border-[var(--bhn-border)] bg-black" aria-label={`Video shared by ${post.user}`}>
                    <source src={post.video} />
                  </video>
                ) : null}

                <div className="flex items-center gap-1 border-t border-[var(--bhn-border)] px-3 py-2 sm:px-4">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    disabled={pendingLikeId === post.id}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-brand-50)] hover:text-[var(--bhn-brand-800)] disabled:opacity-50"
                    aria-label={`Like post. ${post.likes} likes`}
                  >
                    {pendingLikeId === post.id ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Heart aria-hidden="true" className="h-4 w-4" />}
                    Like <span className="font-medium">{post.likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => isAuthed ? document.getElementById(`comment-${post.id}`)?.focus() : gate()}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-brand-50)] hover:text-[var(--bhn-brand-800)]"
                    aria-label={`Comment on post. ${post.comments.length} comments`}
                  >
                    <MessageCircle aria-hidden="true" className="h-4 w-4" /> Comment <span className="font-medium">{post.comments.length}</span>
                  </button>
                  <button type="button" onClick={() => void handleShare(post)} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-brand-50)] hover:text-[var(--bhn-brand-800)]">
                    <Share2 aria-hidden="true" className="h-4 w-4" /> Share
                  </button>
                </div>

                {post.comments.length > 0 || isAuthed ? (
                  <div className="space-y-3 border-t border-[var(--bhn-border)] bg-[var(--bhn-bg)] p-4 sm:p-5">
                    {post.comments.map((comment, index) => <Comment key={comment.id || comment._id || `${post.id}-${index}`} comment={comment} />)}
                    {isAuthed ? (
                      <div className="flex gap-2.5 pt-1">
                        <MemberAvatar name={currentUser?.name} size="sm" />
                        <div className="flex min-w-0 flex-1 gap-2">
                          <label htmlFor={`comment-${post.id}`} className="sr-only">Write a comment</label>
                          <input
                            id={`comment-${post.id}`}
                            value={commentDrafts[post.id] || ""}
                            onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                handleComment(post.id);
                              }
                            }}
                            maxLength={1000}
                            placeholder="Write a comment…"
                            className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--bhn-border-strong)] bg-white px-3 text-xs text-[var(--bhn-text)] outline-none placeholder:text-[var(--bhn-text-soft)] focus:border-[var(--bhn-brand-500)] focus:ring-2 focus:ring-[var(--bhn-brand-100)]"
                          />
                          <button
                            type="button"
                            onClick={() => handleComment(post.id)}
                            disabled={pendingCommentId === post.id || !String(commentDrafts[post.id] || "").trim()}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bhn-brand-700)] text-white hover:bg-[var(--bhn-brand-800)] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Send comment"
                          >
                            {pendingCommentId === post.id ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}

        {isFetching && !isLoading ? <p className="sr-only" role="status">Refreshing community posts</p> : null}
      </section>
    </AppShell>
  );
}
