export interface Category {
  id: string; title: string; coursesCount: number; icon: string; color: string;
}
export interface Course {
  id: string; title: string; instructorName: string; instructorTitle: string;
  instructorAvatar: string; rating: number; reviewsCount: number; learnersCount: number;
  duration: string; level: string; price: number; discountedPrice: number;
  isFree: boolean; isFeatured: boolean; image: string; category: string;
}
export interface LearningPath {
  id: string; title: string; description: string; icon: string; duration: string;
  stepsCount: number; skills: string[];
}
export interface FeatureItem {
  id: string; title: string; description: string; icon: string;
}
export interface StepItem {
  number: number; title: string; description: string;
}
export interface Instructor {
  id: string; name: string; expertise: string; rating: number;
  studentCount: number; courseCount: number; avatar: string; isVerified: boolean;
}
export interface Review {
  id: string; studentName: string; studentRole: string; studentAvatar: string;
  courseName: string; rating: number; reviewText: string; isVerifiedEnrollment: boolean;
}
export interface BlogItem {
  id: string; title: string; category: string; readTime: string;
  date: string; image: string; author: string; description: string;
}
export interface FAQItem {
  id: string; question: string; answer: string;
}

export const CATEGORIES: Category[] = [
  { id: "event-mgmt", title: "Event Management", coursesCount: 42, icon: "Calendar", color: "purple" },
  { id: "wedding-plan", title: "Wedding Planning", coursesCount: 38, icon: "Heart", color: "rose" },
  { id: "photography", title: "Photography", coursesCount: 29, icon: "Camera", color: "blue" },
  { id: "videography", title: "Videography", coursesCount: 21, icon: "Video", color: "indigo" },
  { id: "decoration", title: "Decoration", coursesCount: 35, icon: "Sparkles", color: "amber" },
  { id: "makeup-beauty", title: "Makeup and Beauty", coursesCount: 27, icon: "Paintbrush", color: "pink" },
  { id: "mehendi-art", title: "Mehendi Art", coursesCount: 16, icon: "Palette", color: "orange" },
  { id: "catering-food", title: "Catering and Food", coursesCount: 24, icon: "Utensils", color: "emerald" },
  { id: "hospitality", title: "Hospitality", coursesCount: 31, icon: "ConciergeBell", color: "teal" },
  { id: "fashion-styling", title: "Fashion and Styling", coursesCount: 19, icon: "Shirt", color: "violet" },
  { id: "sales-marketing", title: "Sales and Marketing", coursesCount: 33, icon: "TrendingUp", color: "cyan" },
  { id: "business-mgmt", title: "Business Management", coursesCount: 28, icon: "Briefcase", color: "sky" },
  { id: "finance", title: "Finance", coursesCount: 15, icon: "DollarSign", color: "green" },
  { id: "technology", title: "Technology", coursesCount: 18, icon: "Cpu", color: "indigo" },
  { id: "communication", title: "Communication Skills", coursesCount: 22, icon: "MessageSquare", color: "fuchsia" },
  { id: "entrepreneurship", title: "Entrepreneurship", coursesCount: 26, icon: "Lightbulb", color: "yellow" }
];

