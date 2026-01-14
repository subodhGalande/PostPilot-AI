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
  FieldGroup,
  FieldLabel,
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

import { Controller } from "react-hook-form";
import { useOnboardingForm } from "./use-onboarding-form";

type OnboardingDialogProps = {
  isOpen: boolean;
};

export function OnboardingDialog({ isOpen }: OnboardingDialogProps) {
  const { form, onSubmit } = useOnboardingForm();

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            Can you confirm the following?
          </DialogTitle>
          <DialogDescription>
            this will help us to personalize your experience and provide you
            with the best possible results.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="mt-4">
            <Controller
              name="accountType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel
                    className="text-xs text-muted-foreground font-medium"
                    htmlFor="accountType"
                  >
                    Using PostPilot AI as
                  </FieldLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
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
