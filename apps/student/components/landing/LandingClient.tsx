"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Menu, X, ChevronLeft, ChevronRight, ArrowRight, Star,
  BookOpen, Video, Award, Users, GraduationCap, Sparkles, CheckCircle,
  Calendar, Heart, Camera, Paintbrush, Utensils, Shirt, Briefcase,
  Lightbulb, Compass, ShieldCheck, CreditCard, Layout, FileText, Bell,
  Quote, ChevronDown, ChevronUp, Play, Clock, BarChart, Globe,
  Check, Share2, Download, BadgeCheck, UserCheck, FileCheck,
  Eye, Percent, MessageSquare, DollarSign, TrendingUp, User, Smartphone,
} from "lucide-react";
import {
  LEARNING_PATHS, STUDENT_FEATURES,
  HOW_LEARNING_WORKS, FAQS,
  INSTRUCTOR_VERIFICATION_STEPS, COURSE_CREATION_STEPS, COURSE_FORMATS,
  WHY_CHOOSE_US,
} from "@/lib/landingData";

function getCatIcon(name: string): React.ElementType {
  const iconMap: Record<string, React.ElementType> = {
    "Calendar": Calendar, "Heart": Heart, "Camera": Camera, "Video": Video,
    "Sparkles": Sparkles, "Paintbrush": Paintbrush, "Utensils": Utensils,
    "Shirt": Shirt, "Briefcase": Briefcase, "Lightbulb": Lightbulb,
    "Tv": TV, "File": FileIcon, "Download": Download, "PenTool": PenTool,
    "ClipboardList": ClipboardList, "BookOpen": BookOpen,
  };
  return iconMap[name] || BookOpen;
}

