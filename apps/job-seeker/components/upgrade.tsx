"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Eye, Zap, BadgeCheck } from "lucide-react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";


type OrderData = {
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  receipt?: string;
};

function PromoteJobPageContent() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"idle" | "creating" | "verifying" | "done">("idle");
  const [createdOrder, setCreatedOrder] = useState<OrderData | null>(null);

  // Local data + loading states (replacing RTK hooks)
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState<boolean>(false);
  const [plansError, setPlansError] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_NGROK_API || "https://bandhan-api.vercel.app/api")?.replace(/\/$/, "") ?? "";
  const apiBase = `${baseUrl}/job-profile`;
  const rtkBaseQuery = useMemo(
    () =>
      fetchBaseQuery({
        baseUrl: apiBase,
      }),
    [apiBase],
  );

  function buildHeaders(useJson = false) {
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "true",
    };
    if (useJson) headers["Content-Type"] = "application/json";

    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  function normalizePlan(p: any) {
    if (!p) return p;
    return {
      ...p,
      name: p.planName ?? p.name,
      id: p._id ?? p.id,
    };
  }

  async function callJobProfileApi(path: string, method: "GET" | "POST", body?: unknown) {
    const result = await rtkBaseQuery(
      {
        url: path,
        method,
        credentials: "include",
        headers: buildHeaders(method !== "GET"),
        body,
      },
      {
        dispatch: () => undefined,
        getState: () => ({}),
      } as never,
      {},
    );

    if ("error" in result && result.error) {
      const status = Number(result.error.status || 0);
      const data = result.error.data;
      const message =
        typeof data === "string"
          ? data
          : typeof data === "object" && data && "message" in data
            ? String((data as { message?: unknown }).message || "")
            : "";
      throw new Error(message || `Request failed with status ${status}`);
    }

    return result.data as { success?: boolean; message?: string; data?: any };
  }

  async function fetchPlans() {
    setPlansLoading(true);
    setPlansError(false);
    try {
      const json = await callJobProfileApi("/plans", "GET");
      if (json.success) {
        const raw = json.data || [];
        setPlans(raw.map((p: any) => normalizePlan(p)));
      } else {
        setPlans([]);
        setPlansError(true);
        setStatusMessage(json.message || "Could not load plans.");
      }
    } catch (err: any) {
      setPlans([]);
      setPlansError(true);
      setStatusMessage(err?.message || "Could not load plans.");
    } finally {
      setPlansLoading(false);
    }
  }

  async function fetchCurrentPlan() {
    try {
      const json = await callJobProfileApi("/current-plan", "GET");
      if (json.success) setCurrentPlan(normalizePlan(json.data ?? null));
      else setCurrentPlan(null);
    } catch (err) {
      console.error("Unable to fetch current plan:", err);
      setCurrentPlan(null);
    }
  }

  async function createOrderAPI(payload: any) {
    setIsCreatingOrder(true);
    try {
      const json = await callJobProfileApi("/create-order", "POST", payload);
      if (json.success) return json;
      throw new Error(json.message || "Could not create order");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  async function verifyPaymentAPI(body: any) {
    setIsVerifyingPayment(true);
    try {
      const json = await callJobProfileApi("/verify-payment", "POST", body);
      if (json.success) return json;
      throw new Error(json.message || "Verification failed");
    } finally {
      setIsVerifyingPayment(false);
    }
  }
  const selectedPlanDetails = useMemo(() => plans.find((plan) => plan.name === selectedPlan) ?? null, [plans, selectedPlan]);

  const planTableRows = useMemo(
    () => [
      {
        label: "Price",
        values: plans.map((plan) => (plan.price === 0 ? "Free" : `₹${plan.price}`)),
      },
      {
        label: "Duration",
        values: plans.map((plan) => `${plan.duration} days`),
      },
      {
        label: "Description",
        values: plans.map((plan) => plan.description ?? "—"),
      },
      {
        label: "Features",
        values: plans.map((plan) => plan.features ?? []),
      },
    ],
    [plans]
  );

  // Do not auto-select a plan. Require the user to explicitly click a plan
  // to avoid accidental selection of the first plan.

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlanSelect = async (planName: string) => {
    setStatusMessage(null);
    // Toggle selection: if the same plan is clicked again, unselect it
    if (selectedPlan === planName) {
      setSelectedPlan("");
      setCreatedOrder(null);
      setPaymentStep("idle");
      return;
    }

    setSelectedPlan(planName);
    setCreatedOrder(null);
    setPaymentStep("idle");

    // Refresh current plan info after a user selects a plan
    try {
      await fetchCurrentPlan();
    } catch (err) {
      console.error("Unable to refresh current plan:", err);
      setStatusMessage("Unable to refresh the current plan details right now.");
    }
  };

  const activateSubscription = async (order: OrderData, paymentId: string, signature: string) => {
    if (!order.orderId || !paymentId || !signature) return;

    try {
      setPaymentStep("verifying");
      setStatusMessage(null);
      const verifyRes = await verifyPaymentAPI({
        orderId: order.orderId,
        paymentId,
        signature,
        razorpay_order_id: order.orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });

      if (verifyRes?.success) {
        setPaymentStep("done");
        await fetchCurrentPlan();
        router.replace("/jobposter/dashboard?subscription=success");
        return;
      }
      setPaymentStep("idle");
      setStatusMessage(verifyRes?.message || "Payment verification failed.");
    } catch (error: any) {
      setPaymentStep("idle");
      setStatusMessage(error?.message || "Your payment could not be verified. Please contact support with your order ID.");
    }
  };

  const handleCreateOrder = async () => {
    const plan = selectedPlanDetails;
    if (!plan) {
      setStatusMessage("Please select a plan before continuing.");
      return;
    }

    if (plan.price === 0) {
      setStatusMessage("You are already using the Free plan.");
      router.replace("/jobposter/dashboard");
      return;
    }

    try {
      setPaymentStep("creating");
      setStatusMessage(null);
      const payload = {
        paymentFor: "plan",
        planName: plan.name,
        amount: plan.price,
      };

      const orderRes = await createOrderAPI(payload);
      const data = orderRes?.data;
      const normalizedOrder = {
        ...data,
        orderId: data.orderId ?? data.order_id ?? data.id,
        amount: data.amount ?? data.totalAmount ?? data.paymentAmount,
        currency: data.currency ?? data.currency_code ?? "INR",
      };

      if (normalizedOrder.orderId) {
        setCreatedOrder(normalizedOrder);
        setPaymentStep("creating");

        try {
          const rzpKey = normalizedOrder.razorpayKey || (window as any).RAZORPAY_KEY || process.env.NEXT_PUBLIC_RAZORPAY_KEY || "";
          if (!rzpKey) throw new Error("Payments are not configured yet. Please try again later.");
          const options: any = {
            key: rzpKey,
            // Razorpay orders already express the amount in paise.
            amount: normalizedOrder.amount || 0,
            currency: normalizedOrder.currency || "INR",
            name: "Bandhan Career",
            description: `Upgrade: ${plan.name}`,
            order_id: normalizedOrder.orderId,
            handler: function (response: any) {
              void activateSubscription(
                normalizedOrder,
                response.razorpay_payment_id,
                response.razorpay_signature,
              );
            },
            modal: {
              ondismiss: () => {
                setPaymentStep("idle");
                setStatusMessage("Payment was cancelled. Your selected plan has not changed.");
              },
            },
          };

          if (!(window as any).Razorpay) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://checkout.razorpay.com/v1/checkout.js";
              script.async = true;
              script.onload = () => resolve();
              script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
              document.body.appendChild(script);
            });
          }

          const rz = new (window as any).Razorpay(options);
          rz.open();
          setStatusMessage("Complete the secure Razorpay checkout to activate your plan.");
        } catch (err: any) {
          setPaymentStep("idle");
          setStatusMessage(err?.message || "Payment checkout could not be opened. Please try again.");
        }
      } else {
        setPaymentStep("idle");
        setStatusMessage(orderRes?.message || "Could not create order.");
      }
    } catch (error: any) {
      setPaymentStep("idle");
      setStatusMessage(error?.message || "Could not create order right now.");
    }
  };

  return (
    <div className="bg-[#F4ECE6] min-h-screen flex flex-col">

      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 pb-28">
        <div>
          <h1 className="text-2xl font-semibold text-[#3E2F2B]">Boost Your Job Visibility</h1>
          <p className="text-sm text-[#7C6A64] mt-1 max-w-xl">
            Get more qualified applicants by promoting your job to the right talent across our entire network.
          </p>
        </div>

        {statusMessage ? (
          <div className="rounded-xl border border-[#E6DAD2] bg-white px-4 py-3 text-sm text-[#6B3E2E]">
            {statusMessage}
          </div>
        ) : null}

        <div className="grid md:grid-cols-4 gap-4">
          <Benefit icon={<ArrowUp size={16} />} text="Appear at top" />
          <Benefit icon={<Eye size={16} />} text="3x more visibility" />
          <Benefit icon={<Zap size={16} />} text="Faster response" />
          <Benefit icon={<BadgeCheck size={16} />} text="Highlighted badge" />
        </div>

        {plansLoading ? (
          <div className="rounded-xl border border-[#E6DAD2] bg-white px-4 py-3 text-sm text-[#6B3E2E]">
            Loading promotion plans...
          </div>
        ) : plansError ? (
          <div className="rounded-xl border border-[#E6DAD2] bg-[#FFF3EA] px-4 py-3 text-sm text-[#9A4D1B]">
            We could not load the promotion plans right now. Please try again shortly.
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-6 items-end">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              title={plan.name}
              price={plan.price === 0 ? "Free" : `₹${plan.price}`}
              desc={plan.description}
              features={plan.features ?? []}
              highlight={(plan.name ?? "").toLowerCase().includes("featured")}
              tag={plan.price > 0 ? ((plan.name ?? "").toLowerCase().includes("featured") ? "Most Popular" : "") : "Basic"}
              selected={selectedPlan === plan.name}
              onSelect={() => handlePlanSelect(plan.name)}
              loading={isCreatingOrder && selectedPlan === plan.name}
            />
          ))}
        </div>

        <div className="bg-[#EFE6DE] rounded-xl overflow-hidden">
          {plans.length ? (
            <table className="w-full table-auto text-sm text-[#5C4B46] border-separate border-spacing-0">
              <thead className="bg-[#E7DCD4] text-xs uppercase text-[#9C8A84]">
                <tr>
                  <th className="p-3 text-left">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="p-3 text-left align-top">
                      <div className="text-sm font-semibold text-[#3E2F2B]">{plan.name}</div>
                      <div className="text-[11px] text-[#7C6A64]">{plan.price === 0 ? "Free" : `₹${plan.price}`} • {plan.duration} days</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planTableRows.map((row) => (
                  <tr key={row.label} className="border-t border-[#E2D6CE]">
                    <td className="p-3 font-medium text-[#3E2F2B] align-top">{row.label}</td>
                    {row.values.map((value, cellIndex) => (
                      <td key={cellIndex} className="p-3 align-top text-sm text-[#5C4B46]">
                        {Array.isArray(value) ? (
                          value.length ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {value.map((feature, featureIndex) => (
                                <li key={featureIndex}>{feature}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[#7C6A64]">—</span>
                          )
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-sm text-[#5C4B46]">No plans available right now.</div>
          )}
        </div>

        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-[#7C6A64] cursor-pointer" onClick={() => alert('Skipped')}>Skip for now</span>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm text-[#3E2F2B]">
              {selectedPlanDetails ? `${selectedPlanDetails.name} Plan Selected — ${selectedPlanDetails.price === 0 ? "Free" : `₹${selectedPlanDetails.price}`}` : "No plan selected"}
            </span>
            <button
              onClick={handleCreateOrder}
              disabled={isCreatingOrder || isVerifyingPayment || !selectedPlanDetails}
              className="bg-[#b45b2e] hover:bg-[#9c4923] disabled:cursor-not-allowed disabled:opacity-60 text-white px-6 py-2 rounded-full text-sm shadow-lg"
            >
              {isCreatingOrder
                ? "Processing..."
                : isVerifyingPayment
                ? "Verifying..."
                : selectedPlanDetails?.price === 0
                ? "Continue with Free"
                : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromoteJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4ECE6]" />}>
      <PromoteJobPageContent />
    </Suspense>
  );
}

function Benefit({ icon, text }: any) {
  return (
    <div className="bg-[#F8F1EB] border border-[#E6DAD2] rounded-xl p-4 flex items-center gap-3">
      <div className="bg-[#EFE1D8] text-[#6B3E2E] p-2 rounded-md">{icon}</div>
      <span className="text-sm font-medium text-[#3E2F2B]">{text}</span>
    </div>
  );
}

function PlanCard({
  title,
  price,
  desc,
  features,
  highlight,
  tag,
  selected,
  onSelect,
  loading,
}: any) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl p-6 border transition-all min-h-70 flex flex-col justify-between
      ${highlight ? "bg-white border-[#E6DAD2] shadow-lg scale-105" : "bg-[#F8F1EB] border-[#E6DAD2]"}
      ${selected ? "ring-2 ring-[#6B3E2E]" : ""}`}
    >
      {tag && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6B3E2E] text-white text-[10px] px-3 py-1 rounded-full tracking-wide">
          {tag}
        </div>
      )}

      <div>
        <p className="text-xs text-[#9C8A84] font-semibold tracking-wide">{title}</p>
        <h3 className="text-2xl font-semibold text-[#3E2F2B] mt-1">{price}</h3>
        <p className="text-sm text-[#7C6A64] mt-2">{desc}</p>
        <ul className="mt-3 text-sm text-[#7C6A64] space-y-1">
          {features.map((f: string, i: number) => (
            <li key={i}>• {f}</li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        disabled={loading}
        className={`mt-6 w-full py-3 rounded-lg text-sm transition font-semibold ${selected ? "bg-[#6B3E2E] text-white shadow" : "border border-[#D6C7BF] text-[#3E2F2B] bg-white"}`}
      >
        {loading ? "Opening payment..." : selected ? "Plan selected" : "Select plan"}
      </button>
    </div>
  );
}
