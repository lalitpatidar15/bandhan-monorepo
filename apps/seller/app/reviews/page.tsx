"use client";

import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiGet, apiPost } from "@/lib/api";
import { getCustomerName } from "../../lib/customer";

type ReviewType = {
  _id: string;
  name: string;
  avatar: string;
  initials?: string;
  product: string;
  rating: number;
  title: string;
  review: string;
  reply?: string;
  date: string;
  responded: boolean;
  email?: string;
  phone?: string;
  raw?: any;
  customerId?: string;
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default function ReviewsRatingsPage() {

  const [userName, setUserName] = useState("User");

  const [activeFilter, setActiveFilter] = useState("All Reviews");

  const [sortBy, setSortBy] = useState("Most Recent");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<ReviewType[]>([]);

  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [replyTo, setReplyTo] = useState<string | null>(null);

  const [replyText, setReplyText] = useState("");

  const [replying, setReplying] = useState(false);

  useEffect(() => {

    const name = localStorage.getItem("userName");

    if (name) {
      setUserName(name);
    }

  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [list, sum] = await Promise.all([
          apiGet<{ reviews: any[]; total: number }>('/reviews/seller?limit=100').catch(() => ({ reviews: [], total: 0 })),
          apiGet<any>("/reviews/summary").catch(() => null),
        ]);

        const mapped: ReviewType[] = (list.reviews || []).map((r) => {
          const raw = r;
          const name =
            raw?.customerName ||
            raw?.customer?.name ||
            raw?.user?.name ||
            raw?.user?.fullName ||
            raw?.userName ||
            raw?.name ||
            "Anonymous";
          const avatar =
            raw?.customerImage ||
            raw?.customer?.avatar ||
            raw?.user?.avatar ||
            raw?.user?.profileImage ||
            raw?.userImage ||
            "";
          const product = raw?.productName || raw?.product?.title || raw?.product || "Product";
          const rating = Number(raw?.rating) || 0;
          const title = raw?.title || raw?.heading || "";
          const reviewText = raw?.comment || raw?.review || raw?.text || "";
          const reply = raw?.sellerReply || raw?.reply || "";
          const email =
            String(raw?.user?.email || raw?.customer?.email || raw?.email || "").trim();
          const phone =
            String(raw?.user?.phone || raw?.customer?.phone || raw?.phone || raw?.mobile || "").trim();
          const customerId = raw?.userId || raw?.customerId || raw?.user?._id || raw?.customer?._id || undefined;

          return {
            _id: raw._id,
            name,
            avatar,
            initials: undefined,
            product,
            rating,
            title,
            review: reviewText,
            reply,
            date: formatDate(raw.createdAt),
            responded: Boolean(reply),
            email: email || undefined,
            phone: phone || undefined,
            // attach raw payload for possible later use
            // @ts-ignore
            raw: raw,
            // @ts-ignore
            customerId: customerId,
          } as any;
        });

        setReviews(mapped);

        if (sum) {
          setSummary({
            averageRating: sum.averageRating || 0,
            totalReviews: sum.totalReviews || mapped.length,
            distribution: sum.distribution || {
              5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
            },
          });
        }
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const submitReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      setReplying(true);
      await apiPost(`/reviews/${id}/reply`, { reply: replyText });
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, reply: replyText, responded: true } : r))
      );
      setReplyTo(null);
      setReplyText("");
      toast.success("Reply posted — customer will be notified");
    } catch (error) {
      console.error("Failed to reply", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  /* FILTER */
  const filteredReviews = useMemo(() => {

    let data = [...reviews];

    if (activeFilter === "5 Stars") {
      data = data.filter((item) => item.rating === 5);
    }

    if (activeFilter === "4 Stars") {
      data = data.filter((item) => item.rating === 4);
    }

    if (activeFilter === "Needs Response") {
      data = data.filter((item) => !item.responded);
    }

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.product.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "Highest Rating") {
      data.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "Lowest Rating") {
      data.sort((a, b) => a.rating - b.rating);
    }

    return data;

  }, [activeFilter, search, sortBy]);

  const renderStars = (count: number) => {
    return "★".repeat(count) + "☆".repeat(5 - count);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F3EF]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 w-full overflow-hidden">

        <div className="px-3 sm:px-5 lg:px-7 py-4 sm:py-5">

          {/* =========================
              TOP HEADER
          ========================= */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">

            {/* SEARCH */}
            <div className="relative w-full lg:w-[360px]">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B19C8F] text-sm">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search customer or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full
                  h-[44px]
                  pl-11
                  pr-4
                  rounded-xl
                  bg-[#F5ECE5]
                  border
                  border-[#E6D9D0]
                  outline-none
                  text-[13px]
                  text-[#6F625A]
                  placeholder:text-[#B19C8F]
                  transition-all
                  duration-200

                  focus:bg-white
                  focus:border-[#8B4A2F]
                  focus:ring-4
                  focus:ring-[#EBDCD1]
                  focus:shadow-sm
                "
              />

            </div>

            {/* RIGHT */}
            <div className="flex items-center justify-end gap-5">

              {/* NOTIFICATION */}
              <button
                className="
                  w-10
                  h-10
                  rounded-full
                  border
                  border-[#E9DDD5]
                  bg-white
                  flex
                  items-center
                  justify-center
                  hover:bg-[#F7EEE8]
                  transition
                "
              >
                🔔
              </button>

              {/* PROFILE */}
              <div className="flex items-center gap-3">

                <div className="text-right">
                  <h3 className="text-[13px] font-medium text-[#2D201B]">
                    {userName}
                  </h3>

                  <p className="text-[11px] text-[#9D8D83]">
                    Seller
                  </p>
                </div>

                <Image
                  src="/profile.png"
                  width={38}
                  height={38}
                  alt=""
                  className="rounded-full border border-[#E9DDD5]"
                />

              </div>

            </div>

          </div>

          {/* =========================
              TITLE
          ========================= */}

          <div className="mb-6">

            <h1
              className="text-[30px] sm:text-[40px] leading-none text-[#2E221D]"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 500,
              }}
            >
              Reviews & Ratings
            </h1>

            <p className="text-[13px] sm:text-[14px] text-[#9B8B80] mt-2">
              Monitor customer feedback and improve your services
            </p>

          </div>

          {/* =========================
              TOP SECTION
          ========================= */}

          <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5 mb-6">

            {/* LEFT CARD */}
            <div className="bg-[#F3E7DE] rounded-[18px] p-5 relative overflow-hidden min-h-[220px]">

              <div className="absolute right-4 top-0 text-[120px] text-[#E8D6CB] opacity-40">
                ★
              </div>

              <p className="uppercase tracking-[2px] text-[12px] text-[#A08D80] mb-5">
                Average Rating
              </p>

              <div className="flex items-end gap-2">

                <h2 className="text-[58px] leading-none font-semibold text-[#7C3F1F]">
                  {summary.averageRating || "0.0"}
                </h2>

                <span className="text-[#A48C7B] mb-2 text-[18px]">
                  / 5.0
                </span>

              </div>

              <div className="text-[#F97316] text-[20px] mt-4">
                {"★".repeat(Math.round(summary.averageRating || 0))}
                {"☆".repeat(5 - Math.round(summary.averageRating || 0))}
              </div>

            </div>

            {/* RIGHT CARD */}
            <div className="bg-white border border-[#EEE3DB] rounded-[18px] p-5 sm:p-4">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">

                <h3 className="uppercase tracking-[2px] text-[12px] text-[#8D7C70]">
                  Rating Distribution
                </h3>

                <p className="text-[12px] text-[#B09E92]">
                  Based on {summary.totalReviews} total reviews
                </p>

              </div>

              {[
                { star: "5 Stars", count: summary.distribution[5] },
                { star: "4 Stars", count: summary.distribution[4] },
                { star: "3 Stars", count: summary.distribution[3] },
                { star: "2 Stars", count: summary.distribution[2] },
                { star: "1 Star", count: summary.distribution[1] },
              ].map((item, i) => {
                const pct =
                  summary.totalReviews > 0
                    ? Math.round((item.count / summary.totalReviews) * 100)
                    : 0;
                return (

                <div
                  key={i}
                  className="flex items-center gap-3 mb-4"
                >

                  <span className="w-[65px] text-[13px] text-[#6B5D55]">
                    {item.star}
                  </span>

                  <div className="flex-1 h-[7px] bg-[#ECE2DB] rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#7C3F1F] rounded-full"
                      style={{ width: `${pct}%` }}
                    />

                  </div>

                  <span className="text-[12px] text-[#A08E83] w-[35px] text-right">
                    {pct}%
                  </span>

                </div>

                );
              })}

            </div>

          </div>

          {/* =========================
              FILTERS
          ========================= */}

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">

            {/* LEFT */}
            <div className="flex flex-wrap gap-3">

              {[
                "All Reviews",
                "5 Stars",
                "4 Stars",
                "Needs Response",
              ].map((item) => (

                <button
                  key={item}
                  onClick={() => setActiveFilter(item)}
                  className={`
                    h-[36px]
                    px-4
                    rounded-full
                    text-[13px]
                    border
                    transition-all
                    duration-200

                    ${activeFilter === item
                      ? "bg-[#7C3F1F] text-white border-[#7C3F1F]"
                      : "bg-[#F7EEE8] text-[#7B6D63] border-[#E7D8CD] hover:bg-[#EFE2D8]"
                    }
                  `}
                >
                  {item}
                </button>

              ))}

            </div>

            {/* RIGHT */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="
                h-[40px]
                px-4
                rounded-xl
                bg-white
                border
                border-[#E7D8CD]
                text-[13px]
                text-[#7B6D63]
                outline-none
                cursor-pointer
                hover:border-[#CDB6A7]
                transition-all
                w-full
                sm:w-auto
              "
            >
              <option>Most Recent</option>
              <option>Highest Rating</option>
              <option>Lowest Rating</option>
            </select>

          </div>

          {/* =========================
              REVIEW LIST
          ========================= */}

          <div className="space-y-5">

            {loading && (
              <p className="text-center text-[#A08F84] text-sm py-10">
                Loading reviews...
              </p>
            )}

            {!loading && filteredReviews.length === 0 && (
              <p className="text-center text-[#A08F84] text-sm py-10">
                No reviews found.
              </p>
            )}

            {filteredReviews.map((item) => (

              <div
                key={item._id}
                className="
        bg-white
        border
        border-[#EEE4DC]
        rounded-[16px]
        px-4
        py-5
        sm:px-5
        hover:shadow-sm
        transition-all
      "
              >

                <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">

                  {/* LEFT PROFILE */}
                  <div className="flex lg:flex-col items-start lg:items-center gap-3 lg:w-[110px] shrink-0">

                    <div className="relative">

                      {item.avatar ? (

                        <img
                          src={item.avatar}
                          alt=""
                          className="w-[54px] h-[54px] rounded-full object-cover"
                        />

                      ) : (

                        <div className="w-[54px] h-[54px] rounded-full bg-[#E7DDD7] flex items-center justify-center text-[#7A6A60] text-[16px] font-medium">
                          {item.initials || initialsOf(item.name)}
                        </div>

                      )}

                      {/* ONLINE DOT */}
                      <span className="absolute bottom-0 right-0 w-[12px] h-[12px] bg-[#22C55E] border-2 border-white rounded-full"></span>

                    </div>

                    <div className="lg:text-center">

                      <h4 className="text-[15px] leading-[18px] font-medium text-[#2E221D]">
                        {item.name}
                      </h4>

                      {item.email || item.phone ? (
                        <p className="text-[11px] text-[#9D8D83] mt-1">
                          {item.email ? item.email : item.phone}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#9D8D83] mt-1">
                          {getCustomerName(item)}
                        </p>
                      )}

                      <p className="text-[10px] text-[#B6A59A] mt-2 flex items-center gap-1 lg:justify-center">
                        🗓 {item.date}
                      </p>

                    </div>

                  </div>

                  {/* RIGHT CONTENT */}
                  <div className="flex-1">

                    {/* TOP */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      <div>

                        {/* STARS */}
                        <div className="flex items-center gap-[2px] text-[#F97316] text-[14px]">
                          {renderStars(item.rating)}
                        </div>

                        {/* TITLE */}
                        <h3 className="text-[24px] leading-[32px] text-[#2E221D] mt-2 font-medium">
                          {item.title}
                        </h3>

                      </div>

                      {/* PRODUCT TAG */}
                      <span className="
              h-fit
              px-3
              py-1
              rounded-full
              bg-[#F3E6DC]
              text-[#8B5E3C]
              text-[10px]
              whitespace-nowrap
            ">
                        {item.product}
                      </span>

                    </div>

                    {/* REVIEW TEXT */}
                    <p className="
            text-[14px]
            sm:text-[15px]
            leading-[28px]
            text-[#7D6E64]
            mt-3
            max-w-[850px]
          ">
                      {item.review}
                    </p>

                    {/* RESPONSE */}
                    {item.responded ? (

                      <>
                        <div className="
                mt-5
                bg-[#FAF5F0]
                border
                border-[#EFE5DD]
                rounded-[12px]
                px-4
                py-4
              ">

                          <p className="
                  uppercase
                  tracking-[1px]
                  text-[10px]
                  text-[#B39F92]
                  mb-2
                  flex
                  items-center
                  gap-2
                ">
                            ↪ You Responded
                          </p>

                          <p className="
                  text-[14px]
                  leading-[26px]
                  text-[#7B6B61]
                ">
                            “{item.reply}”
                          </p>

                        </div>

                        <div className="flex items-center gap-5 mt-3">

                          <button
                            onClick={() => {
                              setReplyTo(item._id);
                              setReplyText(item.reply || "");
                            }}
                            className="
                  text-[12px]
                  font-semibold
                  text-[#8B4A2F]
                  hover:underline
                "
                          >
                            Edit Response
                          </button>

                        </div>
                      </>

                    ) : (

                      <div className="flex items-center gap-3 mt-5">

                        <button
                          onClick={() => {
                            setReplyTo(item._id);
                            setReplyText("");
                          }}
                          className="
                  h-[38px]
                  px-5
                  rounded-[10px]
                  bg-[#8B4A2F]
                  hover:bg-[#6F3A23]
                  text-white
                  text-[12px]
                  font-medium
                  transition-all
                  flex
                  items-center
                  gap-2
                "
                        >
                          💬 Reply to Review
                        </button>

                        <button className="text-[#A59286] text-xl">
                          ⋯
                        </button>

                      </div>

                    )}

                    {replyTo === item._id && (
                      <div className="mt-4 bg-[#FBF7F3] border border-[#EDE2D8] rounded-[12px] p-4">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a response..."
                          className="w-full h-[80px] bg-white border border-[#E7D8CD] rounded-lg p-3 text-[13px] outline-none resize-none"
                        />
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => submitReply(item._id)}
                            disabled={replying}
                            className="h-[36px] px-5 rounded-[10px] bg-[#8B4A2F] hover:bg-[#6F3A23] text-white text-[12px] font-medium disabled:opacity-60"
                          >
                            {replying ? "Posting..." : "Post Reply"}
                          </button>
                          <button
                            onClick={() => {
                              setReplyTo(null);
                              setReplyText("");
                            }}
                            className="text-[12px] text-[#B19D90] hover:text-[#7B6D63]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* =========================
              PAGINATION
          ========================= */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">

              <p className="text-[12px] text-[#A08F84] text-center sm:text-left">
                Showing {filteredReviews.length} of {summary.totalReviews} reviews
              </p>

            <div className="flex items-center justify-center gap-2">

              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="
                  w-8
                  h-8
                  rounded-full
                  border
                  border-[#E6D8CD]
                  text-[#8B7A70]
                  hover:bg-[#F3E7DE]
                "
              >
                ‹
              </button>

              {[1, 2, 3].map((page) => (

                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`
                    w-8
                    h-8
                    rounded-full
                    text-[12px]
                    transition-all

                    ${currentPage === page
                      ? "bg-[#7C3F1F] text-white"
                      : "text-[#8B7A70] hover:bg-[#F3E7DE]"
                    }
                  `}
                >
                  {page}
                </button>

              ))}

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="
                  w-8
                  h-8
                  rounded-full
                  border
                  border-[#E6D8CD]
                  text-[#8B7A70]
                  hover:bg-[#F3E7DE]
                "
              >
                ›
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}