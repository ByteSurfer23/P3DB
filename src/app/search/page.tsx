"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return <h1 className="text-3xl text-center mt-10">Welcome to Search Page!</h1>;
}
