"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { signupFormSchema, type SignupFormValues } from "@/lib/schemas/auth.schema";

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
