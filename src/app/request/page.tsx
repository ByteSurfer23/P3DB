"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

      setSuccessMsg("Request submitted successfully!");
      form.reset();
    } catch (err) {
      console.error(err);
      setError("Failed to submit request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-6">Protein-Ligand Docking Query</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="proteinTarget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein Target</FormLabel>
                <FormControl>
                  <Input placeholder="Enter protein target" {...field} />
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
                  <Input placeholder="Enter ligand target" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blindDocking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blind Docking</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="mb-0">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="mb-0">No</FormLabel>
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
              <FormItem>
                <FormLabel>Active Site Docking</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="mb-0">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="mb-0">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
