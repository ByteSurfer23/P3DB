"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase"; // your firebase config file
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Add profile data in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
      });

      console.log("User signed up & saved to Firestore:", userCred.user.uid);

      // 3. Redirect to search page
      window.location.href = "/search";

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSignUp} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Sign Up
        </button>
      </form>
    </div>
  );
}
