export const portalRoles = [
  "buyer",
  "event_owner",
  "seller",
  "student",
  "instructor",
  "jobseeker",
  "recruiter",
  "admin",
  "moderator",
  "support",
  "finance",
] as const;

export type PortalRole = (typeof portalRoles)[number];

export const listingKinds = ["product", "service", "venue", "course", "job"] as const;
export type ListingKind = (typeof listingKinds)[number];

export type JourneyStepStatus = "complete" | "current" | "upcoming";

export interface JourneyStep {
  id: string;
  label: string;
  description?: string;
  href?: string;
  status: JourneyStepStatus;
}

export interface RoleRegistrationOption {
  role: PortalRole;
  title: string;
  description: string;
  portal: string;
}
