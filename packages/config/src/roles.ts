import type { PortalRole, RoleRegistrationOption } from "@bandhan/types";

export const registrationRoles: RoleRegistrationOption[] = [
  { role: "buyer", title: "Plan, shop or book", description: "Find products, services and venues for your event.", portal: "user" },
  { role: "seller", title: "Sell products", description: "List products for sale or rent and manage orders.", portal: "seller" },
  { role: "student", title: "Learn new skills", description: "Join courses, track progress and earn certificates.", portal: "student" },
  { role: "instructor", title: "Teach a course", description: "Create courses and support your learners.", portal: "student" },
  { role: "jobseeker", title: "Find a job", description: "Build your profile, apply and track applications.", portal: "job-seeker" },
  { role: "recruiter", title: "Hire people", description: "Post jobs and move applicants through hiring.", portal: "job-seeker" },
];

export const roleHomePath: Partial<Record<PortalRole, string>> = {
  buyer: "/userdashboard/overview",
  event_owner: "/userdashboard/planner",
  seller: "/dashboard",
  student: "/dashboard",
  instructor: "/instructor/dashboard",
  jobseeker: "/dashboard",
  recruiter: "/recruiter/dashboard",
  admin: "/dashboard",
  moderator: "/moderation",
  support: "/support",
  finance: "/finance",
};
