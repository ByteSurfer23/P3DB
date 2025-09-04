"use client";
export const dynamic = "force-dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // make sure you export `db` (Firestore) too
import { doc, getDoc } from "firebase/firestore";
// import { logUserAction } from "../Logging"; // Assuming a logging function
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
import { useEffect, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { motion } from "framer-motion";

// Validation schema
const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Assuming a logUserAction function exists
  const logUserAction = async (payload: { userId: string; action: string; }) => {
    console.log("Logging user action:", payload);
    // Add your actual Firestore logic here
  };

  useEffect(() => {
    // You might want to remove this line if you don't want to sign out every time the page loads
    signOut(auth).catch(() => {});
  }, []);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border border-border"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-2">
            Sign In
          </h2>
          <p className="text-muted-foreground">
            Welcome back! Enter your credentials to continue.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
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
            <Button
              type="submit"
              className="w-full h-12 text-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Link to Sign Up */}
        <p
          onClick={() => router.push("/signup")}
          className="mt-6 text-sm text-primary hover:underline hover:underline-offset-4 cursor-pointer text-center"
        >
          Don&apos;t have an account? Sign Up
        </p>
      </motion.div>
    </div>
  );
}
