"use client";
import { useState } from "react";
import AuthLayout from "@/components/Auth/Authlayout";
import SignupForm from "@/components/Auth/signupForm";

export default function SignupPage() {
  const [image, setImage] = useState("/signup1.png"); // default step 1

  return (
    <AuthLayout
      image={image}
      position="left"
      logo="/singup2.png"
    >
      <SignupForm setImage={setImage} />
    </AuthLayout>
  );
}