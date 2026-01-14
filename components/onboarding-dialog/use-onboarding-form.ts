"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const onBoardingFormSchema = z.object({
  accountType: z.enum(["Influencer", "Brand"], {
    error: () => " Please select an account type  ",
  }),
  industry: z.string().min(3, "Industry must be at least 3 characters long"),
});

export type OnboardingFormValues = z.infer<typeof onBoardingFormSchema>;

export function useOnboardingForm() {
  const queryClient = useQueryClient();

  const onboardingMutation = useMutation({
    mutationKey: ["onboarding"],
    mutationFn: async (data: OnboardingFormValues): Promise<any> => {
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
    },
    onError: () => {
      toast.error("Failed to save onboarding data. Please try again later.");
    },
  });

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onBoardingFormSchema),
    defaultValues: {
      accountType: "" as unknown as "Influencer" | "Brand",
      industry: "",
    },
  });

  const onSubmit = (data: OnboardingFormValues) => {
    onboardingMutation.mutate(data);
    toast.success("Onboarding data saved! (Mock)");
  };

  return {
    form,
    onSubmit,
    isPending: onboardingMutation.isPending,
  };
}
