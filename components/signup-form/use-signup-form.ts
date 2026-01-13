"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export function useSignupForm() {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data: SignupFormValues): Promise<any> => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Server error. Please try again later.");
      return res.json();
    },
    onSuccess: (data) => {
      switch (data.message) {
        case "user already exists":
          toast.error("User already exists. Please sign in.");
          break;
        case "verification email sent":
          toast.success("Verification email sent! Please check your inbox.");
          form.reset();
          break;
        default:
          toast.error("Unexpected response from server.");
      }
      queryClient.invalidateQueries({ queryKey: ["signup"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Unexpected response from server.");
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    isPending: signupMutation.isPending,
  };
}
