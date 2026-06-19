"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Laptop },
] as const;

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  if (!theme) {
    return (
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how PostPilot AI looks on your device.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 md:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 rounded-xl border border-input p-4"
              >
                <div className="size-6 animate-pulse rounded-xl bg-muted" />
                <div className="h-4 w-12 animate-pulse rounded-xl bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how PostPilot AI looks on your device.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 md:p-6">
        <RadioGroup
          value={theme ?? "system"}
          onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
          className="grid gap-3 sm:grid-cols-3"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Label
                key={option.value}
                htmlFor={`theme-${option.value}`}
                className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-input p-4 transition-all hover:bg-accent/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`theme-${option.value}`}
                  className="sr-only"
                />
                <Icon className="size-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </Label>
            );
          })}
        </RadioGroup>
      </div>
    </section>
  );
}
