"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/schemas/settings.schema";

function formatAccountType(
  dbValue: string | null | undefined,
): "Influencer" | "Brand" | undefined {
  if (dbValue === "INFLUENCER") return "Influencer";
  if (dbValue === "BRAND") return "Brand";
  return undefined;
}

interface ProfileFormProps {
  id: string;
  name: string;
  email: string;
  accountName: string | null;
  industry: string | null;
  accountType: "BRAND" | "INFLUENCER" | null;
  description: string | null;
}

export function ProfileForm({
  id,
  name,
  email,
  accountName,
  industry,
  accountType,
  description,
}: ProfileFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: name ?? "",
      accountName: accountName ?? "",
      industry: industry ?? "",
      accountType: formatAccountType(accountType),
      description: description ?? "",
    },
  });

  const isDirty = form.formState.isDirty;

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const profileMutation = useMutation({
    mutationKey: ["updateProfile", id],
    mutationFn: async (data: ProfileFormValues): Promise<unknown> => {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated.");
    },
    onError: () => {
      toast.error("Failed to update profile. Please try again.");
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-xs text-muted-foreground font-medium"
                htmlFor="name"
              >
                Display Name
              </FieldLabel>
              <Input
                {...field}
                id="name"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="Your name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="accountName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-xs text-muted-foreground font-medium"
                htmlFor="accountName"
              >
                Brand / Influencer Name
              </FieldLabel>
              <Input
                {...field}
                id="accountName"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="Your brand or influencer name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <FieldLabel
            className="text-xs text-muted-foreground font-medium"
            htmlFor="email"
          >
            Email
          </FieldLabel>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              tabIndex={-1}
              className="pr-24"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" />
              Verified
            </span>
          </div>
        </Field>

        <Controller
          name="accountType"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                className="text-xs text-muted-foreground font-medium"
                htmlFor="accountType"
              >
                Account Type
              </FieldLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger id="accountType" className="w-full">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Influencer">Influencer</SelectItem>
                  <SelectItem value="Brand">Brand</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
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
                Industry
              </FieldLabel>
              <Input
                {...field}
                id="industry"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="e.g. Technology, Fashion, Health"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-xs text-muted-foreground font-medium"
                htmlFor="description"
              >
                Description
              </FieldLabel>
              <Textarea
                {...field}
                id="description"
                aria-invalid={fieldState.invalid}
                placeholder="Tell us about yourself or your brand"
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {field.value.length}/500
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="mt-8 flex justify-end gap-2">
        {isDirty && (
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        )}
        <Button type="submit" disabled={profileMutation.isPending}>
          {profileMutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
