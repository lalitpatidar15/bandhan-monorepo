type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8f5f2] dark:bg-[#171717] flex items-center justify-center">
      {children}
    </div>
  );
}