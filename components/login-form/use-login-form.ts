"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const loginFormSchema = z.object({
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

export type LoginFormValues = z.infer<typeof loginFormSchema>;

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
