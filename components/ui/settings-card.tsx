import { cn } from "@/lib/utils";

interface SettingsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SettingsCard({
  className,
  children,
  ...props
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card p-4 md:p-6 shadow-sm dark:bg-white/5 dark:backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
