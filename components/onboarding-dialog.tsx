"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const onBoardingFormSchema = z.object({
  AccountType: z.enum(["Influencer", "Brand"], {
    error: () => " Please select an account type  ",
  }),
  industry: z.string().min(3, "Industry must be at least 3 characters long"),
});

type OnboardingDialogProps = {
  isOpen: boolean;
};

export function OnboardingDialog({ isOpen }: OnboardingDialogProps) {
  const form = useForm<z.infer<typeof onBoardingFormSchema>>({
    resolver: zodResolver(onBoardingFormSchema),
    defaultValues: {
      AccountType: undefined,
      industry: "",
    },
  });
  const onSubmit = (data: z.infer<typeof onBoardingFormSchema>) => {
    console.log(data);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to the PostPilot AI</DialogTitle>
          <DialogDescription>
            We're excited to have you here. Let's take a quick moment to set up
            your experience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="mt-4">
            <Controller
              name="AccountType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel
                    className="text-xs text-muted-foreground font-medium"
                    htmlFor="accountType"
                  >
                    Using PostPilot AI as
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="accountType" className="w-full">
                      <SelectValue placeholder="Select Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Influencer">Influencer</SelectItem>
                      <SelectItem value="Brand">Brand</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="industry"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className="text-xs text-muted-foreground font-medium"
                    htmlFor="industry"
                  >
                    Which Industry are you in?
                  </FieldLabel>
                  <Input
                    {...field}
                    id="industry"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter industry"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button className="mt-6 w-full" type="submit">
              Get Started
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
