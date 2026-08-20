"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Video,
  FileText,
  MoreHorizontal,
  Send,
  Menu,
  X,
  User,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useRequireAuth } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useCommentPostMutation,
} from "@/store/api/feedApi";

/* ================= TYPES ================= */
interface CommentType {
  id: string;
  user: string;
  text: string;
  createdAt?: string;
}

interface PostType {
  id: string;
  user: string;
  role: string;
  time: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: CommentType[];
  liked: boolean;
  avatar?: string;
}

const emptyAvatar = "/Border.png";

const relativeTime = (value: string) => {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "JUST NOW";
  if (minutes < 60) return `${minutes} MIN AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HRS AGO`;
  return `${Math.floor(hours / 24)} DAYS AGO`;
};

const normalizePost = (post: any): PostType => ({
  id: String(post.id || post._id),
  user: post.user || post.userId?.fullName || "Bandhan member",
  role: String(post.role || post.userId?.role || "member").replace(/([A-Z])/g, " $1").trim().toUpperCase(),
  time: relativeTime(post.time || post.createdAt),
  content: post.content || "",
  image: post.image || "",
  video: post.video || "",
  likes: Number(post.likes || 0),
  comments: Array.isArray(post.comments) ? post.comments : [],
  liked: Boolean(post.liked),
  avatar: post.avatar || post.userId?.profilePic || post.userId?.profileImage || "",
});

