"use client";

import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";

export function LogoutButton({
  className,
  variant = "outline",
  ...props
}: ButtonProps) {
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
