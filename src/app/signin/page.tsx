"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/search");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col items-center space-y-4 min-h-[80vh] justify-center">
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="border p-2" />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="border p-2" />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Sign In</button>
      <p onClick={() => router.push("/signup")} className="text-sm text-blue-500 cursor-pointer">Don't have an account? Sign Up</p>
    </form>
  );
}