export default function FeedPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const { gate } = useRequireAuth();
  const [joined, setJoined] = useState(false);

  // Post Creation States
  const [postText, setPostText] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const { data: apiPosts, isLoading: apiLoading } = useGetPostsQuery(undefined, {
    skip: false,
  });
  const [createPostMutation, { isLoading: isCreating }] = useCreatePostMutation();
  const [likePostMutation] = useLikePostMutation();

  const [posts, setPosts] = useState<PostType[]>([]);

  // Sync API data when available
  useEffect(() => {
    if (Array.isArray(apiPosts)) setPosts(apiPosts.map(normalizePost));
  }, [apiPosts]);

  // Create Post Handler
  const handleCreatePost = () => {
    gate(async () => {
      if (!postText.trim() && !imagePreview && !videoPreview) return;

      const newPost: PostType = {
        id: Date.now().toString(),
        user: "You",
        role: "MEMBER",
        time: "JUST NOW",
        content: postText,
        image: imagePreview,
        video: videoPreview,
        likes: 0,
        comments: [],
        liked: false,
        avatar: "",
      };

      // Optimistic Local State Update
      setPosts((prev) => [newPost, ...prev]);

      // Dynamic Backend API Trigger
      try {
        await createPostMutation({
          content: postText,
          image: imagePreview || undefined,
          video: videoPreview || undefined,
        }).unwrap();
      } catch (err) {
        setPosts((prev) => prev.filter((post) => post.id !== newPost.id));
        console.warn("Could not save post.", err);
      }

      // Clear Form Input
      setPostText("");
      setImagePreview("");
      setVideoPreview("");
      setSelectedImageFile(null);
      setSelectedVideoFile(null);
    });
  };

  const toggleJoin = () => {
    gate(() => setJoined((j) => !j));
  };

  const handleLike = async (id: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );

    try {
      await likePostMutation({ postId: id }).unwrap();
    } catch (err) {
      console.warn("Like API failed", err);
    }
  };

  const handleShare = async (post: PostType) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.user,
          text: post.content,
        });
      } catch (e) {
        console.log("Share cancelled", e);
      }
    } else {
      navigator.clipboard.writeText(post.content);
      alert("Post copied to clipboard!");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setVideoPreview(""); // Reset video if image chosen
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setImagePreview(""); // Reset image if video chosen
    }
  };

  return (
    <div className="bg-[#F5F1EB] min-h-screen flex flex-col font-sans">
      {/* HEADER */}
      <Header variant="main1" className="sticky top-0 z-50" />

      <div className="max-w-[1400px] mx-auto w-full px-3 sm:px-4 lg:px-6 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MOBILE HEADER BAR */}
          <div className="lg:hidden flex items-center justify-between bg-white rounded-2xl p-4 border border-[#E5D8CC] shadow-xs">
            <div>
              <h2 className="font-bold text-lg text-[#1C1A16]">Community Feed</h2>
              <p className="text-xs text-[#8A7E73]">
                Latest event inspirations
              </p>
            </div>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="w-10 h-10 rounded-full bg-[#EFE5DB] text-[#8C4B2D] flex items-center justify-center transition"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* LEFT SIDEBAR */}
          <aside
            className={`${
              mobileMenu ? "block" : "hidden"
            } lg:block lg:col-span-3 xl:col-span-3`}
          >
            <div className="bg-[#F8F3ED] border border-[#E5D8CC] rounded-3xl p-5 sticky top-24 shadow-xs">

              {/* USER PROFILE BRIEF */}
              <div className="flex items-center gap-3">
                <img
                  src={emptyAvatar}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border border-[#DCCFC4]"
                />

                <div>
                  <h2 className="font-bold text-sm text-[#1C1A16]">
                    Your profile
                  </h2>
                  <p className="text-[11px] font-semibold text-[#8C4B2D] tracking-wider">
                    BANDHAN MEMBER
                  </p>
                </div>
              </div>

              {/* JOIN / ACTION BUTTON */}
              <button
                onClick={toggleJoin}
                className={`mt-5 w-full rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                  joined 
                    ? "bg-[#EFE5DB] text-[#8C4B2D] border border-[#DCCFC4]" 
                    : "bg-[#8C4B2D] text-white hover:bg-[#723C22]"
                }`}
              >
                {joined ? "✓ Joined Community" : "Join Community"}
              </button>

              {/* NAVIGATION MENU */}
              <div className="mt-6 space-y-1.5">
                {[
                  "HOME FEED",
                  "TRENDING",
                  "MY COMMUNITIES",
                  "INVITES",
                  "SETTINGS",
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-xl cursor-pointer text-xs font-semibold tracking-wider transition ${
                      item === "HOME FEED"
                        ? "bg-[#EFE2D5] text-[#8C4B2D]"
                        : "hover:bg-[#EFE2D5]/50 text-[#6B625A]"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* FOOTER LINKS */}
              <div className="mt-8 pt-5 border-t border-[#E5D8CC] text-[11px] text-[#8E8379] space-y-3">
                <div className="flex gap-3 flex-wrap font-medium">
                  <span className="hover:underline cursor-pointer">ABOUT</span>
                  <span className="hover:underline cursor-pointer">HELP</span>
                  <span className="hover:underline cursor-pointer">PRIVACY</span>
                  <span className="hover:underline cursor-pointer">TERMS</span>
                </div>
                <p>© 2026 BANDHAN EVENTS</p>
              </div>
            </div>
          </aside>

          {/* MAIN FEED CONTENT AREA */}
          <main className="lg:col-span-6 xl:col-span-6 space-y-5">

            {/* CREATE POST CARD */}
            <div className="bg-white border border-[#E5D8CC] rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex gap-3">
                <img
                  src={emptyAvatar}
                  alt="Current User"
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />

                <div className="flex-1">
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Share your latest event inspiration..."
                    className="w-full bg-[#F7F1EA] rounded-2xl p-4 min-h-[110px] outline-none resize-none text-sm border border-[#EFE2D5] focus:border-[#8C4B2D] transition placeholder:text-[#A3988E]"
                  />

                  {/* MEDIA PREVIEWS */}
                  {imagePreview && (
                    <div className="relative mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded-2xl w-full max-h-[350px] object-cover"
                      />
                      <button
                        onClick={() => setImagePreview("")}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {videoPreview && (
                    <div className="relative mt-3">
                      <video controls className="rounded-2xl w-full max-h-[350px]">
                        <source src={videoPreview} />
                      </video>
                      <button
                        onClick={() => setVideoPreview("")}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* INPUT CONTROLS */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-wider text-[#6B625A]">
                      <button
                        type="button"
                        onClick={() => imageRef.current?.click()}
                        className="flex items-center gap-1.5 hover:text-[#8C4B2D] transition"
                      >
                        <ImageIcon size={16} />
                        IMAGE
                      </button>

                      <button
                        type="button"
                        onClick={() => videoRef.current?.click()}
                        className="flex items-center gap-1.5 hover:text-[#8C4B2D] transition"
                      >
                        <Video size={16} />
                        VIDEO
                      </button>

                      <button 
                        type="button"
                        className="flex items-center gap-1.5 hover:text-[#8C4B2D] transition"
                      >
                        <FileText size={16} />
                        TEXT
                      </button>

                      {/* Hidden File Inputs */}
                      <input
                        ref={imageRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <input
                        ref={videoRef}
                        type="file"
                        hidden
                        accept="video/*"
                        onChange={handleVideoChange}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCreatePost}
                      disabled={isCreating}
                      className="bg-[#8C4B2D] hover:bg-[#723C22] text-white px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isCreating && <Loader2 size={14} className="animate-spin" />}
                      POST
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FEED LOADING / STATUS BAR */}
            {apiLoading && (
              <div className="bg-white/60 border border-dashed border-[#E5D8CC] rounded-2xl p-4 text-center text-xs font-semibold text-[#8C4B2D] flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Fetching live posts...
              </div>
            )}

            {/* POSTS LIST */}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onShare={() => handleShare(post)}
                setPosts={setPosts}
              />
            ))}
            {!apiLoading && !posts.length && <div className="bg-white border border-[#E5D8CC] rounded-3xl p-8 text-center text-sm text-[#6B625A]">No community posts yet. Be the first to share an idea.</div>}
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 space-y-5">

            {/* TRENDING SECTION */}
            <div className="bg-[#F4E9DE] border border-[#E5D8CC] rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-[#8C4B2D]" />
                <h2 className="font-bold text-sm text-[#1C1A16]">
                  Trending in Events
                </h2>
              </div>

              <div className="space-y-4">
                <TrendItem
                  title="#DesertBohoEvents"
                  subtitle="2.4k planners discussing"
                />
                <TrendItem
                  title="#MicroGalaPlanning"
                  subtitle="1.8k posts this week"
                />
                <TrendItem
                  title="#WarmMinimalism"
                  subtitle="5.1k enthusiasts"
                />
              </div>
            </div>

            {/* SUGGESTIONS SECTION */}
            <div className="bg-white border border-[#E5D8CC] rounded-3xl p-5 shadow-xs">
              <h2 className="font-bold text-sm text-[#1C1A16] mb-4">
                Suggested Circles
              </h2>

              <div className="space-y-4">
                <CircleItem name="Luxury Floral Design" members="12k Members" />
                <CircleItem name="Sustainable Catering" members="8k Members" />
                <CircleItem name="Editorial Photography" members="15k Members" />
              </div>

              <button className="w-full mt-5 border border-[#DCCFC4] rounded-xl py-2.5 text-xs font-semibold text-[#8C4B2D] hover:bg-[#FAF6F1] transition">
                DISCOVER MORE
              </button>
            </div>
          </aside>

        </div>
      </div>

      <Footer variant="explore" />
    </div>
  );
}

/* ================= POST CARD COMPONENT ================= */

interface PostCardProps {
  post: PostType;
  onLike: () => void;
  onShare: () => void;
  setPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
}

function PostCard({ post, onLike, onShare, setPosts }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentPostMutation] = useCommentPostMutation();

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const newComment: CommentType = {
      id: Date.now().toString(),
      user: "You",
      text: commentText,
    };

    // Local Optimistic Update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    // API Trigger
    try {
      await commentPostMutation({ postId: String(post.id), text: commentText }).unwrap();
    } catch (e) {
      console.warn("Comment API skipped/failed.", e);
    }

    setCommentText("");
  };

  return (
    <div className="bg-white border border-[#E5D8CC] rounded-3xl overflow-hidden shadow-xs">
      {/* HEADER */}
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <img
              src={post.avatar || emptyAvatar}
              alt={post.user}
              className="w-11 h-11 rounded-full object-cover"
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-[#1C1A16]">
                  {post.user}
                </h3>
                <span className="text-[10px] font-semibold bg-[#F3E6DA] text-[#8C4B2D] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {post.role}
                </span>
              </div>

              <p className="text-[11px] font-medium text-[#8A8178] mt-0.5">
                {post.time}
              </p>
            </div>
          </div>

          <button className="text-[#8A8178] hover:text-[#1C1A16]">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <p className="mt-4 text-sm leading-relaxed text-[#2B2B2B]">
          {post.content}
        </p>
      </div>

      {/* MEDIA ATTACHMENTS */}
      {post.image && (
        <img
          src={post.image}
          alt="Post content"
          className="w-full max-h-[480px] object-cover"
        />
      )}

      {post.video && (
        <video controls className="w-full max-h-[480px]">
          <source src={post.video} />
        </video>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex justify-between items-center px-4 sm:px-5 py-3 border-t border-[#F2ECE6] text-xs font-semibold text-[#6B625A]">
        <div className="flex items-center gap-5">
          {/* LIKE BUTTON */}
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 transition ${
              post.liked ? "text-rose-600" : "hover:text-[#8C4B2D]"
            }`}
          >
            <Heart
              size={18}
              fill={post.liked ? "currentColor" : "none"}
            />
            <span>{post.likes}</span>
          </button>

          {/* COMMENT TOGGLE */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 hover:text-[#8C4B2D] transition"
          >
            <MessageCircle size={18} />
            <span>{post.comments.length}</span>
          </button>
        </div>

        {/* SHARE */}
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 hover:text-[#8C4B2D] transition tracking-wider"
        >
          <Share2 size={16} />
          SHARE
        </button>
      </div>

      {/* COMMENTS DRAWER */}
      {showComments && (
        <div className="border-t border-[#F2ECE6] bg-[#FAF6F1] p-4 space-y-4">
          {/* COMMENT INPUT */}
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-[#E5D8CC] rounded-xl px-4 py-2.5 outline-none text-xs bg-white focus:border-[#8C4B2D]"
            />

            <button
              onClick={handleAddComment}
              className="bg-[#8C4B2D] hover:bg-[#723C22] text-white w-10 h-10 rounded-xl flex items-center justify-center transition flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>

          {/* COMMENTS LIST */}
          <div className="space-y-2.5">
            {post.comments.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-[#EFE2D5] rounded-2xl p-3 shadow-2xs"
              >
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-[#EFE2D5] flex items-center justify-center flex-shrink-0 text-[#8C4B2D]">
                    <User size={14} />
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-[#1C1A16]">
                      {c.user}
                    </h4>
                    <p className="text-xs text-[#554A42] mt-0.5">
                      {c.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= TREND ITEM ================= */
interface TrendItemProps {
  title: string;
  subtitle: string;
}

function TrendItem({ title, subtitle }: TrendItemProps) {
  return (
    <div className="cursor-pointer group">
      <h3 className="font-bold text-xs text-[#1C1A16] group-hover:text-[#8C4B2D] transition">
        {title}
      </h3>
      <p className="text-[11px] text-[#7E746A] mt-0.5">
        {subtitle}
      </p>
    </div>
  );
}

/* ================= CIRCLE ITEM ================= */
interface CircleItemProps {
  name: string;
  members: string;
}

function CircleItem({ name, members }: CircleItemProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#F5E9DE] flex items-center justify-center text-[#8C4B2D] flex-shrink-0">
          <User size={16} />
        </div>

        <div>
          <h3 className="font-bold text-xs text-[#1C1A16] line-clamp-1">
            {name}
          </h3>
          <p className="text-[10px] text-[#7E746A]">
            {members}
          </p>
        </div>
      </div>

      <button className="border border-[#DCCFC4] px-3 py-1 rounded-full text-[11px] font-semibold text-[#8C4B2D] hover:bg-[#F5F1EB] transition">
        JOIN
      </button>
    </div>
  );
}