export const COURSES: Course[] = [
  { id: "luxury-weddings", title: "Luxury Wedding Planning Masterclass: Concept to Execution", instructorName: "Sarah Jenkins", instructorTitle: "Luxury Wedding Architect, 15+ Yrs Exp", instructorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120", rating: 4.9, reviewsCount: 412, learnersCount: 2850, duration: "18.5 hours", level: "Advanced", price: 199, discountedPrice: 149, isFree: false, isFeatured: true, image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600&h=400", category: "Wedding Planning" },
  { id: "event-logistics-101", title: "Corporate Event Management: Planning, Logistics & Safety", instructorName: "Michael Chang", instructorTitle: "Global Event Producer, Ex-MCI", instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120", rating: 4.8, reviewsCount: 320, learnersCount: 1980, duration: "12 hours", level: "Beginner", price: 99, discountedPrice: 79, isFree: false, isFeatured: true, image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600&h=400", category: "Event Management" },
  { id: "wedding-photo-fundamentals", title: "Wedding Photography: Professional Camera & Lighting Setups", instructorName: "Elena Rostova", instructorTitle: "Award-Winning International Photographer", instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120", rating: 4.9, reviewsCount: 248, learnersCount: 1540, duration: "15.5 hours", level: "Intermediate", price: 159, discountedPrice: 119, isFree: false, isFeatured: true, image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=600&h=400", category: "Photography" },
  { id: "creative-floral-decor", title: "Creative Floral Design & Table Styling for Events", instructorName: "Amara Okoye", instructorTitle: "Lead Decorator & Founder of BloomHaus", instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120", rating: 4.7, reviewsCount: 185, learnersCount: 1220, duration: "8 hours", level: "Intermediate", price: 129, discountedPrice: 89, isFree: false, isFeatured: true, image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600&h=400", category: "Decoration" },
  { id: "digital-marketing-events", title: "Digital Marketing & Social Media for Event Businesses", instructorName: "David Vance", instructorTitle: "Growth Hacker & Agency Owner", instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120", rating: 4.6, reviewsCount: 215, learnersCount: 1670, duration: "10 hours", level: "Beginner", price: 89, discountedPrice: 49, isFree: false, isFeatured: false, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600&h=400", category: "Sales and Marketing" },
  { id: "catering-menu-intro", title: "Introduction to Catering Operations & Menu Engineering", instructorName: "Chef Jean-Louis", instructorTitle: "Michelin Star Catering Advisor", instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120", rating: 4.5, reviewsCount: 92, learnersCount: 890, duration: "4.5 hours", level: "Beginner", price: 0, discountedPrice: 0, isFree: true, isFeatured: false, image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600&h=400", category: "Catering and Food" },
  { id: "mehendi-bridal-patterns", title: "Bridal Mehendi Artistry: Traditional & Contemporary Patterns", instructorName: "Priyah Patel", instructorTitle: "Renowned Henna Artisan, 12+ Yrs Exp", instructorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120&h=120", rating: 4.9, reviewsCount: 154, learnersCount: 910, duration: "14 hours", level: "Intermediate", price: 79, discountedPrice: 59, isFree: false, isFeatured: false, image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600&h=400", category: "Mehendi Art" },
  { id: "event-sales-sponsorship", title: "Sponsorship Acquisition: Pitching & Closing Event Deals", instructorName: "Marcus Thorne", instructorTitle: "Sponsorship Director, Global Tech Summits", instructorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120", rating: 4.8, reviewsCount: 112, learnersCount: 650, duration: "9.5 hours", level: "Advanced", price: 149, discountedPrice: 119, isFree: false, isFeatured: false, image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600&h=400", category: "Sales and Marketing" },
];

export const LEARNING_PATHS: LearningPath[] = [
  { id: "lp-event-planner", title: "Become an Event Planner", description: "Go from complete beginner to launching your own event management boutique, mastering coordination, budgets, and clients.", icon: "Calendar", duration: "45 hours", stepsCount: 5, skills: ["Event planning basics", "Budget management", "Vendor coordination", "Client communication", "Timeline management"] },
  { id: "lp-wedding-photographer", title: "Become a Wedding Photographer", description: "Master the technical, creative, and business aspects of capturing beautiful, unforgettable luxury weddings.", icon: "Camera", duration: "52 hours", stepsCount: 5, skills: ["Camera fundamentals", "Wedding photography", "Lightroom editing", "Portfolio development", "Client management"] },
  { id: "lp-decoration-biz", title: "Start an Event Decoration Business", description: "Learn how to conceptualize themes, purchase styling materials cost-effectively, and market your decorative brand.", icon: "Sparkles", duration: "38 hours", stepsCount: 5, skills: ["Theme design", "Decoration materials", "Pricing & bidding", "Vendor sourcing", "Social media marketing"] },
  { id: "lp-freelance-career", title: "Build a Freelance Event Career", description: "Launch your independent professional service structure, acquire high-paying accounts, and manage contracts seamlessly.", icon: "Briefcase", duration: "30 hours", stepsCount: 5, skills: ["Skill development", "Portfolio building", "Pricing models", "Client acquisition", "Business operations"] },
];

