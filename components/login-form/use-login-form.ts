"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import {
  loginFormSchema,
  type LoginFormValues,
} from "@/lib/schemas/auth.schema";

export function useLoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: LoginFormValues): Promise<{ message: string }> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Server error. Please try again later.");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("successfully verified");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Unexpected response from server.");
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    isPending: loginMutation.isPending,
  };
}
