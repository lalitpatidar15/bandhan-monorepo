'use client';

import { Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useSubscribeNewsletterMutation } from '@/store/api/publicApi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      const result = await subscribe({ email: email.trim() }).unwrap();
      setEmail('');
      setMessage(result.message || 'You are subscribed to Bandhan updates.');
    } catch (error) {
      const apiMessage = error && typeof error === 'object' && 'data' in error
        ? (error.data as { message?: string } | undefined)?.message
        : undefined;
      setMessage(apiMessage || 'We could not subscribe you right now. Please try again.');
    }
  };

  return (
    <section className="bg-[var(--bhn-brand-900)] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-300)]">Stay updated</p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Get deals & event ideas</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60">Subscribe for exclusive offers, trending collections and event planning tips.</p>
        <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md gap-2">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            required
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-w-0 flex-1 rounded-full bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/20 transition focus:ring-white/40"
          />
          <button type="submit" disabled={isLoading} className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--bhn-brand-800)] transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-70">
            <Send size={14} /> {isLoading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
        {message ? <p className="mx-auto mt-3 max-w-md text-sm text-white/80" role="status">{message}</p> : null}
        <p className="mx-auto mt-2 max-w-md text-xs text-white/45">By subscribing, you agree to receive Bandhan marketing updates. You can unsubscribe at any time.</p>
      </div>
    </section>
  );
}