export const STUDENT_FEATURES: FeatureItem[] = [
  { id: "feat-reg", title: "Easy Student Registration", description: "Create your free learning account in seconds, configure your learning goals, and customize your industry interests.", icon: "UserPlus" },
  { id: "feat-discover", title: "Course Discovery", description: "Filter courses dynamically by event category, core skill, master instructor, budget, experience level, and student ratings.", icon: "Compass" },
  { id: "feat-secure", title: "Secure Course Enrollment", description: "Checkout safely using encrypted modern gateways with credit cards, digital wallets, and bank transfers.", icon: "ShieldCheck" },
  { id: "feat-emi", title: "Flexible EMI Options", description: "Split your learning investments with low-interest monthly installments on eligible courses via checkout partners.", icon: "CreditCard" },
  { id: "feat-dash", title: "Student Course Dashboard", description: "Access your centralized, private learning workspace on any browser or device to manage all enrolled training.", icon: "Layout" },
  { id: "feat-structured", title: "Structured Lessons", description: "Progress sequentially through premium multi-chapter video tutorials, case studies, checklists, and documentation.", icon: "BookOpen" },
  { id: "feat-tracking", title: "Real-time Progress Tracking", description: "Save where you left off, visualize your course completion ratios, and mark modules completed instantly.", icon: "CheckCircle" },
  { id: "feat-quizzes", title: "Quizzes & Assessments", description: "Test your theoretical knowledge and apply practical exercises with feedback checkpoints to reinforce learning.", icon: "FileText" },
  { id: "feat-cert", title: "Course Certificates", description: "Generate and secure high-resolution downloadable certificates immediately upon satisfying the course criteria.", icon: "Award" },
  { id: "feat-wishlist", title: "Course Wishlist", description: "Bookmark professional topics you are interested in and secure them at discount prices during seasonal campaigns.", icon: "Heart" },
  { id: "feat-notify", title: "Smart Notifications", description: "Receive alert bulletins regarding live Q&As, uploaded chapters, certification results, and direct instructor messages.", icon: "Bell" },
  { id: "feat-reviews", title: "Ratings and Reviews", description: "Rate completed training, read feedback left by fellow industry peers, and contribute to standard content quality.", icon: "Star" },
];

export const HOW_LEARNING_WORKS: StepItem[] = [
  { number: 1, title: "Create Your Profile", description: "Sign up and configure your career goals & event industry interests." },
  { number: 2, title: "Discover a Course", description: "Filter through premium syllabus options developed by seasoned field professionals." },
  { number: 3, title: "Enroll and Pay", description: "Access affordable one-time tuition payments, with friendly EMI plans available." },
  { number: 4, title: "Complete Lessons", description: "Watch immersive videos, submit real case-studies, and solve modular review quizzes." },
  { number: 5, title: "Download Certificate", description: "Secure your verified course completion credential to share with future clients." },
];

export const INSTRUCTOR_ROLES = [
  "Event Planners", "Photographers", "Decorators", "Makeup Artists", "Caterers",
  "Hospitality Professionals", "Business Consultants", "Industry Trainers", "Freelancers", "Educators"
];

export const INSTRUCTOR_BENEFITS = [
  { title: "Create professional courses", desc: "Build sequential chapters with video uploads, templates, and reference booklets." },
  { title: "Organize modules & lessons", desc: "Keep content clean, interactive, and structured with our drag-and-drop hierarchy." },
  { title: "Upload videos & assets", desc: "Host secure premium streaming and provide downloadable excel budget calculators or pitch decks." },
  { title: "Set custom course pricing", desc: "Determine your own masterclass values, run seasonal promotions, and offer local currencies." },
  { title: "Manage your enrollments", desc: "Monitor student counts, manage cohort lists, and connect with attendees via live messaging." },
  { title: "Track student progress", desc: "Identify where students thrive or struggle with individual student completion metrics." },
  { title: "Create assessments & tests", desc: "Introduce practical challenges, multiple choice quizzes, and peer-graded case-studies." },
  { title: "Issue custom certificates", desc: "Co-sign official digital certifications featuring your custom brand logo and credential keys." },
  { title: "View course analytics", desc: "Evaluate student bounce rates, lecture engagement levels, and marketing conversion rates." },
  { title: "Track detailed earnings", desc: "Transparent revenue accounting with detailed ledger breakdowns, taxes, and automatic payout options." },
  { title: "Receive student reviews", desc: "Gather constructive feedback, build your professional rating, and optimize future lectures." },
  { title: "Promote via featured listings", desc: "Drive high volumes of organic platform traffic using built-in marketing and ad placements." },
];

