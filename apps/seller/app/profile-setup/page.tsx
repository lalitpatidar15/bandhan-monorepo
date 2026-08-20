import { Suspense } from "react";
import ProfileSetupForm from "@/components/forms/ProfileSetupForm";

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileSetupForm />
    </Suspense>
  );
}