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
import { logUserAction } from "../Logging";

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
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-md mx-auto"
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

        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
