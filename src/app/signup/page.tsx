"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { logUserAction } from "../Logging"; // Assuming a logging function
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  salutation: z.string().min(1, "Select a salutation"),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  location: z.string().min(2),
  organization: z.string().min(2),
  role: z.string().min(2),
});

export default function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Assuming a logUserAction function exists
  const logUserAction = async (payload: { userId: string; action: string; }) => {
    console.log("Logging user action:", payload);
    // Add your actual Firestore logic here
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salutation: "",
      name: "",
      email: "",
      password: "",
      location: "",
      organization: "",
      role: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        ...values,
        admin: false, // <-- Always set admin to false here
        createdAt: serverTimestamp(),
      });
      await logUserAction({
        userId: user.uid,
        action: "sign_up",
      });

      router.push("/search");
    } catch (error: any) {
      console.error("Error signing up:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border border-border"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-2">
            Create an Account
          </h2>
          <p className="text-muted-foreground">
            Enter your details to get started.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="salutation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salutation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Salutation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {["name", "email", "password", "location", "organization", "role"].map(
              (fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName as keyof z.infer<typeof formSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={fieldName === "password" ? "password" : "text"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            )}

            <Button type="submit" className="w-full h-12 text-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign Up
                </>
              )}
            </Button>
          </form>
        </Form>
        <p
          onClick={() => router.push("/signin")}
          className="mt-6 text-sm text-primary hover:underline hover:underline-offset-4 cursor-pointer text-center"
        >
          Already have an account? Sign In
        </p>
      </motion.div>
    </div>
  );
}
