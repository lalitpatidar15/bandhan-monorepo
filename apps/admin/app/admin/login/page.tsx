'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/lib/adminApi';
import { Logo, Field, Input, Button, Alert } from '@bandhan/ui';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@bandhan.com');
  const [password, setPassword] = useState('admin@123');
  const [error, setError] = useState('');
  const [login, { isLoading: loading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login({ username: email, password }).unwrap();

      if (!data.success) {
        const msg = data.message || 'Login failed';
        setError(msg);
        toast.error(msg);
        return;
      }

      if (!data.token) {
        const msg = 'Login response did not include a token';
        setError(msg);
        toast.error(msg);
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      toast.success('Login successful!');
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next && next.startsWith('/admin/') && !next.startsWith('//') && !next.startsWith('/admin/login') ? next : '/admin/dashboard');
    } catch (error) {
      const msg = 'Network error: ' + (error instanceof Error ? error.message : 'Unknown error');
      setError(msg);
      toast.error(msg);
      console.error('Login error:', error);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, var(--bhn-bg) 0%, var(--bhn-brand-100) 120%)' }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />

          <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--bhn-text)', fontFamily: 'var(--bhn-font-display)' }}>
            Admin Panel
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bhn-text-muted)' }}>
            Bandhan Platform Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="bhn-card bhn-card-pad-lg mt-6 space-y-4">
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              disabled={loading}
              aria-label="Email address"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              aria-label="Password"
            />
          </Field>

          {error && <Alert tone="danger">{error}</Alert>}

          <Button type="submit" block loading={loading} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>

        <div
          className="mt-4 rounded-lg border p-4"
          style={{ background: 'var(--bhn-brand-50)', borderColor: 'var(--bhn-brand-200)' }}
        >
          <p className="mb-2 text-sm font-medium" style={{ color: 'var(--bhn-brand-800)' }}>
            Demo Credentials:
          </p>
          <p className="text-xs" style={{ color: 'var(--bhn-brand-700)' }}>
            Email: <span className="font-mono">admin@bandhan.com</span>
          </p>
          <p className="text-xs" style={{ color: 'var(--bhn-brand-700)' }}>
            Password: <span className="font-mono">admin@123</span>
          </p>
        </div>

        <div className="mt-8 text-center text-sm" style={{ color: 'var(--bhn-text-muted)' }}>
          <p>&copy; 2026 Bandhan Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}