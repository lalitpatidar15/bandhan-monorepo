type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bhn-bg)] flex items-center justify-center">
      {children}
    </div>
  );
}