export const INSTRUCTOR_VERIFICATION_STEPS = [
  { title: "Profile Setup", desc: "Submit your bio, social platforms, and brief business history." },
  { title: "Professional Details", desc: "Provide your event portfolio link, years of active business, and core expertise." },
  { title: "Experience Verification", desc: "Provide verified references or portfolio highlights of past events, weddings, or conferences." },
  { title: "DigiLocker Integration", desc: "Instantly link government IDs and educational certifications for trusted, lightning-fast onboarding." },
  { title: "Course Moderation", desc: "Our team reviews video tests and audio quality to ensure premium standards are consistently met." },
  { title: "Verified Badge", desc: "Secure the Verified Professional badge, enhancing student confidence, enrollment trust, and search rankings." },
];

export const COURSE_CREATION_STEPS = [
  { number: 1, title: "Register as Instructor", desc: "Submit your profile application and link your portfolio." },
  { number: 2, title: "Complete Verification", desc: "Get authorized instantly via DigiLocker and portfolio reviews." },
  { number: 3, title: "Create a Course Draft", desc: "Draft your structural syllabus, targeting specific skill levels." },
  { number: 4, title: "Add Modules & Lessons", desc: "Organize chapters logically, from event theory to live demonstrations." },
  { number: 5, title: "Upload Content & Media", desc: "Publish HD videos, presentation slides, checklists, and templates." },
  { number: 6, title: "Set Pricing", desc: "Establish pricing structures, support local currencies, and activate EMI options." },
  { number: 7, title: "Submit for Review", desc: "Our moderation experts check audio-visual quality within 48 hours." },
  { number: 8, title: "Publish & Enroll", desc: "Go live! Start receiving organic student signups and process payments instantly." },
  { number: 9, title: "Track & Earn", desc: "Monitor views, analyze learner stats, and transfer earnings monthly." },
];

export const COURSE_FORMATS = [
  { title: "Video Lessons", desc: "Ultra HD recordings of live setup operations, studio styling, and lighting arrangements.", icon: "Tv" },
  { title: "Documents & Checklists", desc: "Comprehensive PDF schedules, bridal coordination check-sheets, and vendor agreements.", icon: "File" },
  { title: "Downloadable Resources", desc: "Live Excel planning calculators, budget sheets, and editable customer pitch templates.", icon: "Download" },
  { title: "Quizzes", desc: "Checkpoints to verify retention of safety guidelines, catering regulations, and sales tactics.", icon: "Award" },
  { title: "Assessments", desc: "Submit event portfolios, decor drafts, or mock proposals for professional grading.", icon: "PenTool" },
  { title: "Assignments", desc: "Hands-on projects recreating wedding tablescapes, shooting layout samples, and analyzing vendor bids.", icon: "ClipboardList" },
  { title: "Recorded Demonstrations", desc: "Over-the-shoulder recordings of camera workflows, makeup steps, and floral assembly.", icon: "Video" },
  { title: "Case Studies", desc: "Deconstruct real event crises, multi-million dollar luxury galas, and risk management scenarios.", icon: "BookOpen" },
  { title: "Practical Projects", desc: "Build a complete, launch-ready business model or a wedding proposal pitch deck for feedback.", icon: "Briefcase" },
];

