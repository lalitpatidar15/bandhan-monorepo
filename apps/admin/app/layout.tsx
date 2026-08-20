import type { Metadata } from 'next';
import { Space_Grotesk, Manrope } from 'next/font/google';
import '@bandhan/ui/styles.css';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--bhn-font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--bhn-font-display',
});

export const metadata: Metadata = {
  title: 'Bandhan Admin Panel',
  description: 'Manage all Bandhan platforms - Student, User, and Job Seeker panels',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}