"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Field, Input, Select } from "@bandhan/ui";
import { SkillsInput } from "@/components/ui/SkillsInput";
import { CareersHeader } from "@/components/CareersHeader";
import { Stepper } from "@/components/ui/Stepper";
import { Footer } from "@/components/ui/Footer";
import { saveProfileWithFallback, useGetProfileQuery } from "../redux/services/ProfileApi";

interface FormDataType {
  fullName: string;
  location: string;
  phoneNumber: string;
  jobTitle: string;
  experienceLevel: string;
  degree: string;
  college: string;
  graduationYear: string;
  profileImage: string | null;
  skills: string[];
  jobTypes: string[];
  salaryExpectation: string;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = useGetProfileQuery();

  const [formData, setFormData] = useState<FormDataType>({
    fullName: "",
    location: "",
    phoneNumber: "",
    jobTitle: "",
    experienceLevel: "Fresher",
    degree: "",
    college: "",
    graduationYear: "",
    profileImage: null,
    skills: [],
    jobTypes: ["full"],
    salaryExpectation: "",
  });

  useEffect(() => {
    if (!profileData?.data) return;

    setFormData((prev) => ({
      ...prev,
      fullName: profileData.data?.fullName || prev.fullName,
      location: profileData.data?.location || prev.location,
      phoneNumber: profileData.data?.phone || prev.phoneNumber,
      jobTitle: profileData.data?.currentRole || prev.jobTitle,
      experienceLevel: profileData.data?.experienceLevel || prev.experienceLevel,
      degree: profileData.data?.degree || prev.degree,
      college: profileData.data?.college || prev.college,
      graduationYear: profileData.data?.graduationYear ? String(profileData.data.graduationYear) : prev.graduationYear,
      skills: Array.isArray(profileData.data?.skills) && profileData.data.skills.length > 0 ? profileData.data.skills : prev.skills,
      jobTypes: Array.isArray(profileData.data?.jobType) && profileData.data.jobType.length > 0 ? profileData.data.jobType : prev.jobTypes,
      salaryExpectation: profileData.data?.salaryExpectation || prev.salaryExpectation,
      profileImage: prev.profileImage,
    }));
  }, [profileData]);

  const handleInputChange = (field: keyof FormDataType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof FormDataType, value: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null, imageUrl: string | null) => {
    setProfileFile(file);
    setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
  };

