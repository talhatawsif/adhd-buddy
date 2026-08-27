import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Auth error</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        That confirmation link did not work. Try signing up or logging in again.
      </p>
      <Link className="text-sm underline" href="/login">
        Back to log in
      </Link>
    </main>
  );
}
