"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // make sure you export `db` (Firestore) too
import { doc, getDoc } from "firebase/firestore";
import { logUserAction } from "../Logging";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

// Validation schema
const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInPage() {
  useEffect(() => {
    signOut(auth).catch(() => {});
  }, []);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // 2. Get user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error("User document not found!");
        // You might want to sign out the user and show an error message here
        return;
      }

      // 3. Check `admin` flag in user doc
      const userData = userDocSnap.data();
      await logUserAction({
        userId: user.uid,
        action: "sign_in",
      });
      const isAdmin = userData.admin === true;

      // 4. Redirect based on admin flag
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/search");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      // Optionally show a user-friendly error message here
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-sm"
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </Form>

      {/* Link to Sign Up */}
      <p
        onClick={() => router.push("/signup")}
        className="mt-4 text-sm text-blue-500 cursor-pointer"
      >
        Don&apos;t have an account? Sign Up
      </p>
    </div>
  );
}
