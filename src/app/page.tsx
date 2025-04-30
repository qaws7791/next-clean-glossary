import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {session?.session ? (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-lg">You are now signed in {session.user.email}</p>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Welcome to our app!</h1>
          <p className="text-lg">Please sign in or sign up</p>
          <div className="flex gap-4">
            <Link href="/signin" className="text-blue-500 hover:underline">
              Sign In
            </Link>
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
