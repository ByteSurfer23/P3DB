"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Shadcn components
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// Zod schema for validation
const formSchema = z.object({
  proteinTarget: z.string().min(1, "Protein target is required"),
  ligandTarget: z.string().min(1, "Ligand target is required"),
  blindDocking: z.enum(["yes", "no"]),
  activeSiteDocking: z.enum(["yes", "no"]),
});

type FormData = z.infer<typeof formSchema>;

export default function QuerySection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blindDocking: "no",
      activeSiteDocking: "no",
      proteinTarget: "",
      ligandTarget: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated. Please sign in.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "requests"), {
        proteinTarget: data.proteinTarget,
        ligandTarget: data.ligandTarget,
        blindDocking: data.blindDocking === "yes",
        activeSiteDocking: data.activeSiteDocking === "yes",
        userId: user.uid,
        userEmail: user.email || null,
        createdAt: serverTimestamp(),
      });

      const createdAtString = new Date().toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      });

      setSuccessMsg("Request submitted successfully!");
      form.reset();

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeSiteDocking: data.activeSiteDocking,
          blindDocking: data.blindDocking,
          createdAt: createdAtString,
          ligandTarget: data.ligandTarget,
          proteinTarget: data.proteinTarget,
          userEmail: user.email,
          userId: user.uid,
        }),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to submit request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="rounded-xl shadow-lg border border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
              Docking Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-destructive text-center mb-4">{error}</p>}
            {successMsg && <p className="text-success text-center mb-4">{successMsg}</p>}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="proteinTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein Target</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter protein target" 
                          {...field} 
                          className="h-12 rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ligandTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ligand Target</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter ligand target" 
                          {...field} 
                          className="h-12 rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blindDocking"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Blind Docking</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activeSiteDocking"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Active Site Docking</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 text-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
