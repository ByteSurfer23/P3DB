"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin"); // or your sign-in page
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div>Loading...</div>; // or a nice spinner
  }
  console.log(user)
  return <>{children}</>;
}