function getCatColor(color: string): string {
  const colors: Record<string, string> = {
    purple: "bg-purple-100 text-purple-700", rose: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700", indigo: "bg-indigo-100 text-indigo-700",
    amber: "bg-amber-100 text-amber-700", pink: "bg-pink-100 text-pink-700",
    emerald: "bg-emerald-100 text-emerald-700", teal: "bg-teal-100 text-teal-700",
    violet: "bg-violet-100 text-violet-700", sky: "bg-sky-100 text-sky-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return colors[color] || "bg-orange-100 text-orange-700";
}

export default function LandingClient() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [catalogueCourses, setCatalogueCourses] = useState<any[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://bandhan-backend-gykw.onrender.com/api";
    fetch(`${apiBase}/student/courses`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Course catalogue unavailable")))
      .then((response) => {
        const rawCourses = Array.isArray(response) ? response : response?.data?.courses || response?.courses || response?.data || [];
        setCatalogueCourses(Array.isArray(rawCourses) ? rawCourses : []);
      })
      .catch(() => setCatalogueCourses([]))
      .finally(() => setCatalogueLoading(false));
  }, []);

  const courses = catalogueCourses.map((course) => ({
    id: String(course._id || course.courseId),
    title: course.title || "Untitled course",
    category: course.category || "Other",
    image: course.thumbnail || course.image || "/Border.png",
    instructorName: course.instructor?.fullName || course.instructorName || "Bandhan instructor",
    rating: Number(course.rating || course.averageRating || 0),
    reviewsCount: Number(course.totalReviews || course.reviews || 0),
    duration: course.duration || course.totalDuration || course.estimatedDuration || "",
    price: Number(course.price ?? course.pricing?.finalPrice ?? 0),
    oldPrice: Number(course.oldPrice || course.pricing?.basePrice || 0),
    learnersCount: Number(course.totalStudents || course.enrolledStudents || 0),
    isFree: Number(course.price ?? course.pricing?.finalPrice ?? 0) === 0,
    isFeatured: Boolean(course.isFeatured),
  }));
  const categories = Array.from(new Set(courses.map((course) => course.category))).map((title, index) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    coursesCount: courses.filter((course) => course.category === title).length,
    icon: ["Calendar", "Camera", "Sparkles", "Utensils", "Briefcase", "BookOpen"][index % 6],
    color: ["purple", "rose", "blue", "amber", "teal", "violet"][index % 6],
  }));
  const statistics = [
    { value: String(courses.length), label: "Published Courses", desc: "Live learning catalogue" },
    { value: String(new Set(courses.map((course) => course.instructorName)).size), label: "Active Instructors", desc: "Course creators" },
    { value: String(courses.reduce((total, course) => total + course.learnersCount, 0)), label: "Enrolled Students", desc: "Across published courses" },
  ];

  const heroSlides = [
    { title: "Master the Art of Events & Celebration", subtitle: "Learn from top wedding planners, photographers, and event professionals. Build a thriving career in the celebration economy.", cta: "Start Learning Today", link: "/student/auth", cta2: "Become an Instructor", link2: "/instructor/login", bg: "from-[#924C2B] dark:from-[#b86a3a] to-[#C97B5A] dark:to-[#d4956f]" },
    { title: "Your Career in Event Management Starts Here", subtitle: "Industry-validated courses with practical training, real case studies, and expert mentorship from leading professionals.", cta: "Browse Courses", link: "/student/courses", cta2: "Join Free", link2: "/student/auth", bg: "from-[#1A365D] to-[#2B6CB0]" },
    { title: "Teach & Inspire the Next Generation", subtitle: "Share your expertise with thousands of aspiring event professionals. Build your community and earn revenue doing what you love.", cta: "Teach on Bandhan", link: "/instructor/login", cta2: "Explore Courses", link2: "/student/courses", bg: "from-[#22543D] to-[#38A169]" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx((c) => (c + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const slide = heroSlides[slideIdx];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── 1. HEADER ─── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/Group1.png" alt="Bandhan Academy" width={433} height={96} className="h-8 w-auto rounded-md bg-[#2A1C16] px-2 py-1" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/student/courses" className="text-sm text-gray-700 hover:text-[#924C2B] dark:hover:text-[#b86a3a] font-medium transition">Courses</Link>
            <Link href="/student/auth" className="text-sm text-gray-700 hover:text-[#924C2B] dark:hover:text-[#b86a3a] font-medium transition">For Students</Link>
            <Link href="/instructor/login" className="text-sm text-gray-700 hover:text-[#924C2B] dark:hover:text-[#b86a3a] font-medium transition">For Instructors</Link>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/student/auth" className="text-sm font-medium text-gray-700 hover:text-[#924C2B] dark:hover:text-[#b86a3a] px-3 py-1.5 transition">Log in</Link>
            <Link href="/student/auth" className="text-sm font-medium bg-[#924C2B] dark:bg-[#b86a3a] text-white px-4 py-1.5 rounded-lg hover:bg-[#7A3E24] dark:hover:bg-[#a05a30] transition">Sign Up Free</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
            <Link href="/student/courses" className="block text-sm text-gray-700 hover:text-[#924C2B] dark:hover:text-[#b86a3a]" onClick={() => setMobileMenuOpen(false)}>Courses</Link>
            <Link href="/student/auth" className="block text-sm text-gray-700 hover:text-[#924C2B] dark:hover:text-[#b86a3a]" onClick={() => setMobileMenuOpen(false)}>For Students</Link>
            <Link href="/instructor/login" className="block text-sm text-gray-700 hover:text-[#924C2B] dark:hover:text-[#b86a3a]" onClick={() => setMobileMenuOpen(false)}>For Instructors</Link>
            <hr />
            <Link href="/student/auth" className="block text-sm font-medium text-[#924C2B] dark:text-[#b86a3a]" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Link href="/student/auth" className="block text-sm font-medium bg-[#924C2B] dark:bg-[#b86a3a] text-white px-4 py-2 rounded-lg text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up Free</Link>
          </div>
        )}
      </header>

      {/* ─── 2. HERO ─── */}
      <section className="relative overflow-hidden">
        <div className={`bg-gradient-to-r ${slide.bg} relative min-h-[500px] sm:min-h-[560px] flex items-center`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920')] opacity-10 bg-cover bg-center" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-2xl">
              <p className="text-white/70 text-xs sm:text-sm uppercase tracking-[0.25em] mb-3">Bandhan Academy — Learn, Grow, Celebrate</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">{slide.title}</h1>
              <p className="text-white/80 text-sm sm:text-base mt-4 max-w-lg leading-relaxed">{slide.subtitle}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href={slide.link} className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-100 transition shadow-sm">
                  {slide.cta} <ArrowRight size={16} />
                </Link>
                <Link href={slide.link2} className="inline-flex items-center gap-2 border border-white/30 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-white/10 transition">
                  {slide.cta2}
                </Link>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-300" />
                  ))}
                </div>
                <p className="text-white/80 text-xs">Trusted by <span className="font-semibold text-white">28,000+</span> students</p>
              </div>
            </div>
          </div>
          <button onClick={() => setSlideIdx((s) => (s - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-1.5 text-white transition"><ChevronLeft size={20} /></button>
          <button onClick={() => setSlideIdx((s) => (s + 1) % heroSlides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-1.5 text-white transition"><ChevronRight size={20} /></button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setSlideIdx(i)} className={`w-2.5 h-2.5 rounded-full transition ${i === slideIdx ? "bg-white scale-110" : "bg-white/40"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEARCH BAR ─── */}
      <section className="bg-[#F7FAFC] dark:bg-[#171717] border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search courses — e.g. Wedding Planning, Photography..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#924C2B]/30 dark:focus:ring-[#b86a3a]/30 focus:border-[#924C2B] dark:focus:border-[#b86a3a] transition" />
          </div>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            <span className="text-xs text-gray-500">Popular:</span>
            {["Wedding Planning", "Photography", "Event Management", "Decoration", "Catering"].map((kw) => (
              <button key={kw} onClick={() => setSearchQuery(kw)} className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:border-[#924C2B] dark:hover:border-[#c9a882] hover:text-[#924C2B] dark:hover:text-[#b86a3a] transition">{kw}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <section className="bg-[#924C2B] dark:bg-[#b86a3a] py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {statistics.map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
              <p className="text-white/80 font-medium text-xs mt-1">{s.label}</p>
              <p className="text-white/50 text-[10px] hidden sm:block">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. CATEGORIES ─── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Explore by Category</h2>
              <p className="text-gray-500 text-sm mt-1">Discover courses tailored to your passion</p>
            </div>
            <Link href="/student/courses" className="text-sm text-[#924C2B] dark:text-[#b86a3a] font-medium flex items-center gap-1 hover:underline">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const Icon = getCatIcon(cat.icon);
              return (
                <Link key={cat.id} href="/student/courses" className="group flex flex-col items-center text-center rounded-xl border border-gray-200 p-4 hover:border-[#924C2B] dark:hover:border-[#c9a882] hover:shadow-sm transition-all">
                  <div className={`h-10 w-10 rounded-lg ${getCatColor(cat.color)} flex items-center justify-center mb-2`}><Icon size={18} /></div>
                  <h3 className="font-semibold text-xs text-gray-900 group-hover:text-[#924C2B] dark:hover:text-[#b86a3a] transition">{cat.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{cat.coursesCount} courses</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. FEATURED COURSES ─── */}
      <section className="py-14 px-4 bg-[#F7FAFC] dark:bg-[#171717]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Featured Courses</h2>
              <p className="text-gray-500 text-sm mt-1">Top-rated programs from industry experts</p>
            </div>
            <Link href="/student/courses" className="text-sm text-[#924C2B] dark:text-[#b86a3a] font-medium flex items-center gap-1 hover:underline">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.slice(0, 4).map((course) => (
              <Link key={course.id} href={`/student/view_details/${course.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="relative h-40 bg-gray-200 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  {course.isFree && <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">FREE</span>}
                  {course.isFeatured && <span className="absolute top-2 right-2 bg-[#924C2B] dark:bg-[#b86a3a] text-white text-[10px] font-bold px-2 py-0.5 rounded">FEATURED</span>}
                </div>
                <div className="p-3.5">
                  <p className="text-[10px] text-[#924C2B] dark:text-[#b86a3a] font-medium uppercase tracking-wider">{course.category}</p>
                  <h3 className="font-semibold text-sm text-gray-900 mt-1 line-clamp-2 group-hover:text-[#924C2B] dark:hover:text-[#b86a3a] transition">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{course.instructorName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-semibold text-gray-800">{course.rating}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">({course.reviewsCount.toLocaleString()})</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      {course.isFree ? (
                        <span className="font-bold text-emerald-600 text-sm">Free</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 text-sm">₹{course.price}</span>
                          {course.oldPrice > course.price && <span className="text-[10px] text-gray-400 line-through">₹{course.oldPrice}</span>}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{course.learnersCount.toLocaleString()} learners</span>
                  </div>
                </div>
              </Link>
            ))}
            {!catalogueLoading && !courses.length && <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No published courses are available yet.</div>}
          </div>
        </div>
      </section>

      {/* ─── 6. LEARNING PATHS ─── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Learning Paths</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">Structured curriculums designed to take you from beginner to professional</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEARNING_PATHS.map((lp) => {
              const Icon = getCatIcon(lp.icon);
              return (
                <div key={lp.id} className="bg-[#F7FAFC] dark:bg-[#171717] rounded-xl border border-gray-200 p-5 hover:border-[#924C2B] dark:hover:border-[#c9a882] hover:shadow-md transition-all">
                  <div className="h-10 w-10 rounded-lg bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 flex items-center justify-center mb-3"><Icon size={18} className="text-[#924C2B] dark:text-[#b86a3a]" /></div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{lp.title}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{lp.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3"><Clock size={12} /> {lp.duration}<BarChart size={12} className="ml-1" /> {lp.stepsCount} steps</div>
                  <div className="flex flex-wrap gap-1">
                    {lp.skills.slice(0, 3).map((skill) => (<span key={skill} className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{skill}</span>))}
                    {lp.skills.length > 3 && <span className="text-[10px] text-gray-400 px-1">+{lp.skills.length - 3}</span>}
                  </div>
                  <Link href="/student/courses" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#924C2B] dark:text-[#b86a3a] hover:underline">Start Path <ArrowRight size={12} /></Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 7. WHY BANDHAN (STUDENT FEATURES) ─── */}
      <section className="py-14 px-4 bg-[#F7FAFC] dark:bg-[#171717]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-gray-900">Why Bandhan Academy?</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">Everything you need to launch or grow your career in the events industry</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {STUDENT_FEATURES.map((feat) => (
              <div key={feat.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition">
                <div className="h-9 w-9 rounded-lg bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle size={18} className="text-[#924C2B] dark:text-[#b86a3a]" /></div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">{feat.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. HOW IT WORKS ─── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">Your journey from learner to certified professional in simple steps</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {HOW_LEARNING_WORKS.map((step, idx) => (
              <div key={step.number} className="flex flex-col items-center text-center relative">
                <div className="w-14 h-14 rounded-full bg-[#924C2B] dark:bg-[#b86a3a] flex items-center justify-center text-xl font-bold text-white shadow-md mb-3">{step.number}</div>
                {idx < HOW_LEARNING_WORKS.length - 1 && <div className="hidden md:block absolute top-7 left-[60%] w-[calc(100%-40px)] h-[2px] bg-[#924C2B] dark:bg-[#b86a3a]/20" />}
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 max-w-[140px]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. CERTIFICATE SHOWCASE ─── */}
      <section className="py-14 px-4 bg-[#F7FAFC] dark:bg-[#171717] border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Verifiable Career Accomplishments</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Earn Verifiable Industry Certificates</h2>
              <p className="text-sm text-gray-600 leading-relaxed">Celebrate your milestone with our premium verifiable completion credentials. Showcase your expertise, prove skills with active portfolio links, and earn critical trust from high-end clients.</p>
              <div className="space-y-3">
                {[
                  { title: "Secure Digital PDF Downloads", desc: "Download high-resolution, print-ready digital certificates in one click upon course completion." },
                  { title: "Verifiable Credential URL ID", desc: "Each certification comes with an active digital code that clients can look up to verify your training validity." },
                  { title: "Co-signed by Master Instructors", desc: "Our credentials feature actual signatures of verified agency founders, wedding planners, and industry pros." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="h-3 w-3 text-[#924C2B] dark:text-[#b86a3a]" /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/student/auth" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#924C2B] dark:bg-[#b86a3a] hover:bg-[#7A3E24] dark:hover:bg-[#a05a30] text-white font-semibold text-sm rounded-xl transition shadow-sm">
                <Award size={16} /> Earn Your Certificate
              </Link>
            </div>
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-inner">
                <div className="bg-[#F7FAFC] dark:bg-[#171717] p-6 sm:p-8 rounded-2xl border-4 border-double border-gray-200 shadow-sm relative aspect-[1.414] flex flex-col justify-between">
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-gray-300" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-gray-300" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-gray-300" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-gray-300" />
                  <div className="text-center space-y-4">
                    <div className="flex justify-center"><div className="h-8 w-8 rounded-full bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 flex items-center justify-center"><Award className="h-5 w-5 text-[#924C2B] dark:text-[#b86a3a]" /></div></div>
                    <h3 className="text-gray-800 text-lg font-bold uppercase tracking-widest">Certificate of Completion</h3>
                    <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">This document certifies that</p>
                    <h4 className="font-bold text-xl sm:text-2xl text-gray-950 underline decoration-[#924C2B] dark:decoration-[#b86a3a] underline-offset-4">Alexander Vance</h4>
                    <p className="text-[10px] text-gray-500 max-w-xs mx-auto">has successfully satisfied all completion standards for the professional masterclass</p>
                    <h5 className="text-xs font-bold text-[#924C2B] dark:text-[#b86a3a]">Luxury Wedding Planning: Concept to Execution</h5>
                    <p className="text-[9px] text-gray-400 font-medium">Completed on July 20, 2026 • 18.5 instructional hours</p>
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t border-gray-200 mt-4">
                    <div className="text-left"><span className="block italic text-[11px] text-gray-700">Sarah Jenkins</span><span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider border-t border-gray-200 pt-0.5">Instructor</span></div>
                    <div className="flex flex-col items-center"><div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center border-2 border-white"><ShieldCheck className="h-5 w-5 text-emerald-400" /></div><span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider mt-1">VERIFIED</span></div>
                    <div className="text-right"><span className="block font-mono text-[9px] text-[#924C2B] dark:text-[#b86a3a] font-bold">ID: EE-98412-LC</span><span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider border-t border-gray-200 pt-0.5">Credential ID</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. INSTRUCTOR CTA ─── */}
      <section className="py-14 px-4 bg-gradient-to-r from-[#924C2B] dark:from-[#b86a3a] to-[#C97B5A] dark:to-[#d4956f]">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-xl font-bold text-white">Share Your Expertise</h2>
            <p className="text-white/80 text-sm mt-2 max-w-md">Turn your industry experience into income. Create courses, build a community, and earn on your terms.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/instructor/login" className="bg-white text-[#924C2B] dark:text-[#b86a3a] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-100 transition">Become an Instructor</Link>
            <Link href="/student/courses" className="border border-white/30 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-white/10 transition">Learn More</Link>
          </div>
        </div>
      </section>

      {/* ─── 11. INSTRUCTOR VERIFICATION ─── */}
      <section className="py-14 px-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 flex justify-center order-last lg:order-first">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 rounded-3xl opacity-50 blur-2xl transform rotate-3" />
                <div className="relative bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-[#924C2B] dark:text-[#b86a3a]" /></div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ecosystem Security</span></div>
                    <span className="px-2.5 py-1 bg-emerald-50 rounded-full text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Onshore Verified</span>
                  </div>
                  <div className="text-center py-4 space-y-3">
                    <div className="relative inline-block">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150" alt="Verified Instructor" className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-[#924C2B] dark:border-[#c9a882]" />
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#924C2B] dark:bg-[#b86a3a] text-white rounded-full flex items-center justify-center border-2 border-white"><BadgeCheck className="h-4 w-4" /></div>
                    </div>
                    <div><h3 className="font-bold text-gray-900 text-base">Sarah Jenkins</h3><p className="text-xs text-gray-400 font-semibold">Luxury Planner & Stylist</p></div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-400">DigiLocker Identity</span><span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Linked</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Portfolio Review</span><span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Passed (4.95★)</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Audio Quality Audit</span><span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Compliant (HD)</span></div>
                  </div>
                  <div className="p-3 bg-[#924C2B]/5 dark:bg-[#b86a3a]/5 rounded-xl text-center text-[10px] text-[#924C2B] dark:text-[#b86a3a] font-semibold">Verified badge boost lists courses 30% higher in search rankings!</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Trust & Verification Guidelines</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Our Standard Onboarding & Professional Verification</h2>
              <p className="text-sm text-gray-600">We believe in authentic knowledge exchange. To maintain a premium ecosystem, we verify every single prospective instructor portfolio and credentials.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INSTRUCTOR_VERIFICATION_STEPS.map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="h-8 w-8 rounded-xl bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 text-[#924C2B] dark:text-[#b86a3a] flex items-center justify-center shrink-0 text-xs font-bold font-mono">{index + 1}</div>
                    <div><h4 className="text-sm font-bold text-gray-900">{step.title}</h4><p className="text-xs text-gray-500">{step.desc}</p></div>
                  </div>
                ))}
              </div>
              <Link href="/instructor/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#924C2B] dark:bg-[#b86a3a] hover:bg-[#7A3E24] dark:hover:bg-[#a05a30] text-white font-semibold text-sm rounded-xl transition shadow-sm"><FileCheck size={16} /> Apply as Instructor</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 12. COURSE CREATION WORKFLOW ─── */}
      <section className="py-14 px-4 bg-[#F7FAFC] dark:bg-[#171717] border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Instructor Roadmap</span>
            <h2 className="text-xl font-bold text-gray-900">The Course Creation Workflow</h2>
            <p className="text-sm text-gray-500">Launch your educational curriculum on our marketplace in nine structured milestones.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COURSE_CREATION_STEPS.map((step) => (
              <div key={step.number} className="bg-white border border-gray-200 hover:border-[#924C2B] dark:hover:border-[#c9a882]/30 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-8 w-8 rounded-lg bg-[#924C2B] dark:bg-[#b86a3a] text-white font-bold text-xs flex items-center justify-center shadow-sm">{step.number}</span>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#924C2B] dark:hover:text-[#b86a3a] transition">{step.title}</h3>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                <span className="absolute bottom-2 right-4 text-gray-100 font-mono font-extrabold text-3xl select-none pointer-events-none">#{String(step.number).padStart(2, "0")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 13. COURSE FORMATS ─── */}
      <section className="py-14 px-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Rich Syllabus Mediums</span>
            <h2 className="text-xl font-bold text-gray-900">Supported Course Content Formats</h2>
            <p className="text-sm text-gray-500">Deliver educational materials via an array of specialized channels.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COURSE_FORMATS.map((format) => {
              const Icon = getCatIcon(format.icon);
              return (
                <div key={format.title} className="bg-[#F7FAFC] dark:bg-[#171717] border border-gray-200 p-5 rounded-2xl flex gap-4 hover:bg-white hover:border-[#924C2B] dark:hover:border-[#c9a882]/30 hover:shadow-sm transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 text-[#924C2B] dark:text-[#b86a3a] flex items-center justify-center shrink-0"><Icon size={18} /></div>
                  <div><h3 className="font-bold text-sm text-gray-900">{format.title}</h3><p className="text-gray-500 text-xs leading-relaxed mt-1">{format.desc}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 14. ANALYTICS PREVIEW ─── */}
      <section className="py-14 px-4 bg-[#F7FAFC] dark:bg-[#171717] border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Business Intelligence Suite</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">A Robust Instructor Analytics Platform</h2>
              <p className="text-sm text-gray-600">Monitor student learning metrics, trace video drop-offs, and track enrollment cycles in real-time. Optimize your lesson structures with comprehensive demographic data.</p>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="bg-gray-950 px-5 py-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-mono font-bold text-gray-400 ml-2">BANDHAN-CONSOLE v2.4</span>
                  </div>
                  <span className="text-[10px] bg-[#924C2B] dark:bg-[#b86a3a] px-2 py-0.5 rounded-full font-bold">Sarah_Jenkins (Instructor)</span>
                </div>
                <div className="p-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Syllabus Performance Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { title: "Total Course Views", value: "48,210", change: "+12.4%", icon: <Eye className="h-3.5 w-3.5" /> },
                      { title: "Active Enrollments", value: "2,850", change: "+8.3%", icon: <Users className="h-3.5 w-3.5" /> },
                      { title: "Completion Rate", value: "42.8%", change: "+5.7%", icon: <Percent className="h-3.5 w-3.5" /> },
                      { title: "Student Rating", value: "4.9 / 5.0", change: "Stable", icon: <Star className="h-3.5 w-3.5" /> },
                      { title: "Written Reviews", value: "412", change: "+18 new", icon: <MessageSquare className="h-3.5 w-3.5" /> },
                      { title: "Estimated Revenue", value: "$41,250", change: "+15.2%", icon: <DollarSign className="h-3.5 w-3.5" /> },
                    ].map((m) => (
                      <div key={m.title} className="bg-[#F7FAFC] dark:bg-[#171717] border border-gray-100 p-3 rounded-xl">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase"><span>{m.title}</span><span className="text-[#924C2B] dark:text-[#b86a3a]">{m.icon}</span></div>
                        <div className="flex items-baseline justify-between pt-1"><span className="text-sm font-black text-gray-900">{m.value}</span><span className="text-[9px] font-bold text-emerald-600">{m.change}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 15. EARNINGS SECTION ─── */}
      <section className="py-14 px-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl opacity-50 blur-2xl transform -rotate-3" />
                <div className="relative bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center"><DollarSign className="h-4 w-4 text-emerald-600" /></div><span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Settlement Statement</span></div>
                    <span className="text-xs text-gray-400 font-bold font-mono">JULY 2026</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F7FAFC] dark:bg-[#171717] p-3 rounded-xl border border-gray-100"><span className="text-[10px] text-gray-400 font-bold uppercase block">Cleared Balance</span><span className="text-lg font-black text-gray-900">$18,450.00</span></div>
                    <div className="bg-[#F7FAFC] dark:bg-[#171717] p-3 rounded-xl border border-gray-100"><span className="text-[10px] text-gray-400 font-bold uppercase block">Pending Clearing</span><span className="text-lg font-black text-gray-400">$3,120.00</span></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Settlements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs p-2 bg-[#F7FAFC] dark:bg-[#171717] rounded-lg"><div><span className="font-bold text-gray-800 block">Payout to Bank Acc ...1204</span><span className="text-[10px] text-gray-400 block">Jul 10, 2026</span></div><span className="text-emerald-600 font-extrabold font-mono">-$12,450.00</span></div>
                      <div className="flex items-center justify-between text-xs p-2 bg-[#F7FAFC] dark:bg-[#171717] rounded-lg"><div><span className="font-bold text-gray-800 block">Wedding Masterclass Sales</span><span className="text-[10px] text-gray-400 block">Jul 08, 2026 • 15 students</span></div><span className="text-gray-900 font-extrabold font-mono">+$2,235.00</span></div>
                      <div className="flex items-center justify-between text-xs p-2 bg-[#F7FAFC] dark:bg-[#171717] rounded-lg"><div><span className="font-bold text-gray-800 block">Floral Design Course</span><span className="text-[10px] text-gray-400 block">Jul 06, 2026 • 8 students</span></div><span className="text-gray-900 font-extrabold font-mono">+$712.00</span></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 py-2 rounded-lg font-bold"><CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" /><span>Settlements process automatically every month.</span></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Revenue and Royalty Program</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Monetize Your Professional Experience Securely</h2>
              <p className="text-sm text-gray-600">Earn highly lucrative income by converting your daily experience into curated online education. Our transparent billing infrastructure splits commissions fairly.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Direct Course Sales", desc: "Keep 80% of revenue from organic student checkouts." },
                  { title: "Transparent Royalties", desc: "No hidden fees. Every transaction is displayed clearly." },
                  { title: "Automatic Monthly Payouts", desc: "Receive payouts to your bank on the 10th of every month." },
                  { title: "Settlement Monitoring", desc: "Track pending approvals and complete transactional ledgers." },
                ].map((hl) => (
                  <div key={hl.title}><h4 className="text-sm font-bold text-gray-900">{hl.title}</h4><p className="text-xs text-gray-500 mt-1">{hl.desc}</p></div>
                ))}
              </div>
              <Link href="/instructor/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"><TrendingUp size={16} /> Monetize Your Knowledge</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 16. FEATURED INSTRUCTORS ─── */}
      <section className="py-14 px-4 bg-[#F7FAFC] dark:bg-[#171717] border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Elite Creative Faculty</span>
            <h2 className="text-xl font-bold text-gray-900">Learn From Top Industry Professionals</h2>
            <p className="text-sm text-gray-500">Our instructors do not just teach—they lead. Browse masterclasses led by award-winning event architects and luxury planners.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from(new Map(courses.map((course) => [course.instructorName, course])).values()).slice(0, 4).map((course) => (
              <div key={course.instructorName} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col items-center text-center group">
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 flex items-center justify-center text-[#924C2B] dark:text-[#b86a3a]"><User size={36} /></div>
                </div>
                <h3 className="font-bold text-gray-900 text-base group-hover:text-[#924C2B] dark:hover:text-[#b86a3a] transition">{course.instructorName}</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">{course.category}</p>
                <div className="pt-4 border-t border-gray-100 mt-4 w-full space-y-2">
                  <div className="flex items-center justify-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /><span className="font-bold text-gray-800">{course.rating || "New"}</span><span className="text-gray-400 text-xs">Rating</span></div>
                  <div className="flex items-center justify-center gap-4 text-[11px]"><span className="flex items-center gap-1"><Users className="h-3 w-3 text-[#924C2B] dark:text-[#b86a3a]" />{course.learnersCount} Students</span></div>
                </div>
                <Link href="/student/courses" className="mt-5 w-full py-2 bg-[#F7FAFC] dark:bg-[#171717] hover:bg-[#924C2B] dark:hover:bg-[#b86a3a] hover:text-white text-gray-700 text-xs font-semibold rounded-xl transition text-center">View Courses</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews are intentionally omitted until verified enrollment reviews are exposed by the API. */}

      {/* ─── 18. WHY CHOOSE US ─── */}
      <section className="py-14 px-4 bg-[#F7FAFC] dark:bg-[#171717] border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Our Core Value Pillars</span>
            <h2 className="text-xl font-bold text-gray-900">Why Choose Our Platform?</h2>
            <p className="text-sm text-gray-500">We operate the gold standard educational network for event producers, planners, and industry freelancers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_CHOOSE_US.map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="h-3.5 w-3.5" /></div>
                <div><h3 className="font-bold text-sm text-gray-900 capitalize">{item.title}</h3><p className="text-gray-500 text-xs mt-1">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 19. MOBILE LEARNING ─── */}
      <section className="py-14 px-4 bg-white border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[260px]">
                <div className="absolute inset-0 bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 rounded-[40px] opacity-60 blur-2xl transform rotate-6" />
                <div className="relative bg-gray-900 p-3 rounded-[44px] shadow-2xl border-4 border-gray-800 aspect-[0.5] flex flex-col">
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-4 w-20 bg-gray-900 rounded-full z-20 flex items-center justify-center"><div className="h-1 w-8 bg-gray-800 rounded-full" /></div>
                  <div className="flex-1 bg-white rounded-[32px] overflow-hidden relative flex flex-col justify-between p-4 z-10 border border-gray-950/10">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2"><span className="text-[9px] font-black tracking-tight text-[#924C2B] dark:text-[#b86a3a] uppercase">Bandhan</span><span className="h-2 w-2 rounded-full bg-emerald-500" /></div>
                    <div className="bg-gray-950 rounded-xl overflow-hidden aspect-[1.7] relative flex items-center justify-center mb-3 shadow">
                      <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200&h=120" alt="Video" className="object-cover h-full w-full opacity-60" />
                      <div className="absolute h-8 w-8 rounded-full bg-white/95 flex items-center justify-center shadow"><Play className="h-4 w-4 text-[#924C2B] dark:text-[#b86a3a] ml-0.5" fill="currentColor" /></div>
                      <div className="absolute bottom-1.5 left-2 right-2 h-1 bg-white/20 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-[#924C2B] dark:bg-[#b86a3a]" /></div>
                    </div>
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      <span className="text-[8px] text-gray-400 font-bold block uppercase tracking-wider">Up Next</span>
                      <div className="p-1.5 bg-[#F7FAFC] dark:bg-[#171717] border border-gray-100 rounded-lg flex items-center justify-between"><span className="text-[9px] font-bold text-gray-800 line-clamp-1">Chapter 02: Tablescape Models</span><span className="text-[8px] text-[#924C2B] dark:text-[#b86a3a] font-bold">12m</span></div>
                      <div className="p-1.5 bg-[#F7FAFC] dark:bg-[#171717]/50 rounded-lg flex items-center justify-between"><span className="text-[9px] font-medium text-gray-400 line-clamp-1">Chapter 03: Floral Procurement</span><span className="text-[8px] text-gray-300 font-medium">18m</span></div>
                    </div>
                    <div className="pt-2 border-t border-gray-100"><div className="w-full py-1.5 bg-[#924C2B] dark:bg-[#b86a3a] text-white text-[9px] font-bold rounded-lg text-center shadow">Resume Training</div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Learn Anywhere, Anytime</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">A Premium Experience on Any Mobile Device</h2>
              <p className="text-sm text-gray-600">Never miss a lesson! Our website features robust responsive design optimizations that match any device. Continue watching video streams, access checklists, and download credentials on your commute.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Fully Responsive Web Access", desc: "No software installations needed. Log in directly on any device browser." },
                  { title: "Continue Where You Left Off", desc: "Auto book-marks your last watched second for seamless resumption." },
                  { title: "On-The-Go Lecture Streaming", desc: "HD video compresses dynamically based on your signal quality." },
                  { title: "Instant Notification Alerts", desc: "Receive updates regarding comments, discussions, and certification reviews." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 text-[#924C2B] dark:text-[#b86a3a] flex items-center justify-center shrink-0 mt-0.5"><Check className="h-3 w-3" /></div>
                    <div><h4 className="text-sm font-bold text-gray-900">{item.title}</h4><p className="text-xs text-gray-500">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 20. NEWSLETTER ─── */}
      <section className="py-14 px-4 bg-[#F7FAFC] dark:bg-[#171717] border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-xl space-y-3">
              <span className="text-xs font-semibold text-[#924C2B] dark:text-[#b86a3a] bg-[#924C2B]/10 dark:bg-[#b86a3a]/10 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Event Industry Intelligence</span>
              <h2 className="text-xl font-bold text-gray-900">Event Industry Insights</h2>
              <p className="text-sm text-gray-500">Receive new course and learning updates in your inbox.</p>
            </div>
          </div>
          <div className="mt-10 bg-gradient-to-r from-[#924C2B] dark:from-[#b86a3a] to-[#C97B5A] dark:to-[#d4956f] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-2">
                <h3 className="font-bold text-lg sm:text-xl">Subscribe to Event Industry Insights</h3>
                <p className="text-white/80 text-xs sm:text-sm max-w-xl">Get our weekly digest of corporate checklist guides, creative wedding moodboards, and instructor pricing models.</p>
              </div>
              <div className="lg:col-span-5">
                <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing! Check your inbox."); setNewsletterEmail(""); }} className="flex gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur border border-white/20">
                  <input type="email" required placeholder="Enter your email..." value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} className="w-full bg-transparent border-none outline-none text-white text-xs placeholder-white/50 px-3 py-2" />
                  <button type="submit" className="px-4 py-2 bg-white text-[#924C2B] dark:text-[#b86a3a] font-bold text-xs rounded-lg hover:bg-gray-100 transition shrink-0">Subscribe</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 21. FAQ ─── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm mt-2">Got questions? We've got answers.</p>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#F7FAFC] dark:bg-[#171717] transition">
                  <span className="font-medium text-sm text-gray-900">{faq.question}</span>
                  {openFaq === faq.id ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                </button>
                {openFaq === faq.id && <div className="px-4 pb-3.5"><p className="text-sm text-gray-600">{faq.answer}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 22. FINAL CTA ─── */}
      <section className="py-16 px-4 bg-[#1A365D]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Start Your Journey?</h2>
          <p className="text-white/80 text-sm mb-6 max-w-lg mx-auto">Join thousands of students and start building your career in the events industry today. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/student/auth" className="bg-white text-[#1A365D] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition shadow-sm">Get Started Free</Link>
            <Link href="/student/courses" className="border border-white/30 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-white/10 transition">Browse All Courses</Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-[10px] text-white/50">
            <span className="flex items-center gap-1"><CheckCircle size={12} /> Free account</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} /> Lifetime access</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ─── 23. FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
            <Image src="/Group1.png" alt="Bandhan Academy" width={433} height={96} className="h-7 w-auto mb-3" />
              <p className="text-xs leading-relaxed max-w-xs">India's premier online platform for event management and celebration industry education.</p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"><Globe size={14} /></a>
                <a href="#" className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"><Globe size={14} /></a>
                <a href="#" className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"><Globe size={14} /></a>
                <a href="#" className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"><Globe size={14} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Learn</h4>
              <div className="space-y-2 text-xs">
                <Link href="/student/courses" className="block hover:text-white transition">Browse Courses</Link>
                <Link href="/student/courses" className="block hover:text-white transition">Categories</Link>
                <Link href="/student/auth" className="block hover:text-white transition">Student Dashboard</Link>
                <Link href="/student/auth" className="block hover:text-white transition">Wishlist</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Teach</h4>
              <div className="space-y-2 text-xs">
                <Link href="/instructor/login" className="block hover:text-white transition">Become an Instructor</Link>
                <Link href="/instructor/login" className="block hover:text-white transition">Instructor Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Support</h4>
              <div className="space-y-2 text-xs">
                <span className="block hover:text-white transition cursor-pointer">Help Center</span>
                <span className="block hover:text-white transition cursor-pointer">Privacy Policy</span>
                <span className="block hover:text-white transition cursor-pointer">Terms of Service</span>
                <span className="block hover:text-white transition cursor-pointer">Contact Us</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} Bandhan Academy. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white transition">Privacy</span>
              <span className="cursor-pointer hover:text-white transition">Terms</span>
              <span className="cursor-pointer hover:text-white transition">Sitemap</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── SCROLL TO TOP ─── */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-6 right-6 z-40 h-10 w-10 rounded-full bg-[#924C2B] dark:bg-[#b86a3a] text-white shadow-lg flex items-center justify-center hover:bg-[#7A3E24] dark:hover:bg-[#a05a30] transition">
          <ChevronUp size={18} />
        </button>
      )}
    </div>
  );
}

function TV(props: any) { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="16 21 16 2 8 2 8 21"/></svg>); }
function FileIcon(props: any) { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>); }
function PenTool(props: any) { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>); }
function ClipboardList(props: any) { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>); }
