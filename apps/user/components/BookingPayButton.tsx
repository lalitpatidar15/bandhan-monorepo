'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { CreditCard } from 'lucide-react';
import { useLazyGetPaymentKeyQuery } from '@/store/api/authApi';
import { bookingApi, useCreateBookingPaymentOrderMutation, useVerifyBookingPaymentMutation } from '@/store/api/bookingApi';

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  modal: { ondismiss: () => void };
  prefill: { contact: string; method?: string };
  theme: { color: string };
}

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('razorpay-script') as HTMLScriptElement | null;
    const script = existing || document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Payment checkout could not be loaded'));
    if (!existing) document.body.appendChild(script);
  });
}

export default function BookingPayButton({ bookingId, amount, label = 'Pay now' }: { bookingId: string; amount: number; label?: string }) {
  const dispatch = useDispatch();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState('');
  const [getPaymentKey] = useLazyGetPaymentKeyQuery();
  const [createOrder] = useCreateBookingPaymentOrderMutation();
  const [verifyPayment] = useVerifyBookingPaymentMutation();

  const handlePay = async () => {
    setIsWorking(true);
    setError('');
    try {
      const orderResult = await createOrder(bookingId).unwrap();
      if (!orderResult.success) throw new Error('Unable to start payment');
      const keyData = await getPaymentKey().unwrap();
      await loadRazorpay();
      if (!window.Razorpay) throw new Error('Payment checkout could not be loaded');
      const options: RazorpayOptions = {
        key: String(keyData?.key || ''),
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: 'Bandhan',
        description: 'Service / venue booking',
        order_id: orderResult.order.id,
        modal: { ondismiss: () => setIsWorking(false) },
        prefill: { contact: '' },
        theme: { color: getComputedStyle(document.documentElement).getPropertyValue('--bhn-brand-600').trim() },
        handler: async (response: RazorpayResponse) => {
          try {
            const verification = await verifyPayment(response).unwrap();
            if (!verification.success) throw new Error('Payment verification failed');
            dispatch(bookingApi.util.invalidateTags(['Dashboard']));
          } catch (verifyError) {
            setError(verifyError instanceof Error ? verifyError.message : 'Payment verification failed');
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Payment could not be started');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div>
      <button type="button" className="bhn-button bhn-button-primary bhn-button-sm" disabled={isWorking || !(amount > 0)} onClick={handlePay}>
        <CreditCard size={14} /> {isWorking ? 'Starting payment…' : `${label} · ₹${Number(amount || 0).toLocaleString()}`}
      </button>
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--bhn-error-600)' }}>{error}</p>}
    </div>
  );
}
