"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader, Card, Button, Input, EmptyState, Spinner, Badge } from '@bandhan/ui';
import { CreditCard, Wallet, HelpCircle, Loader } from "lucide-react";
import { MdLock } from "react-icons/md";
import { 
  useLazyGetPaymentKeyQuery, 
  useGetCheckoutQuoteQuery,
  useCreatePaymentOrderMutation, 
  useVerifyPaymentMutation, 
  useCreateUserOrderMutation,
  type RazorpayVerificationRequest,
} from "@/store/api/authApi";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayVerificationRequest) => Promise<void>;
  modal: { ondismiss: () => void };
  prefill: { contact: string; method?: string };
  theme: { color: string };
}

interface RazorpayInstance {
  on: (event: string, callback: () => void) => void;
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [address, setAddress] = useState({ 
    street: "", 
    city: "", 
    state: "", 
    pincode: "", 
    phone: "" 
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: checkoutData, isLoading: cartLoading, isError: quoteError, refetch: refetchQuote } = useGetCheckoutQuoteQuery();
  const [triggerGetPaymentKey] = useLazyGetPaymentKeyQuery();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [createUserOrder] = useCreateUserOrderMutation();

  const cartItems = checkoutData?.items || [];
  const subtotal = checkoutData?.quote.subtotal || 0;
  const shipping = checkoutData?.quote.shipping || 0;
  const serviceFee = checkoutData?.quote.serviceFee || 0;
  const tax = checkoutData?.quote.tax || 0;
  const discount = checkoutData?.quote.discount || 0;
  const total = checkoutData?.quote.total || 0;

  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));

    if (field === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setAddress((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }

    if (field === "pincode") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
      setAddress((prev) => ({ ...prev, pincode: digitsOnly }));

      if (digitsOnly.length === 6) {
        fetchLocationFromPincode(digitsOnly);
      }
      return;
    }

    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const fetchLocationFromPincode = async (pincode: string) => {
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();

      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length) {
        const postOffice = data[0].PostOffice[0];
        setAddress((prev) => ({
          ...prev,
          city: postOffice.District || postOffice.Block || "",
          state: postOffice.State || "",
        }));
        setErrors((prev) => ({ ...prev, pincode: "" }));
      } else {
        setErrors((prev) => ({ ...prev, pincode: "Invalid Indian Pincode" }));
      }
    } catch {
      // Keep silent on error to not disturb UI
    } finally {
      setPincodeLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!address.street.trim() || address.street.trim().length < 5) {
      newErrors.street = "Please enter valid street address.";
    }

    if (!/^[1-9][0-9]{5}$/.test(address.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit Indian Pincode.";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!address.state.trim()) {
      newErrors.state = "State is required.";
    }

    if (!/^[6-9]\d{9}$/.test(address.phone)) {
      newErrors.phone = "Enter valid 10-digit Indian Mobile Number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!checkoutData || cartItems.length === 0) {
      alert("Your checkout quote is not available. Refresh the page and try again.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const keyResult = await triggerGetPaymentKey(undefined, false);
      if (!keyResult.data?.key) throw new Error("Failed to load payment key");
      const razorpayKey = keyResult.data.key;

      const orderData = await createPaymentOrder({
        paymentMethod,
      }).unwrap();
      if (!orderData.success) throw new Error(orderData.message || "Failed to create order");

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Bandhan",
        description: `Order Payment`,
        order_id: orderData.order.id,
        handler: async (response: RazorpayVerificationRequest) => {
          const verifyData = await verifyPayment(response).unwrap();
          if (verifyData.success) {
            try {
              const orderResult = await createUserOrder({
                shippingAddress: address,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              }).unwrap();

              const orderIds = (orderResult.orders?.length ? orderResult.orders : [orderResult.order])
                .map((order) => order?._id)
                .filter((orderId): orderId is string => Boolean(orderId));
              if (!orderIds.length) throw new Error("The order was created without an order ID");
              const params = new URLSearchParams({
                orderId: orderIds[0],
                orderIds: orderIds.join(","),
              });
              router.push(`/userdashboard/confirmation?${params.toString()}`);
              return;
            } catch (orderError: unknown) {
              console.error("Order creation failed:", orderError);
              const message = orderError && typeof orderError === 'object' && 'data' in orderError
                ? (orderError.data as { message?: string } | undefined)?.message
                : orderError instanceof Error ? orderError.message : undefined;
              alert(message || "Order could not be created. Please contact support.");
              setLoading(false);
              return;
            }

          } else {
            alert("Payment verification failed");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        prefill: {
          contact: address.phone,
          ...(paymentMethod === "upi" || paymentMethod === "card" ? { method: paymentMethod } : {}),
        },
        theme: { color: "#964407" },
      };

      if (!window.Razorpay) throw new Error("Payment window did not load. Please try again.");
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => { alert("Payment failed"); setLoading(false); });
      rzp.open();
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'data' in error
        ? (error.data as { message?: string } | undefined)?.message
        : error instanceof Error ? error.message : undefined;
      alert(message || "Payment failed");
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[var(--bhn-bg)] flex items-center justify-center">
        <Spinner size="lg" className="animate-spin text-[var(--bhn-brand-500)]" />
      </div>
    );
  }

  if (quoteError || !checkoutData) {
    return (
      <div className="min-h-screen bg-[var(--bhn-bg)] flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg">
            <EmptyState
              title="Checkout is not ready"
              description="We could not verify the latest price and availability of your cart. No payment has been started."
              action={
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => refetchQuote()}>Try again</Button>
                  <Button variant="ghost" onClick={() => router.push("/cart")}>Return to cart</Button>
                </div>
              }
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bhn-bg)]">
      <div className="max-w-7xl mx-auto px-3 md:px-5 py-6">
        <SectionHeader
          title="Checkout"
          subtitle="Review your details and complete your payment"
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px] items-start">
          <div className="space-y-5">
            <Card className="rounded-2xl space-y-4 p-4 md:p-4">
              <section className="space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bhn-brand-500)] text-white text-[10px]">1</span>
                  <p className="text-sm font-medium text-[var(--bhn-text)]">Shipping Address</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Street Address"
                      value={address.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      className={errors.street ? "border-red-500" : undefined}
                      invalid={!!errors.street}
                    />
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="Pincode (6 digits)"
                      value={address.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                      maxLength={6}
                      className={errors.pincode ? "border-red-500" : undefined}
                      invalid={!!errors.pincode}
                    />
                    {pincodeLoading && (
                      <Spinner size="sm" className="animate-spin absolute right-3 top-3 text-[var(--bhn-brand-500)]" />
                    )}
                  </div>

<div>
                    <Input
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={errors.city ? "border-red-500" : undefined}
                      invalid={!!errors.city}
                    />
                    {errors.city && <p className="text-[10px] text-red-500 mt-0.5">{errors.city}</p>}
                  </div>

<div>
                    <Input
                      placeholder="State"
                      value={address.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={errors.state ? "border-red-500" : undefined}
                      invalid={!!errors.state}
                    />
                    {errors.state && <p className="text-[10px] text-red-500 mt-0.5">{errors.state}</p>}
                  </div>

<div>
                    <Input
                      placeholder="10-digit Phone Number"
                      value={address.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      maxLength={10}
                      className={errors.phone ? "border-red-500" : undefined}
                      invalid={!!errors.phone}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bhn-brand-500)] text-white text-[10px]">2</span>
                  <p className="text-sm font-medium text-[var(--bhn-text)]">Payment Method</p>
                </div>

                <div className="grid gap-2">
                  {[
                    { value: "card", icon: <CreditCard size={18} />, title: "Credit / Debit Card", details: "Visa, Mastercard, Amex" },
                    { value: "upi", icon: <Wallet size={18} />, title: "UPI Payment", details: "Google Pay, PhonePe, Paytm" },
                    { value: "emi", icon: <CreditCard size={18} />, title: "EMI (if eligible)", details: "Available plans and rates are shown securely by Razorpay" },
                  ].map((item) => (
                    <label key={item.value} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--bhn-border)] bg-white p-3 hover:border-[var(--bhn-brand-400)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-[var(--bhn-brand-50)] p-2 rounded-lg text-[var(--bhn-brand-600)]">{item.icon}</div>
                        <div>
                          <p className="font-semibold text-[var(--bhn-text)] text-xs">{item.title}</p>
                          <p className="text-[10px] text-[var(--bhn-text-muted)]">{item.details}</p>
                        </div>
                      </div>
                      <input type="radio" name="payment" value={item.value} checked={paymentMethod === item.value} onChange={() => setPaymentMethod(item.value)} className="h-4 w-4 accent-[var(--bhn-brand-500)]" />
                    </label>
                  ))}
                </div>

                {paymentMethod === "emi" && (
                  <div className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-brand-50)] p-3 text-[11px] leading-5 text-[var(--bhn-text-muted)]">
                    EMI eligibility, tenure, interest, and final instalment amount are determined by your bank and displayed in the Razorpay payment window before you pay.
                  </div>
                )}
              </section>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="rounded-2xl shadow-sm bg-white p-3 border border-[var(--bhn-border)]">
              <h2 className="text-base font-bold text-[var(--bhn-text)] mb-4">Order Summary</h2>
              {cartItems.length === 0 ? (
                <EmptyState
                  title="Your cart is empty"
                  description="Add items to your cart before proceeding to checkout."
                  action={<Button variant="ghost" onClick={() => router.push('/products/explore')}>Browse products</Button>}
                />
              ) : (
                <>
                  <div className="space-y-3 border-b border-[var(--bhn-border)] pb-3 mb-3">
                    {cartItems.map((item) => (
                      <div key={`${item.productId}:${item.variant}`} className="flex justify-between gap-3 text-xs">
                        <span className="text-[var(--bhn-text-muted)] truncate max-w-[200px]">{item.title} × {item.quantity}</span>
                        <span className="font-medium shrink-0">{formatCurrency(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[var(--bhn-text-muted)]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    {shipping > 0 && <div className="flex justify-between text-[var(--bhn-text-muted)]"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>}
                    <div className="flex justify-between text-[var(--bhn-text-muted)]"><span>Service Fee</span><span>{formatCurrency(serviceFee)}</span></div>
                    <div className="flex justify-between text-[var(--bhn-text-muted)]"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-[var(--bhn-brand-600)] font-bold"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                  </div>
                </>
              )}

              <div className="mt-4 pt-3 border-t-2 border-dashed border-[var(--bhn-border)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[var(--bhn-text-muted)]">Total</span>
                  <span className="text-xl font-black text-[var(--bhn-text)]">{formatCurrency(total)}</span>
                </div>
                <Button onClick={handlePayment} disabled={loading || cartItems.length === 0} className="w-full py-3 text-sm font-bold text-white bg-[var(--bhn-brand-500)] rounded-xl hover:bg-[var(--bhn-brand-600)] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {loading ? <Spinner size="sm" className="animate-spin" /> : null}
                  {loading ? "Processing..." : `Pay ${formatCurrency(total)}`}
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-[var(--bhn-text-muted)]">
                <MdLock size={14} />
                <span className="text-[9px] font-medium uppercase">Secured by Razorpay</span>
              </div>
            </Card>

            <Card className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-brand-50)] p-4 shadow-sm">
              <div className="flex gap-3 items-start">
                <HelpCircle className="text-[var(--bhn-brand-500)] shrink-0" size={18} />
                <div>
                  <p className="font-bold text-xs text-[var(--bhn-text)]">Need help?</p>
                  <p className="text-[10px] text-[var(--bhn-text-muted)] mt-1">Contact our support team for assistance</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}