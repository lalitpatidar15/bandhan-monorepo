import LoginForm from "@/components/Auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bhn-bg)] px-4 py-10">
      <div className="bhn-card bhn-card-pad-lg w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}