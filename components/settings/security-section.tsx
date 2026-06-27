"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import {
  passwordChangeSchema,
  type PasswordChangeValues,
} from "@/lib/schemas/settings.schema";
import { useUserProfile } from "@/lib/hooks/use-user-profile";

export function SecuritySection() {
  const { data: user, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <section>
        <div className="mb-6">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Security
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            Update your password. You&apos;ll be logged out of all active
            sessions after changing it.
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-white/5 dark:backdrop-blur-xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded-xl bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-xl bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-32 animate-pulse rounded-xl bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="flex sm:justify-end">
              <div className="h-9 w-full sm:w-36 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!user) return null;

  if (user.provider === "GOOGLE") {
    return (
      <section>
        <div className="mb-6">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Security
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            Manage your account security.
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-white/5 dark:backdrop-blur-xl">
          <Alert variant="info">
            <Info className="size-4" />
            <AlertDescription>
              You&apos;re signed in with Google. No password required.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  if (user.provider !== "CREDENTIALS") return null;

  return <SecurityForm />;
}

function SecurityForm() {
  const form = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const passwordMutation = useMutation({
    mutationKey: ["changePassword"],
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }): Promise<unknown> => {
      const res = await fetch("/api/dashboard/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to update password");
      }
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      toast.success("Password updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update password.",
      );
    },
  });

  useEffect(() => {
    if (passwordMutation.isSuccess) {
      window.location.href = "/login?reason=password-changed";
    }
  }, [passwordMutation.isSuccess]);

  const onSubmit = (data: PasswordChangeValues) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Security
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground/80">
          Update your password. You&apos;ll be logged out of all active sessions
          after changing it.
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-4 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-white/5 dark:backdrop-blur-xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.currentPassword}>
              <FieldLabel
                className="text-xs text-muted-foreground font-medium"
                htmlFor="currentPassword"
              >
                Current Password
              </FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                aria-invalid={!!form.formState.errors.currentPassword}
                placeholder="Enter current password"
                {...form.register("currentPassword")}
              />
              {form.formState.errors.currentPassword && (
                <FieldError errors={[form.formState.errors.currentPassword]} />
              )}
            </Field>

            <Field data-invalid={!!form.formState.errors.newPassword}>
              <FieldLabel
                className="text-xs text-muted-foreground font-medium"
                htmlFor="newPassword"
              >
                New Password
              </FieldLabel>
              <Input
                id="newPassword"
                type="password"
                aria-invalid={!!form.formState.errors.newPassword}
                placeholder="Enter new password"
                {...form.register("newPassword")}
              />
              {form.formState.errors.newPassword && (
                <FieldError errors={[form.formState.errors.newPassword]} />
              )}
            </Field>

            <Field data-invalid={!!form.formState.errors.confirmNewPassword}>
              <FieldLabel
                className="text-xs text-muted-foreground font-medium"
                htmlFor="confirmNewPassword"
              >
                Confirm New Password
              </FieldLabel>
              <Input
                id="confirmNewPassword"
                type="password"
                aria-invalid={!!form.formState.errors.confirmNewPassword}
                placeholder="Confirm new password"
                {...form.register("confirmNewPassword")}
              />
              {form.formState.errors.confirmNewPassword && (
                <FieldError
                  errors={[form.formState.errors.confirmNewPassword]}
                />
              )}
            </Field>
          </FieldGroup>

          <div className="mt-8 flex sm:justify-end">
            <Button
              type="submit"
              disabled={passwordMutation.isPending}
              className="w-full sm:w-auto"
            >
              {passwordMutation.isPending ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
