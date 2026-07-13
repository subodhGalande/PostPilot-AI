"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { useSignupForm } from "./use-signup-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_auth_failed:
    "Google sign-in failed. Please try again or use email sign-up.",
  missing_code: "Google sign-in failed. Please try again.",
  no_email:
    "Could not retrieve your email from Google. Please try a different account.",
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { form, onSubmit, isPending } = useSignupForm();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error && GOOGLE_ERROR_MESSAGES[error]) {
      toast.error(GOOGLE_ERROR_MESSAGES[error]);
    }
  }, [searchParams]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form noValidate method="POST" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icons.logo className="size-5" />
              </div>
              <span className="sr-only">PostPilot</span>
            </span>
            <h1 className="text-3xl font-medium tracking-tight">
              Create your account
            </h1>
            <FieldDescription className="text-base">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </FieldDescription>
          </div>
          <Field className="gap-4">
            <Button
              onClick={() => {
                window.location.href = "/api/auth/google";
              }}
              className="w-full h-11 active:scale-[0.98] transition-transform bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              type="button"
            >
              <Icons.google className="size-5" />
              Continue with Google
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    {...field}
                    id="firstName"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="First"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    {...field}
                    id="lastName"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Last"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter email"
                  disabled={isPending}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Create password"
                  disabled={isPending}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Field>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign up
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
