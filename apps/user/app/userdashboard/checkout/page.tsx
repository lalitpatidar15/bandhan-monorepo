"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
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

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Address State (Strict original shape maintained)
  const [address, setAddress] = useState({ 
    street: "", 
    city: "", 
    state: "", 
    pincode: "", 
    phone: "" 
  });

  // Client-side Validation Errors State
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

  // Strict Client-side Input Control
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

  // Indian Pincode Auto-Fill (Client-Side)
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

  // Local Form Validation
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
      <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
        <Loader className="animate-spin text-[#964407]" size={24} />
      </div>
    );
  }

  if (quoteError || !checkoutData) {
    return (
      <div className="min-h-screen bg-[#F8F4EF] flex flex-col">
        <Header variant="checkout" />
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <Card className="w-full max-w-lg rounded-2xl border border-[#E7E1D8] bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-[#1C1A16]">Checkout is not ready</h1>
            <p className="mt-2 text-sm leading-6 text-[#6B625A]">
              We could not verify the latest price and availability of your cart. No payment has been started.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void refetchQuote()}
                className="rounded-lg bg-[#964407] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7a3606]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => router.push("/cart")}
                className="rounded-lg border border-[#DBC1B5] bg-white px-5 py-2.5 text-sm font-semibold text-[#6B3A20] hover:bg-[#FBF6F0]"
              >
                Return to cart
              </button>
            </div>
          </Card>
        </main>
        <Footer variant="checkout" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EF]">
      <Header variant="checkout" />
      <div className="max-w-7xl mx-auto px-3 md:px-5 py-6">
        <div className="mb-4">
          <SectionHeading label="" title="Checkout" className="max-w-3xl font-normal text-xl md:text-xl" />
          <p className="text-gray-500 mt-1 text-xs">Review your details and complete your payment</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px] items-start">

          <div className="space-y-5">
            <Card className="rounded-2xl shadow-sm space-y-4 p-4 md:p-4">
              <section className="space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#964407] text-white text-[10px]">1</span>
                  <p className="text-sm font-medium text-[#201B14]">Shipping Address</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <input 
                      placeholder="Street Address" 
                      value={address.street} 
                      onChange={(e) => handleInputChange("street", e.target.value)} 
                      className={`w-full rounded-lg border bg-[#FBF6F0] p-2.5 text-xs outline-none focus:border-[#964407] ${
                        errors.street ? "border-red-500" : "border-[#DBC1B5]"
                      }`} 
                    />
                    {errors.street && <p className="text-[10px] text-red-500 mt-0.5">{errors.street}</p>}
                  </div>

                  <div className="relative">
                    <input 
                      placeholder="Pincode (6 digits)" 
                      value={address.pincode} 
                      onChange={(e) => handleInputChange("pincode", e.target.value)} 
                      maxLength={6}
                      className={`w-full rounded-lg border bg-[#FBF6F0] p-2.5 text-xs outline-none focus:border-[#964407] ${
                        errors.pincode ? "border-red-500" : "border-[#DBC1B5]"
                      }`} 
                    />
                    {pincodeLoading && (
                      <Loader size={12} className="animate-spin absolute right-3 top-3 text-[#964407]" />
                    )}
                    {errors.pincode && <p className="text-[10px] text-red-500 mt-0.5">{errors.pincode}</p>}
                  </div>

                  <div>
                    <input 
                      placeholder="City" 
                      value={address.city} 
                      onChange={(e) => handleInputChange("city", e.target.value)} 
                      className={`w-full rounded-lg border bg-[#FBF6F0] p-2.5 text-xs outline-none focus:border-[#964407] ${
                        errors.city ? "border-red-500" : "border-[#DBC1B5]"
                      }`} 
                    />
                    {errors.city && <p className="text-[10px] text-red-500 mt-0.5">{errors.city}</p>}
                  </div>

                  <div>
                    <input 
                      placeholder="State" 
                      value={address.state} 
                      onChange={(e) => handleInputChange("state", e.target.value)} 
                      className={`w-full rounded-lg border bg-[#FBF6F0] p-2.5 text-xs outline-none focus:border-[#964407] ${
                        errors.state ? "border-red-500" : "border-[#DBC1B5]"
                      }`} 
                    />
                    {errors.state && <p className="text-[10px] text-red-500 mt-0.5">{errors.state}</p>}
                  </div>

                  <div>
                    <input 
                      placeholder="10-digit Phone Number" 
                      value={address.phone} 
                      onChange={(e) => handleInputChange("phone", e.target.value)} 
                      maxLength={10}
                      className={`w-full rounded-lg border bg-[#FBF6F0] p-2.5 text-xs outline-none focus:border-[#964407] ${
                        errors.phone ? "border-red-500" : "border-[#DBC1B5]"
                      }`} 
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#964407] text-white text-[10px]">2</span>
                  <p className="text-sm font-medium text-[#201B14]">Payment Method</p>
                </div>

                <div className="grid gap-2">
                  {[
                    { value: "card", icon: <CreditCard size={18} />, title: "Credit / Debit Card", details: "Visa, Mastercard, Amex" },
                    { value: "upi", icon: <Wallet size={18} />, title: "UPI Payment", details: "Google Pay, PhonePe, Paytm" },
                    { value: "emi", icon: <CreditCard size={18} />, title: "EMI (if eligible)", details: "Available plans and rates are shown securely by Razorpay" },
                  ].map((item) => (
                    <label key={item.value} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E7E1D8] bg-white p-3 hover:border-[#C2652A] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#F8ECE1] p-2 rounded-lg text-[#645D57]">{item.icon}</div>
                        <div>
                          <p className="font-semibold text-[#1C1A16] text-xs">{item.title}</p>
                          <p className="text-[10px] text-[#8B7E72]">{item.details}</p>
                        </div>
                      </div>
                      <input type="radio" name="payment" value={item.value} checked={paymentMethod === item.value} onChange={() => setPaymentMethod(item.value)} className="h-4 w-4 accent-[#C2652A]" />
                    </label>
                  ))}
                </div>

                {paymentMethod === "emi" && (
                  <div className="rounded-xl border border-[#DBC1B5] bg-[#FBF6F0] p-3 text-[11px] leading-5 text-[#6B625A]">
                    EMI eligibility, tenure, interest, and final instalment amount are determined by your bank and displayed in the Razorpay payment window before you pay.
                  </div>
                )}
              </section>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="rounded-2xl shadow-sm bg-white p-3 border border-[#E7E1D8]">
              <h2 className="text-base font-bold text-[#1C1A16] mb-4">Order Summary</h2>
              {cartItems.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 border-b border-[#E7E1D8] pb-3 mb-3">
                    {cartItems.map((item) => (
                      <div key={`${item.productId}:${item.variant}`} className="flex justify-between gap-3 text-xs">
                        <span className="text-[#6B625A] truncate max-w-[200px]">{item.title} × {item.quantity}</span>
                        <span className="font-medium shrink-0">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[#6B625A]"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                    {shipping > 0 && <div className="flex justify-between text-[#6B625A]"><span>Shipping</span><span>₹{shipping.toLocaleString()}</span></div>}
                    <div className="flex justify-between text-[#6B625A]"><span>Service Fee</span><span>₹{serviceFee.toLocaleString()}</span></div>
                    <div className="flex justify-between text-[#6B625A]"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
                    {discount > 0 && <div className="flex justify-between text-[#C2652A] font-bold"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
                  </div>
                </>
              )}
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#E7E1D8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#6B625A]">Total</span>
                  <span className="text-xl font-black text-[#1C1A16]">₹{total.toLocaleString()}</span>
                </div>
                <button onClick={handlePayment} disabled={loading || cartItems.length === 0}
                  className="w-full py-3 text-sm font-bold text-white bg-[#964407] rounded-xl hover:bg-[#7a3606] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {loading ? <Loader className="animate-spin" size={16} /> : null}
                  {loading ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-[#525866]">
                <MdLock size={14} />
                <span className="text-[9px] font-medium uppercase">Secured by Razorpay</span>
              </div>
            </Card>

            <Card className="rounded-2xl border border-[#E7E1D8] bg-[#FEF1E7] p-4 shadow-sm">
              <div className="flex gap-3 items-start">
                <HelpCircle className="text-[#C2652A] shrink-0" size={18} />
                <div>
                  <p className="font-bold text-xs text-[#1C1A16]">Need help?</p>
                  <p className="text-[10px] text-[#6B625A] mt-1">Contact our support team for assistance</p>
                </div>
              </div>
            </Card>
          </aside>

        </div>
      </div>
      <Footer variant="checkout" />
    </div>
  );
}
