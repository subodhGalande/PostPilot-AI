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
import { useLoginForm } from "./use-login-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_auth_failed:
    "Google sign-in failed. Please try again or use email login.",
  missing_code: "Google sign-in failed. Please try again.",
  no_email:
    "Could not retrieve your email from Google. Please try a different account.",
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { form, onSubmit, isPending } = useLoginForm();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error && GOOGLE_ERROR_MESSAGES[error]) {
      toast.error(GOOGLE_ERROR_MESSAGES[error]);
    }
  }, [searchParams]);

  return (
    <div
      className={cn(
        "bg-card/40 border border-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 sm:p-10 flex flex-col gap-4 relative overflow-hidden",
        className,
      )}
      {...props}
    >
      {/* Subtle top inner glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-primary/20 blur-xl rounded-full pointer-events-none" />

      <form
        noValidate
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative z-10"
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4 shadow-sm hover:scale-105 transition-transform"
            >
              <Icons.logo className="size-6" />
              <span className="sr-only">PostPilot</span>
            </Link>
            <h1 className="text-3xl font-medium tracking-tight text-foreground mt-2">
              Log in to PostPilot
            </h1>
            <FieldDescription className="text-base text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline transition-colors"
              >
                Sign up
              </Link>
            </FieldDescription>
          </div>
          <Field className="gap-2 mt-1">
            <Button
              asChild
              className="w-full h-12 rounded-xl active:scale-[0.98] transition-transform bg-[#09090B] hover:bg-white/5 text-foreground border border-white/10 font-medium"
            >
              <a href="/api/auth/google">
                <Icons.google className="size-5 mr-3" />
                Continue with Google
              </a>
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

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
                  className="h-12 rounded-xl bg-[#09090B] border-white/10 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all"
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
                  placeholder="Enter password"
                  disabled={isPending}
                  className="h-12 rounded-xl bg-[#09090B] border-white/10 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Field className="mt-1">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,71,255,0.15)] transition-all"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log in
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
