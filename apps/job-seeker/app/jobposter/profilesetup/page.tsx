"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Bell, HelpCircle, User, CheckCircle2, Circle } from "lucide-react";
import { useCompleteDigiLockerDemoMutation, useGetCatalogOptionsQuery, useGetCompanyProfileQuery, useSaveCompanyProfileMutation } from "../redux/services/RecruiterProfileApi";

export default function CompanyInfoPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyTagline, setCompanyTagline] = useState("");
  const [description, setDescription] = useState("");
  const [headquartersAddress, setHeadquartersAddress] = useState("");
  const [additionalLocations, setAdditionalLocations] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const router = useRouter();
  const { data, isLoading } = useGetCompanyProfileQuery();
  const { data: catalogOptions } = useGetCatalogOptionsQuery();
  const [saveCompanyProfile, { isLoading: saveLoading }] = useSaveCompanyProfileMutation();
  const [completeDigiLockerDemo, { isLoading: verifyingIdentity }] = useCompleteDigiLockerDemoMutation();

  const hasCompanyInfo = useMemo(
    () => Boolean(companyName && industry && companySize && websiteUrl),
    [companyName, industry, companySize, websiteUrl]
  );
  const hasBrandIdentity = useMemo(
    () => Boolean(logo || companyTagline || description),
    [logo, companyTagline, description]
  );
  const hasLocationDetails = useMemo(
    () => Boolean(headquartersAddress || additionalLocations),
    [headquartersAddress, additionalLocations]
  );

  const progressSteps = [
    { label: "Account Created", done: true },
    { label: "Company Info", done: hasCompanyInfo, active: !hasCompanyInfo },
    { label: "Brand Identity", done: hasBrandIdentity, active: hasCompanyInfo && !hasBrandIdentity },
    { label: "Location Details", done: hasLocationDetails, active: hasCompanyInfo && hasBrandIdentity && !hasLocationDetails },
  ];

  const activeStep = hasCompanyInfo ? (hasBrandIdentity ? 3 : 2) : 1;

  useEffect(() => {
    if (data?.data) {
      setCompanyName(data.data.companyName || "");
      setIndustry(data.data.industry || "");
      setCompanySize(data.data.companySize || "");
      setWebsiteUrl(data.data.websiteUrl || "");
      setCompanyTagline(data.data.companyTagline || "");
      setDescription(data.data.description || "");
      setHeadquartersAddress(data.data.headquartersAddress || "");
      setAdditionalLocations((data.data.additionalLocations || []).join(", "));
    }
  }, [data]);

  const getErrorMessage = (err: unknown) => {
    if (typeof err === "object" && err !== null) {
      const errorPayload = err as {
        data?: { message?: string; error?: string };
        message?: string;
      };
      if (typeof errorPayload.data?.message === "string") {
        return errorPayload.data.message;
      }
      if (typeof errorPayload.data?.error === "string") {
        return errorPayload.data.error;
      }
      if (typeof errorPayload.message === "string") {
        return errorPayload.message;
      }
    }

    return "Unable to connect to server. Check the API URL and network.";
  };

  const handleContinue = async () => {
    try {
      setError("");
      setInfo("Saving your company profile...");
      await saveCompanyProfile({
        companyName,
        industry,
        companySize,
        websiteUrl,
        companyTagline,
        description,
        headquartersAddress,
        additionalLocations,
        companyLogo: logoFile,
      }).unwrap();
      setInfo("Company profile saved successfully.");
      router.push("/jobposter/dashboard");
    } catch (err) {
      setInfo("");
      setError(getErrorMessage(err));
    }
  };

  const handleSaveDraft = async () => {
    try {
      setError("");
      setInfo("Saving your company profile...");
      await saveCompanyProfile({
        companyName,
        industry,
        companySize,
        websiteUrl,
        companyTagline,
        description,
        headquartersAddress,
        additionalLocations,
        companyLogo: logoFile,
      }).unwrap();
      setInfo("Company profile saved successfully.");
      router.push("/jobposter/dashboard");
    } catch (err) {
      setInfo("");
      setError(getErrorMessage(err));
    }
  };

  const handleDigiLockerDemo = async () => {
    try {
      setVerificationError("");
      await completeDigiLockerDemo().unwrap();
      setShowVerificationSuccess(true);
    } catch (err) {
      setVerificationError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#F4ECE6] dark:bg-[#1a1a1a] text-[#3E2F2B] dark:text-[#ededed]">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-white dark:bg-[#171717]">
        <h1 className="font-semibold text-lg text-[#5E2D18] dark:text-[#c9a882]">
          Bandhan Careers
        </h1>

        <div className="flex items-center gap-4 text-gray-500">
          <HelpCircle size={18} />
          <Bell size={18} />
          <User size={18} />
        </div>

        <div className="rounded-2xl border border-[#E9DED4] bg-white p-5 dark:border-[#374151] dark:bg-[#171717]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold text-[#5E2D18] dark:text-[#c9a882]">Identity verification</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Complete the DigiLocker verification step before publishing jobs.</p></div>
            <button onClick={handleDigiLockerDemo} disabled={verifyingIdentity} className="rounded-xl bg-[#6B3E2E] px-4 py-2 text-sm text-white disabled:opacity-60">{verifyingIdentity ? "Verifying..." : "Connect DigiLocker"}</button>
          </div>
          {verificationError && <p role="alert" className="mt-3 text-sm text-red-700">{verificationError}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        <div className="rounded-2xl border border-[#E9DED4] dark:border-[#374151] bg-white dark:bg-[#171717] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                STEP {activeStep} OF 3
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {hasCompanyInfo
                  ? "Good progress — your company information is being captured."
                  : "Start with your company basics to unlock the next step."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {progressSteps.map((step) => (
                <div key={step.label} className="flex items-center gap-2 rounded-full bg-[#F8F1EA] dark:bg-[#2a2018] px-3 py-2 text-sm">
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className={`h-4 w-4 ${step.active ? "text-[#6B3E2E]" : "text-gray-300"}`} />
                  )}
                  <span className={step.done ? "font-medium text-[#2F4F3F]" : step.active ? "font-medium text-[#6B3E2E]" : "text-gray-500"}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* LEFT */}
          <div className="space-y-6">

            {/* BASIC INFO */}
            <Card title="Company Information" subtitle="Add your core company details so candidates can discover you clearly.">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  placeholder="e.g EcoSphere Tech"
                  value={companyName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                />
                <Select
                  label="Industry"
                  value={industry}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIndustry(e.target.value)}
                  options={catalogOptions?.data?.jobIndustries || []}
                />
                <Select
                  label="Company Size"
                  value={companySize}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompanySize(e.target.value)}
                  options={catalogOptions?.data?.companySizes || []}
                />
                <Input
                  label="Website URL"
                  placeholder="https://www.example.com"
                  value={websiteUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebsiteUrl(e.target.value)}
                />
              </div>
            </Card>

            {/* BRAND */}
            <Card title="Brand Identity" subtitle="Showcase your brand with a logo and a short tagline.">
              <div className="grid md:grid-cols-[120px_1fr] gap-4">

                {/* LOGO */}
                <div>
                  <p className="text-sm mb-2">Company Logo</p>
                  <label className="w-28 h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-[#FAF6F2]">
                    {logo ? (
                      <img src={logo} className="h-12" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-xs text-gray-400 mt-1">
                          Upload
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (!file) return;

                        setLogoFile(file);
                        setLogo(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>

                {/* TAGLINE */}
                <div>
                  <Input
                    label="Company Tagline"
                    placeholder="e.g. Innovating for a greener tomorrow"
                    value={companyTagline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyTagline(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    A short, memorable hook for your company
                  </p>
                </div>
              </div>
            </Card>

            {/* DESCRIPTION */}
            <Card title="Company Description" subtitle="Tell candidates what makes your company special.">
              <textarea
                className="w-full border rounded-xl p-3 text-sm bg-[#FAF6F2]"
                rows={5}
                placeholder="Tell candidates about your company..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">0 / 2000 Characters</p>
            </Card>

            {/* LOCATION */}
            <Card title="Location Details" subtitle="Add your headquarters and any other office locations.">
              <input
                placeholder="Search for address..."
                className="w-full border rounded-xl p-3 text-sm bg-[#FAF6F2]"
                value={headquartersAddress}
                onChange={(e) => setHeadquartersAddress(e.target.value)}
              />

              <input
                placeholder="Additional locations (comma separated)"
                className="w-full mt-2 border rounded-xl p-3 text-sm bg-[#FAF6F2]"
                value={additionalLocations}
                onChange={(e) => setAdditionalLocations(e.target.value)}
              />

              {/* MAP */}
              <div className="mt-4 overflow-hidden rounded-xl border border-[#E9DED4]">
                <iframe
                  title="Headquarters Map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(headquartersAddress || "Indore, India")}&output=embed`}
                  className="h-[220px] w-full rounded-xl"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Card>

            {/* FOOT ACTION */}
            <div className="flex flex-col gap-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {info && <p className="text-sm text-green-600">{info}</p>}
              {isLoading && <p className="text-sm text-gray-500">Loading profile...</p>}
            </div>

            <div className="hidden md:flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.push("/jobposter/dashboard")}
                className="group inline-flex items-center gap-2 rounded-full bg-[#F8F1EA] px-5 py-2.5 text-sm font-semibold text-[#6B3E2E] transition-all duration-300 hover:bg-[#6B3E2E] hover:text-white cursor-pointer"
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                Back to Dashboard
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saveLoading}
                  className="border px-4 py-2 rounded-xl text-sm disabled:opacity-60"
                >
                  {saveLoading ? "Please wait..." : "Save as Draft"}
                </button>
                <button
                  onClick={handleContinue}
                  disabled={saveLoading}
                  className="bg-[#6B3E2E] text-white px-4 py-2 rounded-xl text-sm disabled:opacity-60"
                >
                  {saveLoading ? "Please wait..." : "Save & Continue →"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* PREVIEW */}
            <Card title="Live Preview" subtitle="This updates as you type.">
              <div className="border rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {logo ? <img src={logo} alt="company logo" className="h-full w-full object-cover" /> : "Logo"}
                  </div>
                  <div>
                    <p className="font-medium">{companyName || "Company Name"}</p>
                    <p className="text-sm text-gray-500">{companyTagline || "Add a short tagline"}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {description || "Add a short description to build trust with candidates."}
                </p>
              </div>
            </Card>

            {/* TIPS */}
            <Card>
              <p className="font-medium text-sm mb-2">Trust-Building Tips</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Companies with high-quality logos receive 40% more applications</li>
                <li>• Authentic culture descriptions build trust</li>
              </ul>
            </Card>

            {/* PROGRESS */}
            <Card title="Setup Progress" subtitle="Each section turns green as you complete it.">
              {progressSteps.map((step) => (
                <ProgressItem
                  key={step.label}
                  label={step.label}
                  done={step.done}
                  active={step.active}
                />
              ))}
            </Card>
          </div>
        </div>
      </div>
      {/* MOBILE ACTIONS: fixed to bottom on small screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/jobposter/dashboard")}
            className="inline-flex items-center gap-2 rounded-full bg-[#F8F1EA] px-4 py-2 text-sm font-semibold text-[#6B3E2E]"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saveLoading}
              className="border px-3 py-2 rounded-xl text-sm disabled:opacity-60 bg-white"
            >
              {saveLoading ? "Please wait..." : "Save as Draft"}
            </button>
            <button
              onClick={handleContinue}
              disabled={saveLoading}
              className="bg-[#6B3E2E] text-white px-3 py-2 rounded-xl text-sm disabled:opacity-60"
            >
              {saveLoading ? "Please wait..." : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>
      {showVerificationSuccess && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="jobposter-verification-title"><div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl"><CheckCircle2 className="mx-auto h-12 w-12 text-green-600" /><h2 id="jobposter-verification-title" className="mt-3 text-xl font-semibold text-[#3E2F2B]">Verification recorded</h2><p className="mt-2 text-sm text-gray-600">Your demo verification was saved. It is not government identity proof until a real DigiLocker provider is connected.</p><button onClick={() => setShowVerificationSuccess(false)} className="mt-5 w-full rounded-xl bg-[#6B3E2E] py-3 text-white">Continue</button></div></div>}
    </div>
  );
}

function Card({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E9DED4] p-4 space-y-4">
      {(title || subtitle) && (
        <div>
          {title && <h2 className="text-lg font-semibold text-[#5E2D18]">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function Input({ label, placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full mt-2 border rounded-xl p-3 text-sm bg-[#FAF6F2]"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full mt-2 border rounded-xl p-3 text-sm bg-[#FAF6F2] text-gray-500"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProgressItem({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <Circle className={`h-4 w-4 ${active ? "text-[#6B3E2E]" : "text-gray-300"}`} />
      )}
      <span className={done ? "font-medium text-[#2F4F3F]" : active ? "font-medium text-[#6B3E2E]" : "text-gray-500"}>
        {label}
      </span>
    </div>
  );
}