  const handleSalaryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, salaryExpectation: value }));
  };

  const handleSaveAndContinue = async () => {
    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append("fullName", formData.fullName || "");
      fd.append("location", formData.location || "");
      fd.append("phone", formData.phoneNumber || "");
      fd.append("currentRole", formData.jobTitle || "");
      fd.append("experienceLevel", formData.experienceLevel || "Fresher");
      fd.append("degree", formData.degree || "");
      fd.append("college", formData.college || "");
      fd.append("graduationYear", String(formData.graduationYear || ""));
      fd.append("salaryExpectation", formData.salaryExpectation || "");

      fd.append("skills", JSON.stringify(formData.skills || []));
      fd.append("jobType", JSON.stringify(formData.jobTypes || []));

      if (profileFile) {
        fd.append("profilePhoto", profileFile);
      }

      await saveProfileWithFallback(fd);
      router.push("/Jobseeker/resume");
    } catch (error: unknown) {
      console.error("Profile update failed", error);
      const message = error instanceof Error ? error.message : "Unable to save profile. Please try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Profile submit is handled via ProfileApi.updateProfile mutation.

  return (
    <div className="min-h-screen bg-[#F6F1EB] text-brown-950">
      <CareersHeader stepLabel="Step 1 of 2" />

      <div className="border-b border-[#E8DED6] bg-[#F6F1EB]">
        <Stepper currentStep={1} />
      </div>

      <div className="mx-auto max-w-295 px-4 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <form className="space-y-8">
            {isProfileLoading && (
              <div className="bhn-alert bhn-alert-brand text-sm">Loading your saved profile...</div>
            )}
            {isProfileError && (
              <div className="bhn-alert bhn-alert-warning text-sm">Unable to load saved profile. You can still continue editing.</div>
            )}
            <Card>
              <CardHeader title="Personal Foundation" />
              <CardBody className="space-y-6">
                <Field label="Full Name">
                  <Input
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Location">
                    <Input
                      placeholder="Search City..."
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone Number">
                    <Input
                      placeholder="+91 00000 00000"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[2px] text-[#8A7A72] font-medium">
                    Profile Image
                  </p>
                  <label className="flex items-center gap-3 rounded-2xl border border-[#D8C5B8] bg-white px-4 py-3 cursor-pointer text-sm text-[#6F625B] hover:border-[#8A4A2F]">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3E4D8] text-[#7A3E2B] overflow-hidden">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl">📷</span>
                      )}
                    </span>
                    <div className="text-left">
                      <p className="font-medium text-[#2D201B]">
                        {formData.profileImage ? "Change image" : "Upload profile image"}
                      </p>
                      <p className="text-xs text-[#8A7A72]">
                        JPG, PNG, GIF up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (!file) return;
                        handleImageChange(file, URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Professional Profile" />
              <CardBody className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Current Role">
                    <Input
                      placeholder="e.g. Product Designer"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Experience Level">
                    <Select
                      value={formData.experienceLevel}
                      onChange={(e) => handleInputChange("experienceLevel", e.target.value)}
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="0-1 Years">0-1 Years</option>
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="3-5 Years">3-5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </Select>
                  </Field>
                </div>

                <SkillsInput
                  label="Key Skills"
                  placeholder="Add more..."
                  skills={formData.skills}
                  onSkillsChange={(val) => handleArrayChange("skills", val)}
                  suggestedSkills={["UI/UX", "Figma", "React"]}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Education" />
              <CardBody className="space-y-6">
                <Field label="College / University">
                  <Input
                    placeholder="e.g. Indian Institute of Technology"
                    value={formData.college}
                    onChange={(e) => handleInputChange("college", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Degree">
                    <Input
                      placeholder="e.g. B.Des Visual Communication"
                      value={formData.degree}
                      onChange={(e) => handleInputChange("degree", e.target.value)}
                    />
                  </Field>
                  <Field label="Graduation Year">
                    <Select
                      value={formData.graduationYear}
                      onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </Select>
                  </Field>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Career Aspirations" />
              <CardBody className="space-y-8">
                {/* Job Type + Salary */}
                <div className="grid md:grid-cols-2 gap-12">

                  {/* Job Type */}
                  <div>
                    <p className="text-[11px] uppercase tracking-[2px] text-[#8A7A72] font-medium mb-4">
                      Job Type
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {[
                        { value: "full", label: "Full-time" },
                        { value: "remote", label: "Remote" },
                        { value: "contract", label: "Contract" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            const isChecked = formData.jobTypes.includes(item.value);
                            if (isChecked) {
                              handleArrayChange(
                                "jobTypes",
                                formData.jobTypes.filter((x) => x !== item.value)
                              );
                            } else {
                              handleArrayChange("jobTypes", [
                                ...formData.jobTypes,
                                item.value,
                              ]);
                            }
                          }}
                          className={["bhn-chip", formData.jobTypes.includes(item.value) ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Salary */}
                  <div>
                    <p className="text-[11px] uppercase tracking-[2px] text-[#8A7A72] font-medium mb-4">
                      Salary Expectation (Annual)
                    </p>

                    <div className="rounded-2xl border border-[#D8C5B8] bg-white px-4 py-3">
                      <label className="mb-2 block text-[12px] uppercase tracking-[2px] text-[#8A7A72]">
                        Annual Salary (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100000"
                        placeholder="e.g. 1200000"
                        value={formData.salaryExpectation}
                        onChange={(e) => handleSalaryChange(e.target.value)}
                        className="bhn-input"
                      />
                    </div>
                  </div>

                </div>

              </CardBody>
            </Card>

          </form>

          <aside className="w-full xl:max-w-[340px]">

            <div className="overflow-hidden rounded-[26px] border border-[#E8DDD5] bg-white shadow-sm">

              {/* Top Background */}
              <div className="relative h-[105px] bg-[#F3E4D8]">

                <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">

                <div className="h-[84px] w-[84px] rounded-full border-4 border-white bg-[#141414] shadow-lg flex items-center justify-center overflow-hidden">
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-[58px] w-[58px] rounded-full border border-[#2E2E2E] bg-[#F4E8DE]" />
                      )}
                  </div>

                </div>

              </div>

              {/* Preview */}
              <div className="pt-14 pb-8 px-6 text-center">

                <h3 className="font-serif text-[32px] font-semibold text-[#2D201B]">
                   {formData.fullName ? ` ${formData.fullName}` : ""}
                </h3>

                <p className="mt-2 text-[18px] text-[#6F625C]">
                  {formData.jobTitle || ""}
                </p>

                {/* dots */}
                <div className="flex justify-center gap-2 mt-5">
                  <span className="w-2 h-2 rounded-full bg-[#C79D7A]" />
                  <span className="w-2 h-2 rounded-full bg-[#C79D7A]" />
                  <span className="w-2 h-2 rounded-full bg-[#C79D7A]" />
                </div>

                {/* Skeleton */}
                <div className="mt-4 space-y-4">

                  <div className="h-[8px] rounded-full bg-[#E8DDD5] w-full" />

                  <div className="h-[8px] rounded-full bg-[#E8DDD5] w-[82%] mx-auto" />

                  <div className="h-[8px] rounded-full bg-[#E8DDD5] w-[66%] mx-auto" />

                </div>

              </div>

            </div>

            {/* Pro Tip */}

            <div className="mt-5 rounded-[22px] border border-[#E8DDD5] bg-[#F7EEE7] p-5">

              <div className="flex gap-4">

                <div className="h-10 w-10 rounded-full bg-[#F3E4D8] flex items-center justify-center">

                  💡

                </div>

                <div>

                  <h4 className="text-[22px] font-semibold text-[#2D201B]">
                    Pro Tip
                  </h4>

                  <p className="mt-2 text-[15px] leading-7 text-[#6E615A]">

                    Complete profiles are
                    <span className="font-semibold text-[#8A4A2F]">
                      {" "}3x more likely
                    </span>
                    {" "}to get direct recruiter callbacks.
                    Add specific skills to stand out.

                  </p>

                </div>

              </div>

            </div>

            {/* Bottom Text */}

            <p className="mt-4 text-center text-[13px] leading-5 text-[#A79A93] px-5">

              "Your data is secure and encrypted with Bandhan Career protocols."

            </p>

          </aside>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/Jobseeker/resume")}
            className="w-full sm:w-auto rounded-xl border border-[#D8C5B8] bg-white px-5 py-3 text-xs uppercase tracking-[0.32em] text-[#7A3E2B] shadow-sm transition-all duration-300 hover:bg-[#7A3E2B] hover:text-white hover:border-[#7A3E2B] hover:shadow-lg active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
              Skip for Now
            </span>
          </button>

          <Button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={isLoading}
            loading={isLoading}
            className="w-full sm:w-auto min-w-full sm:min-w-[220px] h-12 rounded-xl font-medium shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer"
          >
            {isLoading ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}