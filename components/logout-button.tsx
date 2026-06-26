"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  className,
  variant = "outline",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick" | "disabled"> & { variant?: React.ComponentProps<typeof Button>["variant"] }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <Button
      className={className}
      variant={variant}
      onClick={handleLogout}
      {...props}
    >
      Sign Out
    </Button>
  );
}
