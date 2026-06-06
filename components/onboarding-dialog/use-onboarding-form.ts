"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import {
  onBoardingFormSchema,
  type OnboardingFormValues,
} from "@/lib/schemas/auth.schema";

export function useOnboardingForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const onboardingMutation = useMutation({
    mutationKey: ["onboarding"],
    mutationFn: async (data: OnboardingFormValues): Promise<unknown> => {
      const res = await fetch("/api/dashboard/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Server error. Please try again later.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["onboarding"],
      });
      toast.success("Onboarding data saved!");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to save onboarding data. Please try again later.");
    },
  });

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onBoardingFormSchema),
    defaultValues: {
      accountType: "" as unknown as "Influencer" | "Brand",
      accountName: "",
      industry: "",
      description: "",
    },
  });

  const onSubmit = (data: OnboardingFormValues) => {
    onboardingMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    isPending: onboardingMutation.isPending,
  };
}