export const FEATURED_INSTRUCTORS: Instructor[] = [
  { id: "inst-sarah", name: "Sarah Jenkins", expertise: "Luxury Wedding Planning & Architecture", rating: 4.95, studentCount: 12450, courseCount: 4, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150", isVerified: true },
  { id: "inst-michael", name: "Michael Chang", expertise: "Global Corporate Event Production", rating: 4.88, studentCount: 9840, courseCount: 3, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150", isVerified: true },
  { id: "inst-elena", name: "Elena Rostova", expertise: "Fine Art Wedding Photography & Lighting", rating: 4.92, studentCount: 6810, courseCount: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150", isVerified: true },
  { id: "inst-amara", name: "Amara Okoye", expertise: "Modern Floral Design & Styling", rating: 4.79, studentCount: 4500, courseCount: 3, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150", isVerified: true },
];

export const REVIEWS: Review[] = [
  { id: "rev-1", studentName: "Priya Sharma", studentRole: "Founder, Priya & Co. Events", studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100", courseName: "Luxury Wedding Planning Masterclass", rating: 5, reviewText: "This masterclass completely transformed my side hustle into a high-end wedding planning boutique. Sarah's actual template calculators saved me weeks of manual work and won me my first major client!", isVerifiedEnrollment: true },
  { id: "rev-2", studentName: "Rahul Verma", studentRole: "Freelance Photographer", studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100", courseName: "Wedding Photography: Professional Camera & Lighting Setups", rating: 5, reviewText: "The lighting chapters alone are worth ten times the price. Elena explains practical indoor flash techniques that made me look like an absolute pro at my next wedding assignment.", isVerifiedEnrollment: true },
  { id: "rev-3", studentName: "Ananya Gupta", studentRole: "Event Decorator", studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100", courseName: "Creative Floral Design & Table Styling", rating: 5, reviewText: "Incredibly structured and realistic. The crisis management case studies and practical floral setup walkthroughs were absolutely invaluable for my business.", isVerifiedEnrollment: true },
  { id: "rev-4", studentName: "Samantha Miller", studentRole: "Corporate Coordinator", studentAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100", courseName: "Corporate Event Management: Planning, Logistics & Safety", rating: 5, reviewText: "Michael's case studies on crisis management literally saved our team during a vendor electrical blackout in our last annual convention. Life-saving content!", isVerifiedEnrollment: true },
];

export const WHY_CHOOSE_US = [
  { title: "Industry-focused syllabus", desc: "No generic theory. Learn specific wedding budgets, vendor guidelines, and crisis protocol taught by actual experts." },
  { title: "Experienced instructors", desc: "Learn directly from practitioners who design million-dollar luxury galas and award-winning campaigns." },
  { title: "Practical workflows first", desc: "Gain access to actual event contract templates, catering calculators, checklist trackers, and styling booklets." },
  { title: "Flexible & self-paced", desc: "Study at your absolute convenience on mobile, tablet, or desktop with unlimited lifetime material access." },
  { title: "Secure global payment gateways", desc: "Enroll instantly with standard cards, online banking, and wallets backed by top security certificates." },
  { title: "Easy EMI installment programs", desc: "Spread investment costs across multiple months with friendly EMI checkouts on applicable items." },
  { title: "Real-time progress monitoring", desc: "Visualize precise completion steps and resume training instantly on any browser or system." },
  { title: "Quizzes & project feedback", desc: "Test concept retention with mock planning scenario questionnaires and portfolio grading." },
  { title: "Verified digital credentials", desc: "Receive elegant, verifiable course completion credentials complete with shareable tracking links." },
  { title: "Supportive student networks", desc: "Join cohort forums to exchange vendor details, seek career advice, and discover freelance projects." },
  { title: "Lucrative teaching avenues", desc: "Are you a seasoned pro? Package your unique skillsets, set tuition rates, and collect passive royalties." },
];

export const BLOGS: BlogItem[] = [
  { id: "blog-1", title: "10 Luxury Wedding Design Trends Set to Dominate This Season", category: "Wedding Planning", readTime: "6 min read", date: "Jul 15, 2026", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400&h=250", author: "Sarah Jenkins", description: "Explore the shift towards bold floral installations, immersive table layouts, and sustainable luxury styling choices." },
  { id: "blog-2", title: "The Ultimate Technical Guide to Wedding Photography Lighting", category: "Photography", readTime: "8 min read", date: "Jul 10, 2026", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=400&h=250", author: "Elena Rostova", description: "Master off-camera flash setups, bouncing light in dim historical venues, and capturing crisp motion on the dancefloor." },
  { id: "blog-3", title: "How to Price Your Creative Event Services: A Step-by-Step Guide", category: "Business Growth", readTime: "10 min read", date: "Jul 05, 2026", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=250", author: "Marcus Thorne", description: "Stop undercharging! Learn how to factor overhead, calculate client setup time, and present value-based event styling bids." },
];

export const FAQS: FAQItem[] = [
  { id: "faq-1", question: "How do I enroll in a course?", answer: "Browse our extensive curriculum, select a course, and click 'Enroll Now'. Complete your secure payment via standard credit card, bank transfer, or electronic wallet to get immediate lifetime access to your classes." },
  { id: "faq-2", question: "Can I save courses to a wishlist?", answer: "Absolutely! Clicking the heart icon on any course card will save it to your personal wishlist, allowing you to easily locate and buy it later, or grab it during seasonal discount programs." },
  { id: "faq-3", question: "How do I track my learning progress?", answer: "Enrolled courses are automatically tracked. Your dashboard will monitor completed video lessons, documents, and overall course percentage, so you can always resume exactly where you left off on any device." },
  { id: "faq-4", question: "Are quizzes and assessments mandatory?", answer: "While we highly recommend taking them to test your knowledge and cement your learning, quizzes are self-paced and optional, unless satisfying a specific partner certification mandate." },
  { id: "faq-5", question: "How do I download a course certificate?", answer: "Once you complete 100% of the lessons and pass the required assessment milestones, a high-resolution, verified digital certificate becomes instantly downloadable in PDF format on your dashboard." },
  { id: "faq-6", question: "Are EMI options available?", answer: "Yes, we partner with leading installment processors to offer easy, low-interest monthly EMI payments for eligible courses. Available options will display clearly during your payment gateway checkout." },
  { id: "faq-7", question: "How do I become an instructor?", answer: "Simply click 'Become an Instructor' or 'Teach With Us', submit your professional event industry details, upload a link to your creative portfolio, and verify your ID to initiate our standard onboarding flow." },
  { id: "faq-8", question: "How are instructors verified?", answer: "We verify credentials through past event work submissions, professional reviews, and DigiLocker ID integration where available. All prospective instructors undergo audio-visual mock lesson reviews to ensure high platform standards." },
  { id: "faq-9", question: "How do instructors create courses?", answer: "Instructors receive access to our sequential Course Creator Portal, allowing them to outline custom chapters, upload lecture videos, set lesson pricing, embed PDF worksheets, and configure custom quizzes." },
  { id: "faq-10", question: "How are instructor earnings calculated?", answer: "Instructors set their own tuition pricing. When a course is purchased, our platform processes transactions securely, calculates our transparent service commission, and prepares the payout ledger." },
  { id: "faq-11", question: "Can instructors feature their courses?", answer: "Yes, verified instructors can request premium banner placements or secure high rankings under specific search keywords to maximize enrollment exposure and build active student followings." },
  { id: "faq-12", question: "How are course reviews managed?", answer: "Only verified student learners who have purchased and spent significant hours watching the lessons can publish ratings and reviews. This completely eliminates spam or artificial booster accounts, maintaining platform trust." },
];

export const STATISTICS = [
  { value: "150+", label: "Professional Courses", desc: "Expert event modules" },
  { value: "45+", label: "Verified Instructors", desc: "Top wedding & event pros" },
  { value: "28k+", label: "Enrolled Students", desc: "Building careers worldwide" },
  { value: "120k+", label: "Learning Hours Done", desc: "Video lectures & projects" },
  { value: "18k+", label: "Certificates Issued", desc: "Verified credentials" },
];
