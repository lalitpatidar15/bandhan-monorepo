'use client';

import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';
import StudentHeader from '@/components/common/StudentHeader';
import { useCreateOrderMutation, useEnrollFreeCourseMutation, useGetEnrollCourseDetailsQuery, useVerifyPaymentMutation } from '@/app/redux/services/courseApi';
import { useState } from 'react';

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void }; } }

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Razorpay could not load.')); document.body.appendChild(script); });
}

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading } = useGetEnrollCourseDetailsQuery(id || '', { skip: !id });
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [enrollFreeCourse] = useEnrollFreeCourseMutation();
  const [error, setError] = useState('');
  const course = data?.data?.course || data?.course;
  const instructor = data?.data?.instructor || data?.instructor || {};
  const pricing = data?.data?.pricing || data?.pricing || {};
  const total = Number(pricing.total ?? pricing.subtotal ?? 0);
  const processing = isCreating || isVerifying;

  const pay = async () => {
    if (!id) return;
    setError('');
    try {
      if (total === 0) { await enrollFreeCourse(id).unwrap(); router.replace('/student/mycourse'); return; }
      const created = await createOrder({ courseId: id, paymentMethod: 'razorpay' }).unwrap();
      const order = created?.data;
      if (!order?.orderId || !order?.razorpayKey) throw new Error('Razorpay test checkout is not configured.');
      await loadRazorpay();
      if (!window.Razorpay) throw new Error('Razorpay checkout is unavailable.');
      const checkout = new window.Razorpay({ key: order.razorpayKey, amount: order.amount, currency: order.currency || 'INR', name: 'Bandhan', description: `Enrollment: ${course?.title || 'Course'}`, order_id: order.orderId, theme: { color: '#ea5d1a' }, handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try { await verifyPayment({ courseId: id, orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature }).unwrap(); router.replace('/student/mycourse'); }
        catch { setError('Payment was received but could not be verified. Please contact support with your payment ID.'); }
      }, modal: { ondismiss: () => setError('Payment cancelled. Your enrollment was not created.') } });
      checkout.on('payment.failed', (response) => setError(response.error?.description || 'Razorpay test payment failed. Please try again.'));
      checkout.open();
    } catch (caught: unknown) { setError((caught as { data?: { message?: string }; message?: string })?.data?.message || (caught as Error)?.message || 'Could not start Razorpay checkout.'); }
  };

  if (isLoading) return <main className="grid min-h-screen place-items-center bg-[var(--bhn-bg)] text-[var(--bhn-text-muted)]">Loading secure checkout…</main>;
  if (!course) return <main className="grid min-h-screen place-items-center bg-[var(--bhn-bg)] text-[var(--bhn-text-muted)]">Course not found.</main>;
  return <main className="min-h-screen bg-[var(--bhn-bg)] text-[var(--bhn-text)]"><StudentHeader /><div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_0.9fr]"><section className="rounded-3xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bhn-brand-700)]">Course enrollment</p><h1 className="mt-3 text-3xl font-bold text-[var(--bhn-text)]">{course.title}</h1><div className="mt-5 flex items-center gap-3 text-sm text-[var(--bhn-text-muted)]"><img src={instructor.profilePhoto || instructor.profileImage || '/bandhan.png'} alt="" className="h-10 w-10 rounded-full object-cover" /><span>By {instructor.fullName || 'Bandhan instructor'}</span></div>{course.thumbnail && <img src={course.thumbnail} alt="" className="mt-6 h-48 w-full rounded-2xl object-cover" />}</section><aside className="rounded-3xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6 shadow-sm"><h2 className="text-lg font-bold text-[var(--bhn-text)]">Complete enrollment</h2><div className="my-5 space-y-3 border-y border-[var(--bhn-border)] py-5 text-sm text-[var(--bhn-text-muted)]"><div className="flex justify-between"><span>Course fee</span><span>₹{Number(pricing.subtotal || total).toLocaleString('en-IN')}</span></div>{pricing.platformFee ? <div className="flex justify-between"><span>Platform fee</span><span>₹{Number(pricing.platformFee).toLocaleString('en-IN')}</span></div> : null}{pricing.gst ? <div className="flex justify-between"><span>GST</span><span>₹{Number(pricing.gst).toLocaleString('en-IN')}</span></div> : null}<div className="flex justify-between font-bold text-[var(--bhn-text)]"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div></div><div className="rounded-2xl border border-[var(--bhn-brand-200)] bg-[var(--bhn-brand-50)] p-4"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)]"><ShieldCheck className="h-5 w-5" /></span><div><p className="font-semibold text-[var(--bhn-text)]">Pay securely with Razorpay</p><p className="mt-1 text-sm text-[var(--bhn-text-muted)]">Payment methods and test cards are selected in Razorpay&apos;s own checkout.</p></div></div></div>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button onClick={pay} disabled={processing} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--bhn-brand-700)] px-4 py-4 font-semibold text-[var(--bhn-text-on-brand)] transition hover:bg-[var(--bhn-brand-800)] disabled:cursor-not-allowed disabled:opacity-60">{processing ? 'Opening Razorpay…' : total === 0 ? <><CheckCircle2 className="h-5 w-5" /> Enroll for free</> : <><LockKeyhole className="h-5 w-5" /> Pay ₹{total.toLocaleString('en-IN')} with Razorpay</>}</button><p className="mt-4 text-center text-xs text-[var(--bhn-text-soft)]">Test mode — no card, UPI, Google Pay or PhonePe details are collected by Bandhan.</p></aside></div></main>;
}
