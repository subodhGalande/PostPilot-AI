"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { loginFormSchema, type LoginFormValues } from "@/lib/schemas/auth.schema";

export function useLoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: LoginFormValues): Promise<any> => {
      const res = await fetch("/api/auth/login", {
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
        case "invalid credentials":
          toast.error(
            "credentials not valid. Check email/password and try again."
          );
          break;
        case "user not verified":
          toast.error("Verify email first");
          break;
        case "login successful":
          toast.success("successfully verified");
          router.push("/dashboard");
          break;
        default:
          toast.error("Unexpected response from server.");
      }
      queryClient.invalidateQueries({ queryKey: ["login"] });
    },
    onError: (error: any) => {
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
