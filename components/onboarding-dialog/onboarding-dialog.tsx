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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Controller } from "react-hook-form";
import { useOnboardingForm } from "./use-onboarding-form";
import { Rocket, Sparkles, Building2, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type OnboardingDialogProps = {
  isOpen: boolean;
};

export function OnboardingDialog({ isOpen }: OnboardingDialogProps) {
  const { form, onSubmit, isPending } = useOnboardingForm();

  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-[95vw] sm:max-w-[480px] p-0 overflow-hidden border-border/50 shadow-xl">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="p-5 relative z-10">
          <DialogHeader className="space-y-2 pb-4 border-b border-border/40">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse"></div>
              <Rocket className="h-5 w-5 text-primary relative z-10" />
            </div>
            <div className="space-y-1 text-center">
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                Set up your workspace
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mx-auto max-w-sm">
                Let's tailor PostPilot to your specific needs. This only takes a minute.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
            <FieldGroup className="gap-4">
              <Controller
                name="accountType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-sm text-foreground font-medium mb-2 block">
                      How will you use PostPilot?
                    </FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => field.onChange("Influencer")}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-[1rem] border p-3 text-left transition-all hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          field.value === "Influencer"
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                            : "border-border/60 bg-card shadow-xs hover:border-border"
                        )}
                      >
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">Influencer</div>
                          <div className="text-[11px] leading-tight text-muted-foreground mt-0.5">For creators & personal brands</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => field.onChange("Brand")}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-[1rem] border p-3 text-left transition-all hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          field.value === "Brand"
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                            : "border-border/60 bg-card shadow-xs hover:border-border"
                        )}
                      >
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">Brand</div>
                          <div className="text-[11px] leading-tight text-muted-foreground mt-0.5">For companies & agencies</div>
                        </div>
                      </button>
                    </div>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} className="mt-1" />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="accountName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="text-sm text-foreground font-medium"
                        htmlFor="accountName"
                      >
                        Workspace Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="accountName"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Acme Corp"
                        className="h-10 shadow-xs bg-background/50 focus-visible:bg-background"
                      />
                      {fieldState.invalid && (
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
                        className="text-sm text-foreground font-medium"
                        htmlFor="industry"
                      >
                        Industry
                      </FieldLabel>
                      <Input
                        {...field}
                        id="industry"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Technology"
                        className="h-10 shadow-xs bg-background/50 focus-visible:bg-background"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="text-sm text-foreground font-medium"
                      htmlFor="description"
                    >
                      Brief Description
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
                      aria-invalid={fieldState.invalid}
                      placeholder="Tell us a little bit about what you do..."
                      className="resize-none min-h-[60px] shadow-xs bg-background/50 focus-visible:bg-background"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter className="mt-5 pt-4 border-t border-border/40">
              <Button 
                className="w-full h-10 text-sm group flex items-center justify-center" 
                type="submit" 
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span className="leading-none translate-y-[1px]">Getting Started...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="leading-none translate-y-[1px]">Get Started</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
