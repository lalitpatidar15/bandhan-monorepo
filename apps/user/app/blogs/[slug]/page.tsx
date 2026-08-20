"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Copy, MessageCircle, Share2, Calendar } from "lucide-react";
import { Badge, Card, Skeleton } from "@bandhan/ui";
import SiteHeader from "@/components/ui/SiteHeader";
import Footer from "@/components/ui/Footer";
import { useGetBySlugQuery, useGetBlogsQuery, type Blog } from "@/store/api/blogApi";
import toast from "react-hot-toast";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Skeleton height="12rem" width="100%" />
      <div className="space-y-3">
        <Skeleton height="1.5rem" width="30%" />
        <Skeleton height="2.5rem" width="80%" />
        <div className="flex gap-2">
          <Skeleton height="1.25rem" width="5rem" circle />
          <Skeleton height="1.25rem" width="8rem" />
        </div>
      </div>
      <div className="space-y-3 pt-4">
        <Skeleton height="1rem" />
        <Skeleton height="1rem" />
        <Skeleton height="1rem" width="90%" />
        <Skeleton height="1rem" />
        <Skeleton height="1rem" width="80%" />
      </div>
      <div className="pt-8 space-y-4">
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="1rem" />
        <Skeleton height="1rem" width="70%" />
      </div>
    </div>
  );
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [copied, setCopied] = useState(false);

  const {
    data: blog,
    isLoading,
    isError,
  } = useGetBySlugQuery(slug, { skip: !slug });

  const { data: relatedResponse } = useGetBlogsQuery(
    { category: blog?.category, limit: 10 },
    { skip: !blog?.category }
  );

  const relatedPosts: Blog[] = useMemo(() => {
    const all = relatedResponse?.data || [];
    return all.filter((b) => b.slug !== slug);
  }, [relatedResponse?.data, slug]);

  const paragraphs = useMemo(() => {
    if (!blog?.content) return [];
    return blog.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [blog]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/blogs/${blog?.slug}`
      : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Check out this blog: ${blog?.title}\n\n${shareUrl}`
    );
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt || "",
          url: shareUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (isError || !blog) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bhn-bg)]">
        <header className="sticky top-0 z-40 border-b border-[var(--bhn-border)]">
          <SiteHeader />
        </header>
        <main className="mx-auto flex-1 max-w-3xl px-4 py-20">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--bhn-text)]">
              Blog post not found
            </h2>
            <p className="mt-2 text-sm text-[var(--bhn-text-muted)]">
              The post you are looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </main>
        <Footer variant="simple" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bhn-bg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--bhn-border)] bg-[var(--bhn-bg)]">
        <SiteHeader />
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="mb-8 h-64 w-full rounded-2xl object-cover sm:h-80"
          />
        ) : null}

        {/* Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge tone="brand" className="uppercase">
            {blog.category}
          </Badge>
          <Badge tone="neutral">
            <Calendar size={12} className="mr-1" />
            {formatDate(blog.createdAt)}
          </Badge>
          {blog.featured ? <Badge tone="info">Featured</Badge> : null}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-bold text-[var(--bhn-text)] leading-tight sm:text-4xl">
          {blog.title}
        </h1>

        {/* Author / Date / Meta */}
        <div className="mt-4 flex items-center gap-3 pb-4 border-b border-[var(--bhn-border)]">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--bhn-text)]">
              {blog.authorName || "Bandhan Editorial"}
            </p>
            <p className="text-xs text-[var(--bhn-text-soft)]">
              {formatDate(blog.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNativeShare}
              className="bhn-btn bhn-btn-icon bhn-btn-secondary"
              aria-label="Share"
              title="Share"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleCopyLink}
              className="bhn-btn bhn-btn-icon bhn-btn-secondary"
              aria-label={copied ? "Copied!" : "Copy link"}
              title={copied ? "Copied!" : "Copy link"}
            >
              <Copy size={16} />
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="bhn-btn bhn-btn-icon bhn-btn-secondary"
              aria-label="Share on WhatsApp"
              title="Share on WhatsApp"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <article className="mt-6 prose prose-sm max-w-none text-[var(--bhn-text-muted)] prose-headings:text-[var(--bhn-text)] prose-a:text-[var(--bhn-brand-700)]">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, idx) => (
              <p key={idx} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="mb-4 leading-relaxed">{blog.content}</p>
          )}
        </article>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--bhn-border)] pt-6">
            {blog.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* Related Posts */}
        {relatedPosts.length > 0 ? (
          <div className="mt-12 border-t border-[var(--bhn-border)] pt-8">
            <h2 className="font-display text-xl font-bold text-[var(--bhn-text)] mb-4">
              Related posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.slice(0, 4).map((related) => (
                <Link key={related._id} href={`/blogs/${related.slug}`}>
                  <Card hover className="bhn-card-hover overflow-hidden h-full flex flex-col p-4">
                    {related.coverImage ? (
                      <img
                        src={related.coverImage}
                        alt={related.title}
                        className="mb-3 h-24 w-full rounded-lg object-cover"
                      />
                    ) : null}
                    <Badge tone="neutral" className="mb-2">
                      {related.category}
                    </Badge>
                    <h3 className="font-serif text-sm font-semibold text-[var(--bhn-text)] line-clamp-2 leading-tight">
                      {related.title}
                    </h3>
                    {related.excerpt ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--bhn-text-soft)]">
                        {related.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-auto pt-2 text-xs text-[var(--bhn-text-soft)]">
                      {formatDate(related.createdAt)}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      <Footer variant="simple" />
    </div>
  );
}
