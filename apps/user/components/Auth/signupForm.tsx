// "use client";

// import { useState, type ChangeEvent } from "react";
// import { useRouter } from "next/navigation";
// import Input from "../ui/Input";
// import { Button } from "../ui/Button";
// import { FaFacebook } from "react-icons/fa";
// import { FcGoogle } from "react-icons/fc";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
// import { MdLock, MdPerson } from "react-icons/md";
// import { useRegisterUserMutation, useCompleteRegistrationMutation } from "@/store/api/authApi";

// type SignupFormProps = {
//   step: number;
//   setStep: React.Dispatch<React.SetStateAction<number>>;
// };

// export default function SignupForm({
//   step,
//   setStep,
// }: SignupFormProps) {
//   // Store registrationId after step 1
//   const [registrationId, setRegistrationId] = useState<string>("ID");
//   const router = useRouter();
//   const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();
//   const [completeRegistration, { isLoading: isCompletingRegistration }] = useCompleteRegistrationMutation();
//   const [isLoading, setIsLoading] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [username, setUsername] = useState("");
//   const [phone, setPhone] = useState("");
  
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const passwordChecks = [
//     { label: "At least 1 uppercase", valid: /[A-Z]/.test(password) },
//     { label: "At least 1 number", valid: /\d/.test(password) },
//     { label: "At least 8 characters", valid: password.length >= 8 },
//   ];

//   const steps = [
//     {
//       title: "Join us today!",
    
//       description: "Please enter your details to get started",
//     },
//     {
//       title: "Personal Information",
//       description: "Provide essential information to proceed.",
//     },
//     {
//       title: "Password Setup",
//       description: "Set up a secure password to protect your account.",
//     },
//   ];

//   const completedChecks = passwordChecks.filter((check) => check.valid).length;

//  const goNext = async () => {
//   setError(null);

//   if (step === 1) {
//     if (!email.trim()) {
//       setError("Please enter your email address.");
//       return;
//     }

//     if (!email.includes("@")) {
//       setError("Please enter a valid email address.");
//       return;
//     }

//     try {
//      const result = await registerUser({
//   email: email.trim(),
// }).unwrap();

// console.log(result);

// setRegistrationId(result.id);
//       // IMPORTANT
//       const receivedId =
//         result?.id ||
//         result?._id ||
//         result?.data?.id ||
//         result?.data?._id;

//       if (!receivedId) {
//         setError("ID not received from backend");
//         return;
//       }

//       setRegistrationId(receivedId);

//       console.log("SAVED ID =>", receivedId);

//       setStep(2);

//     } catch (err: any) {
//       console.log(err);

//       let errorMsg = "Registration failed.";

//       if (err?.data?.message) {
//         errorMsg = err.data.message;
//       }

//       setError(errorMsg);
//     }

//     return;
//   }

//   if (step === 2) {
//     if (!name.trim()) {
//       setError("Full name is required.");
//       return;
//     }

//     if (!phone.trim()) {
//       setError("Phone number is required.");
//       return;
//     }

//     setStep(3);
//   }
// };

//   const goBack = () => {
//     setError(null);
//     setStep((current) => Math.max(current - 1, 1));
//   };

// const handleSubmit = async () => {
//   setError(null);

//   if (!password.trim()) {
//     setError("Please create a password.");
//     return;
//   }

//   if (password !== confirmPassword) {
//     setError("Passwords do not match.");
//     return;
//   }

//   if (completedChecks < passwordChecks.length) {
//     setError("Your password should meet all requirements.");
//     return;
//   }

//   if (!registrationId) {
//     setError("Registration step incomplete. Please start again.");
//     return;
//   }

//   setIsLoading(true);

//   try {
//     console.log("FINAL REGISTRATION ID =>", registrationId);

//     const result = await completeRegistration({
//       id: registrationId,
//       data: {
//         fullName: name.trim(),
//         email: email.trim(),
//         username: username.trim(),
//         phone: phone.trim(),
//         password,
//         confirmPassword,
//       },
//     }).unwrap();

//     console.log("COMPLETE REGISTRATION RESPONSE =>", result);

//     setSuccess(true);

//     setTimeout(() => {
//       router.push("/userdashboard");
//     }, 700);

//   } catch (submitError: any) {
//     console.error("Signup error:", submitError);

//     let errorMsg = "Registration failed. Please try again later.";

//     if (typeof submitError === "string") {
//       errorMsg = submitError;
//     } else if (submitError?.data?.message) {
//       errorMsg = submitError.data.message;
//     } else if (submitError?.error) {
//       errorMsg = submitError.error;
//     } else if (submitError?.status === "FETCH_ERROR") {
//       errorMsg =
//         "Network error: Unable to reach the server.";
//     }

//     setError(errorMsg);

//   } finally {
//     setIsLoading(false);
//   }
// };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <img
//           src="/Group.png"
//           alt="Bandhan Logo"
//           className="mx-auto mb-4 h-14 w-60 object-contain"
//         />
//       </div>

//       {step === 1 && (
//         <div className="space-y-4">
//           <h2 className="text-center text-lg font-semibold text-[#3A2E24]">
//             {steps[0].title}
//           </h2>
//           <p className="text-center text-[10px] text-[#6B625A]">
//             {steps[0].description}
//           </p>
//           <Button
//             variant="custom"
//             className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DDD6CD] bg-white py-3 text-sm font-medium text-[#1F2937] hover:bg-[#F8F4EF] transition"
//           >
//             <FcGoogle size={20} />
//             Sign up with Google
//           </Button>

//           <Button
//             variant="custom"
//             className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DDD6CD] bg-white py-3 text-sm font-medium text-[#1F2937] hover:bg-[#F8F4EF] transition"
//           >
//             <FaFacebook size={20} className="text-blue-600" />
//             Sign up with Facebook
//           </Button>

//           <div className="flex items-center gap-3">
//             <div className="flex-1 border-t border-[#DDD6CD]" />
//             <span className="text-xs text-gray-500 font-medium">Or</span>
//             <div className="flex-1 border-t border-[#DDD6CD]" />
//           </div>

//           <Input
//             value={email}
//             onChange={(e: ChangeEvent<HTMLInputElement>) =>
//               setEmail(e.target.value)
//             }
//             placeholder="Email address or username"
//             type="email"
//             className="mt-1 py-3"
//           />

//           {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

//           <Button
//             onClick={goNext}
//             className="w-full rounded-lg bg-[#7A3F23] py-3 text-sm font-semibold text-white hover:bg-[#6d2d09] transition"
//           >
//             Get started
//           </Button>

//           <p className="text-center text-sm text-gray-600">
//             Already have an account?{" "}
//             <span
//               className="cursor-pointer font-semibold text-[#7A3F23] hover:underline"
//               onClick={() => router.push("/login")}
//             >
//               Sign in
//             </span>
//           </p>
//         </div>
//       )}

//       {step === 2 && (
//         <div className="space-y-4">
          
//           <div
//             className="w-14 h-14 rounded-full border border-[#E4E5E7A] 
//              bg-gradient-to-r from-[#E4E5E77A] via-white to-[#E4E5E77A]/0 
//           flex items-center justify-center mx-auto shadow-sm"
//           >
//             <div className="w-8 h-8 rounded-full border border-[#E2E4E9] bg-white flex items-center justify-center shadow-sm">
//               <MdPerson
//                 size={16}
//                 className="text-white bg-[#525866]  p-[3px]"
//               />
//             </div>
//           </div>
//           <h2 className="text-center text-lg font-semibold text-[#3A2E24]">
//             {steps[1].title}
//           </h2>
//           <p className="text-center text-sm text-[#6B625A]">
//             {steps[1].description}
//           </p>
//           <div>
//             <label className="text-sm font-semibold text-[#3A2E24]">
//               Full name *
//             </label>
//             <Input
//               value={name}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setName(e.target.value)
//               }
//               placeholder="  Name"
//               type="text"
//               className="mt-2"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-semibold text-[#3A2E24]">
//               Username{" "}
//               <span className="text-gray-400 font-normal">(Optional)</span>
//             </label>
//             <Input
//               value={username}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setUsername(e.target.value)
//               }
//               placeholder="Bandhan"
//               type="text"
//               className="mt-2"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-semibold text-[#3A2E24]">
//               Phone Number *
//             </label>
//             <div className="mt-2 flex gap-2">
//               <select className="rounded-lg border border-[#DDD6CD] bg-white px-3 py-2 text-sm font-medium text-[#3A2E24]">
//                 <option value="+91">🇮🇳 +91</option>
//                 <option value="+1">🇺🇸 +1</option>
//                 <option value="+44">🇬🇧 +44</option>
//                 <option value="+86">🇨🇳 +86</option>
//               </select>
//               <Input
//                 value={phone}
//                 onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                   setPhone(e.target.value)
//                 }
//                 placeholder="12345 67890"
//                 type="tel"
//                 className="flex-1"
//               />
//             </div>
//           </div>

//           {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

//           <Button
//             onClick={goNext}
//             className="w-full rounded-lg bg-[#7A3F23] py-3 text-sm font-semibold text-white hover:bg-[#6d2d09] transition"
//           >
//             Continue
//           </Button>

//           <p className="text-center text-sm text-gray-600">
//             Want to fill in later?{" "}
//           </p>
//         </div>
//       )}

//      {step === 3 && (
//   <div className="mx-auto w-full max-w-[420px]">

//     {/* LOCK ICON */}
//     <div className="mb-6 flex justify-center">
//       <div
//         className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#EAECF0]"
//         style={{
//           background:
//             "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
//         }}
//       >
//         <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#EAECF0] bg-white shadow-sm">
//           <MdLock size={20} className="text-[#667085]" />
//         </div>
//       </div>
//     </div>

//     {/* TITLE */}
//     <div className="mb-4 text-center">
//       <h2 className="text-[32px] font-semibold leading-[38px] text-[#181D27]">
//         Password Setup
//       </h2>

//       <p className="mt-2 text-sm text-[#667085]">
//         Set up a secure password to protect your account.
//       </p>
//     </div>

//     {/* FORM */}
//     <div className="space-y-5">
      
//       {/* PASSWORD */}
//       <div>
//         <label className="mb-2 block text-sm font-medium text-[#344054]">
//           Create a Password *
//         </label>

//         <div className="relative">
//           {/* LEFT ICON */}
//           <div className="absolute left-4 top-1/2 -translate-y-1/2">
//             <MdLock size={18} className="text-[#98A2B3]" />
//           </div>

//           <input
//             type={showPassword ? "text" : "password"}
//             value={password}
//             onChange={(e: ChangeEvent<HTMLInputElement>) =>
//               setPassword(e.target.value)
//             }
//             placeholder="••••••••"
//             className="h-[52px] w-full rounded-xl border border-[#D0D5DD] bg-white pl-11 pr-11 text-sm text-[#101828] shadow-sm outline-none transition-all duration-200 placeholder:text-[#98A2B3] focus:border-[#7A3F23]"
//           />

//           {/* EYE ICON */}
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
//           >
//             {showPassword ? (
//               <AiOutlineEyeInvisible size={20} />
//             ) : (
//               <AiOutlineEye size={20} />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* CONFIRM PASSWORD */}
//       <div>
//         <label className="mb-2 block text-sm font-medium text-[#344054]">
//           Confirm Password *
//         </label>

//         <div className="relative">
//           {/* LEFT ICON */}
//           <div className="absolute left-4 top-1/2 -translate-y-1/2">
//             <MdLock size={18} className="text-[#98A2B3]" />
//           </div>

//           <input
//             type={showConfirmPassword ? "text" : "password"}
//             value={confirmPassword}
//             onChange={(e: ChangeEvent<HTMLInputElement>) =>
//               setConfirmPassword(e.target.value)
//             }
//             placeholder="••••••••"
//             className="h-[52px] w-full rounded-xl border border-[#D0D5DD] bg-white pl-11 pr-11 text-sm text-[#101828] shadow-sm outline-none transition-all duration-200 placeholder:text-[#98A2B3] focus:border-[#7A3F23]"
//           />

//           {/* EYE ICON */}
//           <button
//             type="button"
//             onClick={() =>
//               setShowConfirmPassword(!showConfirmPassword)
//             }
//             className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
//           >
//             {showConfirmPassword ? (
//               <AiOutlineEyeInvisible size={20} />
//             ) : (
//               <AiOutlineEye size={20} />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* PASSWORD RULES */}
//       <div className="pt-1">
//         <p className="mb-3 text-xs font-medium text-[#D92D20]">
//           Weak password. Must contain at least;
//         </p>

//         {/* PROGRESS */}
//         <div className="mb-4 h-[3px] w-full overflow-hidden rounded-full bg-[#EAECF0]">
//           <div
//             className="h-full rounded-full bg-[#7A3F23] transition-all duration-300"
//             style={{
//               width: `${
//                 (completedChecks / passwordChecks.length) * 100
//               }%`,
//             }}
//           />
//         </div>

//         {/* RULE LIST */}
//         <div className="space-y-2.5">
//           {passwordChecks.map((check) => (
//             <div
//               key={check.label}
//               className="flex items-center gap-2"
//             >
//               <div
//                 className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px]
//                 ${
//                   check.valid
//                     ? "border-green-500 bg-green-50 text-green-600"
//                     : "border-[#D0D5DD] bg-white text-[#98A2B3]"
//                 }`}
//               >
//                 ✓
//               </div>

//               <span
//                 className={`text-sm ${
//                   check.valid
//                     ? "text-[#344054]"
//                     : "text-[#667085]"
//                 }`}
//               >
//                 {check.label}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ERROR */}
//       {error && (
//         <p className="text-sm font-medium text-red-600">
//           {error}
//         </p>
//       )}

//       {/* SUCCESS */}
//       {success && (
//         <p className="text-sm font-medium text-green-600">
//           ✓ Registration successful!
//         </p>
//       )}

//       {/* BUTTON */}
//       <Button
//         onClick={handleSubmit}
//         disabled={isLoading || success}
//         className="mt-6 h-[52px] w-full rounded-xl bg-[#8B4A2B] text-sm font-semibold text-white transition-all hover:bg-[#72371C] disabled:cursor-not-allowed disabled:opacity-70"
//       >
//         {isLoading
//           ? "Saving..."
//           : success
//           ? "Done"
//           : "Continue"}
//       </Button>
//     </div>
//   </div>
// )}
//     </div>
//   );
// }





"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdLock, MdPerson } from "react-icons/md";
import { useCompleteRegistrationMutation, useRegisterUserMutation } from "@/store/api/authApi";

type SignupFormProps = {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

type RegistrationStartResponse = {
  registrationId?: string;
  id?: string;
  data?: { _id?: string };
};

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;

  const requestError = error as {
    data?: { message?: unknown };
    message?: unknown;
    error?: unknown;
  };
  const message = requestError.data?.message ?? requestError.message ?? requestError.error;
  return typeof message === "string" && message.trim() ? message : fallback;
}

export default function SignupForm({
  step,
  setStep,
}: SignupFormProps) {

  const router = useRouter();
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();
  const [completeRegistration, { isLoading: isCompletingRegistration }] = useCompleteRegistrationMutation();

  // SAME UI - ONLY API REMOVED

  const [registrationId, setRegistrationId] =
    useState<string>("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  const passwordChecks = [
    {
      label: "At least 1 uppercase",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least 1 number",
      valid: /\d/.test(password),
    },
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
  ];

  const completedChecks =
    passwordChecks.filter(
      (check) => check.valid
    ).length;

  const steps = [
    {
      title: "Join us today!",
      description:
        "Please enter your details to get started",
    },
    {
      title: "Personal Information",
      description:
        "Provide essential information to proceed.",
    },
    {
      title: "Password Setup",
      description:
        "Set up a secure password to protect your account.",
    },
  ];

  // STEP NEXT
  const goNext = async () => {
    setError(null);

    // STEP 1
    if (step === 1) {
      if (!email.trim()) {
        setError(
          "Please enter your email address."
        );
        return;
      }

      if (!email.includes("@")) {
        setError(
          "Please enter a valid email address."
        );
        return;
      }

      try {
        const result = (await registerUser({ email: email.trim(), role }).unwrap()) as RegistrationStartResponse;
        const id = result?.registrationId || result?.id || result?.data?._id;
        if (!id) throw new Error("Registration ID was not returned");
        setRegistrationId(String(id));
        setStep(2);
      } catch (error: unknown) {
        setError(getRequestErrorMessage(error, "Unable to start registration."));
      }
      return;
    }

    // STEP 2
    if (step === 2) {
      if (!name.trim()) {
        setError("Full name is required.");
        return;
      }

      if (!phone.trim()) {
        setError(
          "Phone number is required."
        );
        return;
      }

      setStep(3);
    }
  };

  // BACK
  const goBack = () => {
    setError(null);

    setStep((current) =>
      Math.max(current - 1, 1)
    );
  };

  // FINAL SUBMIT
  const handleSubmit = async () => {
    setError(null);

    if (!password.trim()) {
      setError("Please create a password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      completedChecks <
      passwordChecks.length
    ) {
      setError(
        "Your password should meet all requirements."
      );
      return;
    }

    setIsLoading(true);

    try {
      await completeRegistration({
        id: registrationId,
        data: {
          fullName: name.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
        },
      }).unwrap();

      setSuccess(true);

      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1000);

    } catch (err: unknown) {
      setError(getRequestErrorMessage(err, "Something went wrong."));

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* LOGO */}
      <div className="text-center">
        <Image
          src="/Group1.png"
          alt="Bandhan Events Hub"
          width={433}
          height={96}
          className="mx-auto mb-4 h-14 w-60 rounded-lg bg-[#2A1C16] object-contain px-3 py-1.5"
        />
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">

          <h2 className="text-center text-lg font-semibold text-[#3A2E24]">
            {steps[0].title}
          </h2>

          <p className="text-center text-[10px] text-[#6B625A]">
            {steps[0].description}
          </p>

          <Button
            variant="custom"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DDD6CD] bg-white py-3 text-sm font-medium text-[#1F2937] hover:bg-[#F8F4EF] transition"
          >
            <FcGoogle size={20} />
            Sign up with Google
          </Button>

          <Button
            variant="custom"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DDD6CD] bg-white py-3 text-sm font-medium text-[#1F2937] hover:bg-[#F8F4EF] transition"
          >
            <FaFacebook
              size={20}
              className="text-blue-600"
            />
            Sign up with Facebook
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-[#DDD6CD]" />

            <span className="text-xs text-gray-500 font-medium">
              Or
            </span>

            <div className="flex-1 border-t border-[#DDD6CD]" />
          </div>

          <Input
            value={email}
            onChange={(
              e: ChangeEvent<HTMLInputElement>
            ) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            className="mt-1 py-3"
          />

          <select
            value={role}
            onChange={(event) => setRole(event.target.value as "buyer" | "seller")}
            className="w-full rounded-lg border border-[#DDD6CD] bg-white px-3 py-2.5 text-sm text-[#3A2E24]"
            aria-label="Account type"
          >
            <option value="buyer">Customer — shop, book services and venues</option>
            <option value="seller">Seller — list products, services and venues</option>
          </select>

          {error && (
            <p className="text-sm text-red-600 font-medium">
              {error}
            </p>
          )}

          <Button
            onClick={goNext}
            className="w-full rounded-lg bg-[#7A3F23] py-3 text-sm font-semibold text-white hover:bg-[#6d2d09] transition"
          >
            Get started
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}

            <span
              className="cursor-pointer font-semibold text-[#7A3F23] hover:underline"
              onClick={() =>
                router.push("/login")
              }
            >
              Sign in
            </span>
          </p>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">

          <div
            className="w-14 h-14 rounded-full border border-[#E4E5E7A] 
             bg-gradient-to-r from-[#E4E5E77A] via-white to-[#E4E5E77A]/0 
          flex items-center justify-center mx-auto shadow-sm"
          >
            <div className="w-8 h-8 rounded-full border border-[#E2E4E9] bg-white flex items-center justify-center shadow-sm">
              <MdPerson
                size={16}
                className="text-white bg-[#525866] p-[3px]"
              />
            </div>
          </div>

          <h2 className="text-center text-lg font-semibold text-[#3A2E24]">
            {steps[1].title}
          </h2>

          <p className="text-center text-sm text-[#6B625A]">
            {steps[1].description}
          </p>

          <div>
            <label className="text-sm font-semibold text-[#3A2E24]">
              Full name *
            </label>

            <Input
              value={name}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) => setName(e.target.value)}
              placeholder="Name"
              type="text"
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#3A2E24]">
              Phone Number *
            </label>

            <div className="mt-2 flex gap-2">
              <select className="rounded-lg border border-[#DDD6CD] bg-white px-3 py-2 text-sm font-medium text-[#3A2E24]">
                <option value="+91">
                  🇮🇳 +91
                </option>
              </select>

              <Input
                value={phone}
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) =>
                  setPhone(e.target.value)
                }
                placeholder="12345 67890"
                type="tel"
                className="flex-1"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={goBack}
              variant="outline"
              className="w-full"
            >
              Back
            </Button>

            <Button
              onClick={goNext}
              className="w-full rounded-lg bg-[#7A3F23] py-3 text-sm font-semibold text-white hover:bg-[#6d2d09] transition"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="mx-auto w-full max-w-[420px]">

          <div className="mb-6 flex justify-center">
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#EAECF0]"
              style={{
                background:
                  "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
              }}
            >
              <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#EAECF0] bg-white shadow-sm">
                <MdLock
                  size={20}
                  className="text-[#667085]"
                />
              </div>
            </div>
          </div>

          <div className="mb-4 text-center">
            <h2 className="text-[32px] font-semibold leading-[38px] text-[#181D27]">
              Password Setup
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              Set up a secure password to protect your account.
            </p>
          </div>

          <div className="space-y-5">

            {/* PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#344054]">
                Create a Password *
              </label>

              <div className="relative">

                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <MdLock
                    size={18}
                    className="text-[#98A2B3]"
                  />
                </div>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(
                    e: ChangeEvent<HTMLInputElement>
                  ) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="h-[52px] w-full rounded-xl border border-[#D0D5DD] bg-white pl-11 pr-11 text-sm text-[#101828] shadow-sm outline-none transition-all duration-200 placeholder:text-[#98A2B3] focus:border-[#7A3F23]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#344054]">
                Confirm Password *
              </label>

              <div className="relative">

                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <MdLock
                    size={18}
                    className="text-[#98A2B3]"
                  />
                </div>

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(
                    e: ChangeEvent<HTMLInputElement>
                  ) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  className="h-[52px] w-full rounded-xl border border-[#D0D5DD] bg-white pl-11 pr-11 text-sm text-[#101828] shadow-sm outline-none transition-all duration-200 placeholder:text-[#98A2B3] focus:border-[#7A3F23]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* RULES */}
            <div className="pt-1">

              <p className="mb-3 text-xs font-medium text-[#D92D20]">
                Weak password. Must contain at least;
              </p>

              <div className="mb-4 h-[3px] w-full overflow-hidden rounded-full bg-[#EAECF0]">
                <div
                  className="h-full rounded-full bg-[#7A3F23] transition-all duration-300"
                  style={{
                    width: `${
                      (completedChecks /
                        passwordChecks.length) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="space-y-2.5">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px]
                      ${
                        check.valid
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-[#D0D5DD] bg-white text-[#98A2B3]"
                      }`}
                    >
                      ✓
                    </div>

                    <span
                      className={`text-sm ${
                        check.valid
                          ? "text-[#344054]"
                          : "text-[#667085]"
                      }`}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            {/* SUCCESS */}
            {success && (
              <p className="text-sm font-medium text-green-600">
                ✓ Registration successful!
              </p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading || isRegistering || isCompletingRegistration || success}
              className="mt-6 h-[52px] w-full rounded-xl bg-[#8B4A2B] text-sm font-semibold text-white transition-all hover:bg-[#72371C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading || isRegistering || isCompletingRegistration
                ? "Saving..."
                : success
                ? "Done"
                : "Continue"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
