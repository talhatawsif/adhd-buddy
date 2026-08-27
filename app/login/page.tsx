import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back to ADHD Buddy.
        </p>
      </div>
      <LoginForm />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No account yet?{" "}
        <Link className="underline" href="/signup">
          Sign up
        </Link>
      </p>
    </main>
  );
}
